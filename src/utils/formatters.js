// Format file size
export const formatSize = (bytes) => {
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

// Format bytes to human readable
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// Format duration
export const formatDuration = (seconds) => {
  if (seconds < 60) return `${Math.floor(seconds)}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  return `${hours}h ${minutes}m ${secs}s`
}

// Format speed
export const formatSpeed = (bytesPerSecond) => {
  return formatSize(bytesPerSecond) + '/s'
}

// Format percentage
export const formatPercentage = (value) => {
  return `${value.toFixed(1)}%`
}

// Format date
export const formatDate = (date) => {
  const d = new Date(date)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

// Format relative time
export const formatRelativeTime = (date) => {
  const now = new Date()
  const diff = now - new Date(date)
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (seconds < 60) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// Format IP address
export const formatIP = (ip) => {
  return ip || 'Unknown'
}

// Format transfer status
export const formatStatus = (status) => {
  const statusMap = {
    pending: 'Pending',
    accepting: 'Accepting...',
    uploading: 'Uploading...',
    downloading: 'Downloading...',
    completed: 'Completed',
    failed: 'Failed',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
  }
  return statusMap[status] || status
}

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    pending: 'text-yellow-400',
    accepting: 'text-blue-400',
    uploading: 'text-blue-400',
    downloading: 'text-blue-400',
    completed: 'text-green-400',
    failed: 'text-red-400',
    rejected: 'text-red-400',
    cancelled: 'text-gray-400',
  }
  return colors[status] || 'text-gray-400'
}

// Get file icon
export const getFileIcon = (type, filename = '') => {
  if (type.startsWith('image/')) return '🖼️'
  if (type.startsWith('video/')) return '🎬'
  if (type.startsWith('audio/')) return '🎵'
  if (type.includes('pdf')) return '📄'
  if (type.includes('word')) return '📝'
  if (type.includes('excel')) return '📊'
  if (type.includes('zip')) return '📦'
  if (filename.endsWith('.exe')) return '⚙️'
  return '📁'
}

// Calculate ETA
export const calculateETA = (remainingBytes, speedBytesPerSecond) => {
  if (speedBytesPerSecond === 0) return null
  const seconds = remainingBytes / speedBytesPerSecond
  return formatDuration(seconds)
}

// Calculate progress
export const calculateProgress = (current, total) => {
  if (total === 0) return 0
  return (current / total) * 100
}