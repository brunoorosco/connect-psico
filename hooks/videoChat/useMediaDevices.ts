'use client';

import { useState, useEffect, useCallback } from 'react';

export interface MediaDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export function useMediaDevices() {
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDevice[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDevice[]>([]);
  const [videoInputDevices, setVideoInputDevices] = useState<MediaDevice[]>([]);
  const [selectedAudioInput, setSelectedAudioInput] = useState<string>('');
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string>('');
  const [selectedVideoInput, setSelectedVideoInput] = useState<string>('');
  const [hasPermissions, setHasPermissions] = useState(false);

  // Carregar dispositivos
  const loadDevices = useCallback(async () => {
    try {
      // Solicitar permissões primeiro
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: true 
      });
      
      // Parar o stream temporário
      stream.getTracks().forEach(track => track.stop());
      
      setHasPermissions(true);
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
      const videoInputs = devices.filter(device => device.kind === 'videoinput');
      
      setAudioInputDevices(audioInputs.map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `Microfone ${index + 1}`,
        kind: device.kind
      })));
      
      setAudioOutputDevices(audioOutputs.map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `Alto-falante ${index + 1}`,
        kind: device.kind
      })));
      
      setVideoInputDevices(videoInputs.map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `Câmera ${index + 1}`,
        kind: device.kind
      })));

      // Definir dispositivos padrão se não estiverem selecionados
      if (audioInputs.length > 0 && !selectedAudioInput) {
        setSelectedAudioInput(audioInputs[0].deviceId);
      }
      if (audioOutputs.length > 0 && !selectedAudioOutput) {
        setSelectedAudioOutput(audioOutputs[0].deviceId);
      }
      if (videoInputs.length > 0 && !selectedVideoInput) {
        setSelectedVideoInput(videoInputs[0].deviceId);
      }
    } catch (error) {
      console.error('Erro ao carregar dispositivos:', error);
      setHasPermissions(false);
    }
  }, [selectedAudioInput, selectedAudioOutput, selectedVideoInput]);

  // Obter stream com dispositivos específicos
  const getStreamWithDevices = useCallback(async (constraints?: {
    audioDeviceId?: string;
    videoDeviceId?: string;
    audio?: boolean;
    video?: boolean;
  }) => {
    try {
      const audioConstraints = constraints?.audio !== false ? {
        deviceId: constraints?.audioDeviceId || selectedAudioInput || undefined
      } : false;

      const videoConstraints = constraints?.video !== false ? {
        deviceId: constraints?.videoDeviceId || selectedVideoInput || undefined
      } : false;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
        video: videoConstraints
      });

      return stream;
    } catch (error) {
      console.error('Erro ao obter stream:', error);
      throw error;
    }
  }, [selectedAudioInput, selectedVideoInput]);

  // Testar dispositivo de áudio
  const testAudioDevice = useCallback(async (deviceId?: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: deviceId || selectedAudioInput || undefined }
      });

      // Criar contexto de áudio para análise
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);

      // Analisar áudio por alguns segundos
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      return new Promise<boolean>((resolve) => {
        let hasAudio = false;
        const checkAudio = () => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          
          if (average > 10) { // Threshold para detectar áudio
            hasAudio = true;
          }
        };

        const interval = setInterval(checkAudio, 100);
        
        setTimeout(() => {
          clearInterval(interval);
          stream.getTracks().forEach(track => track.stop());
          audioContext.close();
          resolve(hasAudio);
        }, 3000);
      });
    } catch (error) {
      console.error('Erro ao testar áudio:', error);
      return false;
    }
  }, [selectedAudioInput]);

  // Testar dispositivo de vídeo
  const testVideoDevice = useCallback(async (deviceId?: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: deviceId || selectedVideoInput || undefined }
      });

      // Retornar stream para preview
      return stream;
    } catch (error) {
      console.error('Erro ao testar vídeo:', error);
      throw error;
    }
  }, [selectedVideoInput]);

  // Alterar dispositivo de áudio de saída
  const setAudioOutputDevice = useCallback(async (deviceId: string, audioElement?: HTMLAudioElement) => {
    try {
      if (audioElement && 'setSinkId' in audioElement) {
        await (audioElement as any).setSinkId(deviceId);
        setSelectedAudioOutput(deviceId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao alterar dispositivo de saída:', error);
      return false;
    }
  }, []);

  // Carregar dispositivos na inicialização
  useEffect(() => {
    loadDevices();

    // Escutar mudanças nos dispositivos
    const handleDeviceChange = () => {
      loadDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [loadDevices]);

  return {
    audioInputDevices,
    audioOutputDevices,
    videoInputDevices,
    selectedAudioInput,
    selectedAudioOutput,
    selectedVideoInput,
    hasPermissions,
    setSelectedAudioInput,
    setSelectedAudioOutput,
    setSelectedVideoInput,
    loadDevices,
    getStreamWithDevices,
    testAudioDevice,
    testVideoDevice,
    setAudioOutputDevice
  };
}

