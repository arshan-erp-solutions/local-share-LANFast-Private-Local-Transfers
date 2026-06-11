// Generate unique ID
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Debounce function
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Check if device is online
export const isDeviceOnline = (device) => {
  return device && device.status === 'online'
}

// Sort devices by status
export const sortDevicesByStatus = (devices) => {
  return [...devices].sort((a, b) => {
    if (a.status === 'online' && b.status === 'offline') return -1
    if (a.status === 'offline' && b.status === 'online') return 1
    return 0
  })
}

// Filter devices by search term
export const filterDevices = (devices, searchTerm) => {
  if (!searchTerm) return devices
  const term = searchTerm.toLowerCase()
  return devices.filter(device =>
    device.name.toLowerCase().includes(term) ||
    device.ip.includes(term)
  )
}

// Get random device name
export const getRandomDeviceName = () => {
  const names = [
    'Banana', 'Sweet Mango', 'Red Apple', 'Blue Tiger',
    'Golden Falcon', 'Purple Panther', 'Crimson Cobra',
    'Silver Shark', 'Midnight Wolf', 'Thunder Bear',
    'Copper Cat', 'Jade Jaguar', 'Obsidian Owl'
  ]
  return names[Math.floor(Math.random() * names.length)]
}

// Get device icon
export const getDeviceIcon = (type) => {
  const icons = {
    phone: '📱',
    laptop: '💼',
    desktop: '🖥️',
    tablet: '📲',
    device: '💻',
  }
  return icons[type] || icons.device
}

// Check if file is image
export const isImage = (file) => {
  return file.type.startsWith('image/')
}

// Check if file is video
export const isVideo = (file) => {
  return file.type.startsWith('video/')
}

// Check if file is audio
export const isAudio = (file) => {
  return file.type.startsWith('audio/')
}

// Check if file is PDF
export const isPDF = (file) => {
  return file.type === 'application/pdf' || file.name.endsWith('.pdf')
}

// Get file extension
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

// Validate file size
export const validateFileSize = (file, maxSize = 5 * 1024 * 1024 * 1024) => {
  return file.size <= maxSize
}

// Get chunk count
export const getChunkCount = (fileSize, chunkSize = 1048576) => {
  return Math.ceil(fileSize / chunkSize)
}

// Sleep helper
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy:', error)
    return false
  }
}

// Get local IP from browser
export const getLocalIP = () => {
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return window.location.hostname
  }
  return 'localhost'
}