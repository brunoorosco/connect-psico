// Configurações WebRTC otimizadas para diferentes dispositivos

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  mediaConstraints: MediaStreamConstraints;
  peerConnectionConfig: RTCConfiguration;
  codecPreferences?: string[];
}

export function getWebRTCConfig(isMobile: boolean, isIOS: boolean, isAndroid: boolean): WebRTCConfig {
  // Servidores STUN/TURN
  const iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ];

  // Configurações de mídia baseadas no dispositivo
  const getMediaConstraints = (): MediaStreamConstraints => {
    if (isMobile) {
      return {
        video: {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          frameRate: { ideal: 15, max: 30 },
          facingMode: 'user', // Câmera frontal por padrão
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1, // Mono para economizar banda
        },
      };
    }

    // Desktop - qualidade maior
    return {
      video: {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 60 },
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 44100,
        channelCount: 2, // Stereo
      },
    };
  };

  // Configuração da conexão peer
  const getPeerConnectionConfig = (): RTCConfiguration => {
    const baseConfig: RTCConfiguration = {
      iceServers,
      iceCandidatePoolSize: 10,
    };

    if (isMobile) {
      return {
        ...baseConfig,
        // Configurações específicas para mobile
        iceTransportPolicy: 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
      };
    }

    return baseConfig;
  };

  // Preferências de codec baseadas na plataforma
  const getCodecPreferences = (): string[] => {
    if (isIOS) {
      // iOS prefere H.264
      return ['video/H264', 'video/VP8', 'video/VP9'];
    }

    if (isAndroid) {
      // Android tem melhor suporte para VP8/VP9
      return ['video/VP8', 'video/VP9', 'video/H264'];
    }

    // Desktop - usar VP9 se disponível
    return ['video/VP9', 'video/VP8', 'video/H264'];
  };

  return {
    iceServers,
    mediaConstraints: getMediaConstraints(),
    peerConnectionConfig: getPeerConnectionConfig(),
    codecPreferences: getCodecPreferences(),
  };
}

// Configurações específicas para diferentes cenários
export const MOBILE_OPTIMIZATIONS = {
  // Reduzir bitrate para conexões móveis
  maxBitrate: {
    video: 500000, // 500 kbps
    audio: 64000,  // 64 kbps
  },
  
  // Timeouts mais longos para redes móveis instáveis
  timeouts: {
    iceGatheringTimeout: 10000, // 10s
    connectionTimeout: 15000,   // 15s
    reconnectTimeout: 5000,     // 5s
  },

  // Configurações de retry
  retry: {
    maxAttempts: 3,
    backoffMultiplier: 2,
    initialDelay: 1000,
  },
};

export const DESKTOP_OPTIMIZATIONS = {
  maxBitrate: {
    video: 2000000, // 2 Mbps
    audio: 128000,  // 128 kbps
  },
  
  timeouts: {
    iceGatheringTimeout: 5000,
    connectionTimeout: 10000,
    reconnectTimeout: 3000,
  },

  retry: {
    maxAttempts: 5,
    backoffMultiplier: 1.5,
    initialDelay: 500,
  },
};

// Função para aplicar otimizações de bitrate
export function applyBitrateOptimizations(
  sender: RTCRtpSender,
  isMobile: boolean
): void {
  const params = sender.getParameters();
  if (!params.encodings || params.encodings.length === 0) {
    return;
  }

  const optimizations = isMobile ? MOBILE_OPTIMIZATIONS : DESKTOP_OPTIMIZATIONS;
  
  params.encodings.forEach((encoding) => {
    if (sender.track?.kind === 'video') {
      encoding.maxBitrate = optimizations.maxBitrate.video;
    } else if (sender.track?.kind === 'audio') {
      encoding.maxBitrate = optimizations.maxBitrate.audio;
    }
  });

  sender.setParameters(params).catch(console.error);
}

// Função para detectar e lidar com problemas de conectividade
export function handleMobileConnectivityIssues(
  peerConnection: RTCPeerConnection,
  onConnectionStateChange: (state: RTCPeerConnectionState) => void
): void {
  let reconnectAttempts = 0;
  const maxReconnectAttempts = MOBILE_OPTIMIZATIONS.retry.maxAttempts;

  peerConnection.addEventListener('connectionstatechange', () => {
    const state = peerConnection.connectionState;
    onConnectionStateChange(state);

    if (state === 'failed' || state === 'disconnected') {
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = MOBILE_OPTIMIZATIONS.retry.initialDelay * 
                     Math.pow(MOBILE_OPTIMIZATIONS.retry.backoffMultiplier, reconnectAttempts - 1);
        
        setTimeout(() => {
          // Tentar reconectar
          peerConnection.restartIce();
        }, delay);
      }
    } else if (state === 'connected') {
      // Reset contador de tentativas em caso de sucesso
      reconnectAttempts = 0;
    }
  });
}

