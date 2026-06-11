export const CONSTANTS = {
  // Server
  PORT: parseInt(process.env.PORT) || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // File storage
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  TEMP_DIR: process.env.TEMP_DIR || './temp',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5497558138880, // 5GB

  // Transfer
  CHUNK_SIZE: 1048576, // 1MB
  MAX_CHUNKS: 5000,
  RETRY_ATTEMPTS: 3,

  // Device
  DEFAULT_DEVICE_NAME: 'Unknown Device',
  DEFAULT_DEVICE_ICON: 'device',

  // Time
  CONNECTION_TIMEOUT: 30000, // 30 seconds
  HEARTBEAT_INTERVAL: 5000, // 5 seconds
  DEVICE_TIMEOUT: 60000, // 1 minute

  // Status
  TRANSFER_STATUS: {
    PENDING: 'pending',
    ACCEPTING: 'accepting',
    UPLOADING: 'uploading',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
  },

  DEVICE_STATUS: {
    ONLINE: 'online',
    OFFLINE: 'offline',
  },
}

export default CONSTANTS