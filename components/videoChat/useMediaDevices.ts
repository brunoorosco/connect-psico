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
    error: null,
  });

  const isSupported = useCallback(() => typeof navigator !== 'undefined' && !!navigator.mediaDevices?.enumerateDevices, []);

  const getPreferredDevice = (
    savedId: string | null,
    devices: MediaDevice[]
  ): string | null => {
    return (
      savedId ||
      devices.find((d) => d.deviceId === 'default')?.deviceId ||
      devices[0]?.deviceId ||
      null
    );
  };

  const checkPermissions = useCallback(async () => {
    if (!navigator.permissions) {
      console.warn('⚠️ Permissions API not supported');
      return { audio: false, video: false };
    }

    try {
      const [audioPermission, videoPermission] = await Promise.all([
        navigator.permissions.query({ name: 'microphone' as PermissionName }),
        navigator.permissions.query({ name: 'camera' as PermissionName }),
      ]);

      return {
        audio: audioPermission.state === 'granted',
        video: videoPermission.state === 'granted',
      };
    } catch (error) {
      console.error('Error checking permissions:', error);
      return { audio: false, video: false };
    }
  }, []);

  const requestPermissions = useCallback(
    async (audio: boolean = true, video: boolean = true) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const constraints: MediaStreamConstraints = {};
        if (audio) constraints.audio = true;
        if (video) constraints.video = true;

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        stream.getTracks().forEach((track) => track.stop());

        const permissions = await checkPermissions();

        setState((prev) => ({
          ...prev,
          hasAudioPermission: permissions.audio,
          hasVideoPermission: permissions.video,
          isLoading: false,
        }));

        return permissions;
      } catch (error) {
        console.error('❌ Error requesting permissions:', error);
        setState((prev) => ({
          ...prev,
          error: `Erro ao solicitar permissões: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          isLoading: false,
        }));
        return { audio: false, video: false };
      }
    },
    [checkPermissions]
  );

  const loadSavedPreferences = useCallback((devices: MediaDevice[]) => {
    try {
      const storedDevices: StoredDevice[] = devices.map((d) => ({
        deviceId: d.deviceId,
        label: d.label,
        kind: d.kind,
      }));

      deviceStorage.saveAvailableDevices(storedDevices);
      deviceStorage.cleanupPreferences(storedDevices);
      return deviceStorage.selectDefaultDevices(storedDevices);
    } catch (error) {
      console.error('❌ Error loading preferences:', error);
      return {
        audioInputId: null,
        videoInputId: null,
        audioOutputId: null,
        lastUpdated: Date.now(),
      };
    }
  }, []);

  const enumerateDevices = useCallback(async () => {
    if (!isSupported()) {
      setState((prev) => ({
        ...prev,
        error: 'API de dispositivos de mídia não suportada',
        isLoading: false,
      }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const devices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.deviceId && device.kind);

      const audioInputs: MediaDevice[] = [];
      const videoInputs: MediaDevice[] = [];
      const audioOutputs: MediaDevice[] = [];

      devices.forEach((device) => {
        const mediaDevice: MediaDevice = {
          deviceId: device.deviceId,
          label: device.label || `${device.kind} ${device.deviceId.slice(0, 8)}`,
          kind: device.kind,
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

      const allDevices = [...audioInputs, ...videoInputs, ...audioOutputs];
      const savedPrefs = loadSavedPreferences(allDevices);

      const selectedAudioInput = getPreferredDevice(savedPrefs.audioInputId, audioInputs);
      const selectedVideoInput = getPreferredDevice(savedPrefs.videoInputId, videoInputs);
      const selectedAudioOutput = getPreferredDevice(savedPrefs.audioOutputId, audioOutputs);

      setState((prev) => ({
        ...prev,
        audioInputs,
        videoInputs,
        audioOutputs,
        selectedAudioInput,
        selectedVideoInput,
        selectedAudioOutput,
        isLoading: false,
      }));

      console.log('🎛️ Devices enumerated:', {
        audioInputs: audioInputs.length,
        videoInputs: videoInputs.length,
        audioOutputs: audioOutputs.length,
        selectedAudioInput,
        selectedVideoInput,
        selectedAudioOutput,
      });
    } catch (error) {
      console.error('❌ Error enumerating devices:', error);
      setState((prev) => ({
        ...prev,
        error: `Erro ao listar dispositivos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        isLoading: false,
      }));
    }
  }, [isSupported, loadSavedPreferences]);

  const testAudioDevice = useCallback(async (deviceId?: string): Promise<boolean> => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
        video: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      stream.getTracks().forEach((track) => track.stop());
      audioContext.close();
      return true;
    } catch (error) {
      console.error('❌ Audio device test failed:', error);
      return false;
    }
  }, []);

  const testVideoDevice = useCallback(async (deviceId?: string): Promise<boolean> => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const videoTrack = stream.getVideoTracks()[0];
      const hasVideo = videoTrack && videoTrack.readyState === 'live';
      stream.getTracks().forEach((track) => track.stop());
      return hasVideo;
    } catch (error) {
      console.error('❌ Video device test failed:', error);
      return false;
    }
  }, []);

  const selectAudioInput = useCallback((deviceId: string) => {
    setState((prev) => ({ ...prev, selectedAudioInput: deviceId }));
  }, []);

  const selectVideoInput = useCallback((deviceId: string) => {
    setState((prev) => ({ ...prev, selectedVideoInput: deviceId }));
  }, []);

  const selectAudioOutput = useCallback((deviceId: string) => {
    setState((prev) => ({ ...prev, selectedAudioOutput: deviceId }));
  }, []);

  const getCapabilities = useCallback((): DeviceCapabilities => {
    return {
      audio: {
        available: state.audioInputs.length > 0,
        permission: state.hasAudioPermission,
        devices: state.audioInputs,
        selectedDevice: state.selectedAudioInput,
      },
      video: {
        available: state.videoInputs.length > 0,
        permission: state.hasVideoPermission,
        devices: state.videoInputs,
        selectedDevice: state.selectedVideoInput,
      },
      audioOutput: {
        available: state.audioOutputs.length > 0,
        devices: state.audioOutputs,
        selectedDevice: state.selectedAudioOutput,
      },
    };
  }, [state]);

  const refreshDevices = useCallback(async () => {
    console.log('🔄 Refreshing devices list...');
    await enumerateDevices();
  }, [enumerateDevices]);

  const getMediaStream = useCallback(
    async (constraints: { audio?: boolean; video?: boolean } = {}) => {
      try {
        const mediaConstraints: MediaStreamConstraints = {};

        if (constraints.audio && state.selectedAudioInput) {
          mediaConstraints.audio = { deviceId: { exact: state.selectedAudioInput } };
        } else if (constraints.audio) {
          mediaConstraints.audio = true;
        }

        if (constraints.video && state.selectedVideoInput) {
          mediaConstraints.video = { deviceId: { exact: state.selectedVideoInput } };
        } else if (constraints.video) {
          mediaConstraints.video = true;
        }

        const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
        return stream;
      } catch (error) {
        console.error('❌ Error getting media stream:', error);
        throw error;
      }
    },
    [state.selectedAudioInput, state.selectedVideoInput]
  );

  useEffect(() => {
    const initialize = async () => {
      if (!isSupported()) {
        setState((prev) => ({
          ...prev,
          error: 'Dispositivos de mídia não suportados neste navegador',
          isLoading: false,
        }));
        return;
      }

      const permissions = await checkPermissions();
      setState((prev) => ({
        ...prev,
        hasAudioPermission: permissions.audio,
        hasVideoPermission: permissions.video,
      }));

      await enumerateDevices();
    };

    initialize();
  }, [isSupported, checkPermissions, enumerateDevices]);

  useEffect(() => {
    if (!isSupported()) return;

    const handleDeviceChange = () => {
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
    getMediaStream,
  };
}
