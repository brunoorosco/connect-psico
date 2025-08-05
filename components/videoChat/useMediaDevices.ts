'use client';

import { useState, useEffect, useCallback } from 'react';
import { deviceStorage, type DevicePreferences, type StoredDevice } from '@/infra/storage/deviceStorage';

interface MediaDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

interface MediaDevicesState {
  audioInputs: MediaDevice[];
  videoInputs: MediaDevice[];
  audioOutputs: MediaDevice[];
  selectedAudioInput: string | null;
  selectedVideoInput: string | null;
  selectedAudioOutput: string | null;
  hasAudioPermission: boolean;
  hasVideoPermission: boolean;
  isLoading: boolean;
  error: string | null;
}

interface DeviceCapabilities {
  audio: {
    available: boolean;
    permission: boolean;
    devices: MediaDevice[];
    selectedDevice: string | null;
  };
  video: {
    available: boolean;
    permission: boolean;
    devices: MediaDevice[];
    selectedDevice: string | null;
  };
  audioOutput: {
    available: boolean;
    devices: MediaDevice[];
    selectedDevice: string | null;
  };
}

export function useMediaDevices() {
  const [state, setState] = useState<MediaDevicesState>({
    audioInputs: [],
    videoInputs: [],
    audioOutputs: [],
    selectedAudioInput: null,
    selectedVideoInput: null,
    selectedAudioOutput: null,
    hasAudioPermission: false,
    hasVideoPermission: false,
    isLoading: true,
    error: null
  });

  // Check if MediaDevices API is supported
  const isSupported = useCallback(() => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices);
  }, []);

  // Check permissions for media devices
  const checkPermissions = useCallback(async () => {
    if (!navigator.permissions) {
      console.warn('⚠️ Permissions API not supported');
      return { audio: false, video: false };
    }

    try {
      const [audioPermission, videoPermission] = await Promise.all([
        navigator.permissions.query({ name: 'microphone' as PermissionName }),
        navigator.permissions.query({ name: 'camera' as PermissionName })
      ]);

      const audioGranted = audioPermission.state === 'granted';
      const videoGranted = videoPermission.state === 'granted';

      console.log('🔐 Permissions check:', { audio: audioGranted, video: videoGranted });

      return { audio: audioGranted, video: videoGranted };
    } catch (error) {
      console.error('Error checking permissions:', error);
      return { audio: false, video: false };
    }
  }, []);

  // Request permissions for media devices
  const requestPermissions = useCallback(async (audio: boolean = true, video: boolean = true) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const constraints: MediaStreamConstraints = {};
      if (audio) constraints.audio = true;
      if (video) constraints.video = true;

      console.log('🔑 Requesting permissions:', constraints);

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Stop the stream immediately as we only needed permissions
      stream.getTracks().forEach(track => track.stop());

      const permissions = await checkPermissions();
      
      setState(prev => ({
        ...prev,
        hasAudioPermission: permissions.audio,
        hasVideoPermission: permissions.video,
        isLoading: false
      }));

      console.log('✅ Permissions granted:', permissions);
      return permissions;
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      
      setState(prev => ({
        ...prev,
        error: `Erro ao solicitar permissões: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        isLoading: false
      }));
      
      return { audio: false, video: false };
    }
  }, [checkPermissions]);

  // Load saved preferences from localStorage
  const loadSavedPreferences = useCallback((devices: MediaDevice[]) => {
    try {
      // Convert to StoredDevice format
      const storedDevices: StoredDevice[] = devices.map(d => ({
        deviceId: d.deviceId,
        label: d.label,
        kind: d.kind
      }));

      // Save current devices list
      deviceStorage.saveAvailableDevices(storedDevices);

      // Clean up invalid preferences
      const cleanedPrefs = deviceStorage.cleanupPreferences(storedDevices);

      // Select default devices if needed
      const finalPrefs = deviceStorage.selectDefaultDevices(storedDevices);

      console.log('📖 Loaded preferences:', finalPrefs);

      return finalPrefs;
    } catch (error) {
      console.error('❌ Error loading preferences:', error);
      return {
        audioInputId: null,
        videoInputId: null,
        audioOutputId: null,
        lastUpdated: Date.now()
      };
    }
  }, []);

  // Enumerate available devices
  const enumerateDevices = useCallback(async () => {
    if (!isSupported()) {
      setState(prev => ({
        ...prev,
        error: 'API de dispositivos de mídia não suportada',
        isLoading: false
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const audioInputs: MediaDevice[] = [];
      const videoInputs: MediaDevice[] = [];
      const audioOutputs: MediaDevice[] = [];

      devices.forEach(device => {
        const mediaDevice: MediaDevice = {
          deviceId: device.deviceId,
          label: device.label || `${device.kind} ${device.deviceId.slice(0, 8)}`,
          kind: device.kind
        };

        switch (device.kind) {
          case 'audioinput':
            audioInputs.push(mediaDevice);
            break;
          case 'videoinput':
            videoInputs.push(mediaDevice);
            break;
          case 'audiooutput':
            audioOutputs.push(mediaDevice);
            break;
        }
      });

      // Load saved preferences
      const allDevices = [...audioInputs, ...videoInputs, ...audioOutputs];
      const savedPrefs = loadSavedPreferences(allDevices);

      // Apply saved preferences or set defaults
      const selectedAudioInput = savedPrefs.audioInputId || 
        audioInputs.find(d => d.deviceId === 'default')?.deviceId || 
        audioInputs[0]?.deviceId || null;

      const selectedVideoInput = savedPrefs.videoInputId || 
        videoInputs.find(d => d.deviceId === 'default')?.deviceId || 
        videoInputs[0]?.deviceId || null;

      const selectedAudioOutput = savedPrefs.audioOutputId || 
        audioOutputs.find(d => d.deviceId === 'default')?.deviceId || 
        audioOutputs[0]?.deviceId || null;

      setState(prev => ({
        ...prev,
        audioInputs,
        videoInputs,
        audioOutputs,
        selectedAudioInput,
        selectedVideoInput,
        selectedAudioOutput,
        isLoading: false
      }));

      console.log('🎛️ Devices enumerated:', {
        audioInputs: audioInputs.length,
        videoInputs: videoInputs.length,
        audioOutputs: audioOutputs.length,
        selectedAudioInput,
        selectedVideoInput,
        selectedAudioOutput
      });

    } catch (error) {
      console.error('❌ Error enumerating devices:', error);
      setState(prev => ({
        ...prev,
        error: `Erro ao listar dispositivos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        isLoading: false
      }));
    }
  }, [isSupported, loadSavedPreferences]);

  // Test audio device
  const testAudioDevice = useCallback(async (deviceId?: string): Promise<boolean> => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
        video: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Test if we can get audio data
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);

      // Clean up
      stream.getTracks().forEach(track => track.stop());
      audioContext.close();

      console.log('✅ Audio device test passed');
      return true;
    } catch (error) {
      console.error('❌ Audio device test failed:', error);
      return false;
    }
  }, []);

  // Test video device
  const testVideoDevice = useCallback(async (deviceId?: string): Promise<boolean> => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: deviceId ? { deviceId: { exact: deviceId } } : true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Test if we can get video data
      const videoTrack = stream.getVideoTracks()[0];
      const hasVideo = videoTrack && videoTrack.readyState === 'live';

      // Clean up
      stream.getTracks().forEach(track => track.stop());

      console.log('✅ Video device test passed');
      return hasVideo;
    } catch (error) {
      console.error('❌ Video device test failed:', error);
      return false;
    }
  }, []);

  // Select audio input device and save to localStorage
  const selectAudioInput = useCallback((deviceId: string) => {
    setState(prev => ({ ...prev, selectedAudioInput: deviceId }));
    
    // Save to localStorage
    deviceStorage.saveDevicePreferences({ audioInputId: deviceId });
    
    console.log('🎤 Selected audio input:', deviceId);
  }, []);

  // Select video input device and save to localStorage
  const selectVideoInput = useCallback((deviceId: string) => {
    setState(prev => ({ ...prev, selectedVideoInput: deviceId }));
    
    // Save to localStorage
    deviceStorage.saveDevicePreferences({ videoInputId: deviceId });
    
    console.log('📹 Selected video input:', deviceId);
  }, []);

  // Select audio output device and save to localStorage
  const selectAudioOutput = useCallback((deviceId: string) => {
    setState(prev => ({ ...prev, selectedAudioOutput: deviceId }));
    
    // Save to localStorage
    deviceStorage.saveDevicePreferences({ audioOutputId: deviceId });
    
    console.log('🔊 Selected audio output:', deviceId);
  }, []);

  // Get device capabilities summary
  const getCapabilities = useCallback((): DeviceCapabilities => {
    return {
      audio: {
        available: state.audioInputs.length > 0,
        permission: state.hasAudioPermission,
        devices: state.audioInputs,
        selectedDevice: state.selectedAudioInput
      },
      video: {
        available: state.videoInputs.length > 0,
        permission: state.hasVideoPermission,
        devices: state.videoInputs,
        selectedDevice: state.selectedVideoInput
      },
      audioOutput: {
        available: state.audioOutputs.length > 0,
        devices: state.audioOutputs,
        selectedDevice: state.selectedAudioOutput
      }
    };
  }, [state]);

  // Refresh devices list
  const refreshDevices = useCallback(async () => {
    console.log('🔄 Refreshing devices list...');
    await enumerateDevices();
  }, [enumerateDevices]);

  // Get media stream with selected devices
  const getMediaStream = useCallback(async (constraints: { audio?: boolean; video?: boolean } = {}) => {
    try {
      const mediaConstraints: MediaStreamConstraints = {};

      if (constraints.audio && state.selectedAudioInput) {
        mediaConstraints.audio = {
          deviceId: { exact: state.selectedAudioInput }
        };
      } else if (constraints.audio) {
        mediaConstraints.audio = true;
      }

      if (constraints.video && state.selectedVideoInput) {
        mediaConstraints.video = {
          deviceId: { exact: state.selectedVideoInput }
        };
      } else if (constraints.video) {
        mediaConstraints.video = true;
      }

      console.log('🎥 Getting media stream with constraints:', mediaConstraints);
      
      const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      return stream;
    } catch (error) {
      console.error('❌ Error getting media stream:', error);
      throw error;
    }
  }, [state.selectedAudioInput, state.selectedVideoInput]);

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      if (!isSupported()) {
        setState(prev => ({
          ...prev,
          error: 'Dispositivos de mídia não suportados neste navegador',
          isLoading: false
        }));
        return;
      }

      // Check initial permissions
      const permissions = await checkPermissions();
      setState(prev => ({
        ...prev,
        hasAudioPermission: permissions.audio,
        hasVideoPermission: permissions.video
      }));

      // Enumerate devices
      await enumerateDevices();
    };

    initialize();
  }, [isSupported, checkPermissions, enumerateDevices]);

  // Listen for device changes
  useEffect(() => {
    if (!isSupported()) return;

    const handleDeviceChange = () => {
      console.log('🔄 Device change detected');
      enumerateDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [isSupported, enumerateDevices]);

  return {
    ...state,
    isSupported: isSupported(),
    capabilities: getCapabilities(),
    requestPermissions,
    testAudioDevice,
    testVideoDevice,
    selectAudioInput,
    selectVideoInput,
    selectAudioOutput,
    refreshDevices,
    getMediaStream
  };
}

