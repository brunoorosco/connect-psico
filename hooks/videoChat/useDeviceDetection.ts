'use client';

import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  screenSize: 'sm' | 'md' | 'lg' | 'xl';
  orientation: 'portrait' | 'landscape';
  supportsWebRTC: boolean;
  supportsGetUserMedia: boolean;
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isChrome: false,
    screenSize: 'lg',
    orientation: 'landscape',
    supportsWebRTC: false,
    supportsGetUserMedia: false,
  });

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Detectar tipo de dispositivo
      const isMobile = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || width < 768;
      const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent) || (width >= 768 && width < 1024);
      const isDesktop = !isMobile && !isTablet;

      // Detectar sistema operacional
      const isIOS = /ipad|iphone|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);

      // Detectar navegador
      const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
      const isChrome = /chrome/.test(userAgent);

      // Detectar tamanho da tela
      let screenSize: 'sm' | 'md' | 'lg' | 'xl' = 'lg';
      if (width < 640) screenSize = 'sm';
      else if (width < 768) screenSize = 'md';
      else if (width < 1024) screenSize = 'lg';
      else screenSize = 'xl';

      // Detectar orientação
      const orientation = height > width ? 'portrait' : 'landscape';

      // Verificar suporte WebRTC
      const supportsWebRTC = !!(
        window.RTCPeerConnection ||
        (window as any).webkitRTCPeerConnection ||
        (window as any).mozRTCPeerConnection
      );

      // Verificar suporte getUserMedia
      const supportsGetUserMedia = !!(
        navigator.mediaDevices?.getUserMedia ||
        (navigator as any).getUserMedia ||
        (navigator as any).webkitGetUserMedia ||
        (navigator as any).mozGetUserMedia
      );

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isIOS,
        isAndroid,
        isSafari,
        isChrome,
        screenSize,
        orientation,
        supportsWebRTC,
        supportsGetUserMedia,
      });
    };

    // Detectar na inicialização
    detectDevice();

    // Detectar mudanças de orientação/redimensionamento
    const handleResize = () => {
      detectDevice();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return deviceInfo;
}

