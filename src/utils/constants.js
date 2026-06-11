// App Constants
export const CONSTANTS = {
  // App Info
  APP_NAME: 'Local Share LAN',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'File transfer over local network',

  // API
  API_BASE_URL: 'http://localhost:3001/api',
  SOCKET_IO_URL: 'http://localhost:3001',

  // File Transfer
  CHUNK_SIZE: 1048576, // 1MB
  MAX_FILE_SIZE: 5497558138880, // 5GB
  MAX_CHUNKS: 5000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,

  // UI
  TOAST_DURATION: 4000,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 300,

  // Device Discovery
  DISCOVERY_INTERVAL: 5000,
  DEVICE_TIMEOUT: 60000,

  // Status
  TRANSFER_STATUS: {
    PENDING: 'pending',
    ACCEPTING: 'accepting',
    UPLOADING: 'uploading',
    DOWNLOADING: 'downloading',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
  },

  DEVICE_STATUS: {
    ONLINE: 'online',
    OFFLINE: 'offline',
  },

  // Themes
  THEMES: {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
  },

  // Storage Keys
  STORAGE_KEYS: {
    SETTINGS: 'localShareSettings',
    HISTORY: 'localShareHistory',
    DEVICE_NAME: 'deviceName',
  },

  // Device Names
  DEVICE_NAMES: [
    'Banana', 'Sweet Mango', 'Red Apple', 'Blue Tiger',
    'Golden Falcon', 'Purple Panther', 'Crimson Cobra',
    'Silver Shark', 'Midnight Wolf', 'Thunder Bear',
    'Copper Cat', 'Jade Jaguar', 'Obsidian Owl'
  ],

  // Device Icons
  DEVICE_ICONS: {
    PHONE: 'phone',
    LAPTOP: 'laptop',
    DESKTOP: 'desktop',
    TABLET: 'tablet',
    DEVICE: 'device',
  },
}

export default CONSTANTS