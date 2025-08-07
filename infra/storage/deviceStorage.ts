'use client';

interface DevicePreferences {
  audioInputId: string | null;
  videoInputId: string | null;
  audioOutputId: string | null;
  lastUpdated: number;
}

interface StoredDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

const STORAGE_KEY = 'videochat-device-preferences';
const DEVICES_KEY = 'videochat-available-devices';
const STORAGE_VERSION = '1.0';

class DeviceStorageManager {
  private isClient(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  /**
   * Salva as preferências de dispositivos no localStorage
   */
  saveDevicePreferences(preferences: Partial<DevicePreferences>): void {
    if (!this.isClient()) {
      console.warn('⚠️ localStorage não disponível (SSR)');
      return;
    }

    try {
      const currentPrefs = this.getDevicePreferences();
      const updatedPrefs: DevicePreferences = {
        ...currentPrefs,
        ...preferences,
        lastUpdated: Date.now()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: STORAGE_VERSION,
        data: updatedPrefs
      }));

      console.log('💾 Preferências de dispositivos salvas:', updatedPrefs);
    } catch (error) {
      console.error('❌ Erro ao salvar preferências:', error);
    }
  }

  /**
   * Carrega as preferências de dispositivos do localStorage
   */
  getDevicePreferences(): DevicePreferences {
    if (!this.isClient()) {
      return this.getDefaultPreferences();
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return this.getDefaultPreferences();
      }

      const parsed = JSON.parse(stored);
      
      // Verificar versão para compatibilidade
      if (parsed.version !== STORAGE_VERSION) {
        console.log('🔄 Versão do storage desatualizada, resetando...');
        this.clearDevicePreferences();
        return this.getDefaultPreferences();
      }

      const preferences = parsed.data as DevicePreferences;
      
      // Verificar se as preferências não são muito antigas (30 dias)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      if (preferences.lastUpdated < thirtyDaysAgo) {
        console.log('🕒 Preferências muito antigas, resetando...');
        this.clearDevicePreferences();
        return this.getDefaultPreferences();
      }

      // console.log('📖 Preferências carregadas:', preferences);
      return preferences;
    } catch (error) {
      console.error('❌ Erro ao carregar preferências:', error);
      return this.getDefaultPreferences();
    }
  }

  /**
   * Salva a lista de dispositivos disponíveis
   */
  saveAvailableDevices(devices: StoredDevice[]): void {
    if (!this.isClient()) {
      return;
    }

    try {
      localStorage.setItem(DEVICES_KEY, JSON.stringify({
        version: STORAGE_VERSION,
        data: devices,
        timestamp: Date.now()
      }));

      console.log('💾 Dispositivos disponíveis salvos:', devices.length);
    } catch (error) {
      console.error('❌ Erro ao salvar dispositivos:', error);
    }
  }

  /**
   * Carrega a lista de dispositivos disponíveis
   */
  getAvailableDevices(): StoredDevice[] {
    if (!this.isClient()) {
      return [];
    }

    try {
      const stored = localStorage.getItem(DEVICES_KEY);
      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);
      
      // Verificar versão
      if (parsed.version !== STORAGE_VERSION) {
        this.clearAvailableDevices();
        return [];
      }

      // Verificar se a lista não é muito antiga (1 hora)
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      if (parsed.timestamp < oneHourAgo) {
        console.log('🕒 Lista de dispositivos muito antiga, limpando...');
        this.clearAvailableDevices();
        return [];
      }

      return parsed.data as StoredDevice[];
    } catch (error) {
      console.error('❌ Erro ao carregar dispositivos:', error);
      return [];
    }
  }

  /**
   * Verifica se um dispositivo ainda está disponível
   */
  isDeviceAvailable(deviceId: string, currentDevices: StoredDevice[]): boolean {
    return currentDevices.some(device => device.deviceId === deviceId);
  }

  /**
   * Limpa preferências inválidas baseado nos dispositivos disponíveis
   */
  cleanupPreferences(currentDevices: StoredDevice[]): DevicePreferences {
    const preferences = this.getDevicePreferences();
    let updated = false;

    // Verificar se o dispositivo de áudio ainda existe
    if (preferences.audioInputId && !this.isDeviceAvailable(preferences.audioInputId, currentDevices)) {
      console.log('🧹 Dispositivo de áudio não encontrado, removendo preferência');
      preferences.audioInputId = null;
      updated = true;
    }

    // Verificar se o dispositivo de vídeo ainda existe
    if (preferences.videoInputId && !this.isDeviceAvailable(preferences.videoInputId, currentDevices)) {
      console.log('🧹 Dispositivo de vídeo não encontrado, removendo preferência');
      preferences.videoInputId = null;
      updated = true;
    }

    // Verificar se o dispositivo de saída de áudio ainda existe
    if (preferences.audioOutputId && !this.isDeviceAvailable(preferences.audioOutputId, currentDevices)) {
      console.log('🧹 Dispositivo de saída de áudio não encontrado, removendo preferência');
      preferences.audioOutputId = null;
      updated = true;
    }

    // Salvar se houve mudanças
    if (updated) {
      this.saveDevicePreferences(preferences);
    }

    return preferences;
  }

  /**
   * Seleciona automaticamente dispositivos padrão se não houver preferências
   */
  selectDefaultDevices(currentDevices: StoredDevice[]): DevicePreferences {
    const preferences = this.getDevicePreferences();
    let updated = false;

    // Selecionar microfone padrão
    if (!preferences.audioInputId) {
      const audioInputs = currentDevices.filter(d => d.kind === 'audioinput');
      const defaultAudio = audioInputs.find(d => d.deviceId === 'default') || audioInputs[0];
      if (defaultAudio) {
        preferences.audioInputId = defaultAudio.deviceId;
        updated = true;
        console.log('🎤 Selecionado microfone padrão:', defaultAudio.label);
      }
    }

    // Selecionar câmera padrão
    if (!preferences.videoInputId) {
      const videoInputs = currentDevices.filter(d => d.kind === 'videoinput');
      const defaultVideo = videoInputs.find(d => d.deviceId === 'default') || videoInputs[0];
      if (defaultVideo) {
        preferences.videoInputId = defaultVideo.deviceId;
        updated = true;
        console.log('📹 Selecionada câmera padrão:', defaultVideo.label);
      }
    }

    // Selecionar alto-falante padrão
    if (!preferences.audioOutputId) {
      const audioOutputs = currentDevices.filter(d => d.kind === 'audiooutput');
      const defaultOutput = audioOutputs.find(d => d.deviceId === 'default') || audioOutputs[0];
      if (defaultOutput) {
        preferences.audioOutputId = defaultOutput.deviceId;
        updated = true;
        console.log('🔊 Selecionado alto-falante padrão:', defaultOutput.label);
      }
    }

    // Salvar se houve mudanças
    if (updated) {
      this.saveDevicePreferences(preferences);
    }

    return preferences;
  }

  /**
   * Limpa todas as preferências de dispositivos
   */
  clearDevicePreferences(): void {
    if (!this.isClient()) {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('🗑️ Preferências de dispositivos limpas');
    } catch (error) {
      console.error('❌ Erro ao limpar preferências:', error);
    }
  }

  /**
   * Limpa a lista de dispositivos disponíveis
   */
  clearAvailableDevices(): void {
    if (!this.isClient()) {
      return;
    }

    try {
      localStorage.removeItem(DEVICES_KEY);
      console.log('🗑️ Lista de dispositivos limpa');
    } catch (error) {
      console.error('❌ Erro ao limpar dispositivos:', error);
    }
  }

  /**
   * Limpa todos os dados relacionados a dispositivos
   */
  clearAll(): void {
    this.clearDevicePreferences();
    this.clearAvailableDevices();
    console.log('🗑️ Todos os dados de dispositivos limpos');
  }

  /**
   * Retorna as preferências padrão
   */
  private getDefaultPreferences(): DevicePreferences {
    return {
      audioInputId: null,
      videoInputId: null,
      audioOutputId: null,
      lastUpdated: Date.now()
    };
  }

  /**
   * Obtém estatísticas do storage
   */
  getStorageStats(): { hasPreferences: boolean; devicesCount: number; lastUpdated: Date | null } {
    if (!this.isClient()) {
      return { hasPreferences: false, devicesCount: 0, lastUpdated: null };
    }

    const preferences = this.getDevicePreferences();
    const devices = this.getAvailableDevices();

    return {
      hasPreferences: !!(preferences.audioInputId || preferences.videoInputId || preferences.audioOutputId),
      devicesCount: devices.length,
      lastUpdated: preferences.lastUpdated ? new Date(preferences.lastUpdated) : null
    };
  }
}

// Instância singleton
export const deviceStorage = new DeviceStorageManager();

// Tipos exportados
export type { DevicePreferences, StoredDevice };

