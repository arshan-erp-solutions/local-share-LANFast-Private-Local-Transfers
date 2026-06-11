import fs from 'fs'
import path from 'path'

export const fileHelper = {
  // Format file size
  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  },

  // Get file extension
  getExtension(filename) {
    return path.extname(filename).toLowerCase()
  },

  // Get file type from extension
  getFileType(extension) {
    const types = {
      '.jpg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }
    return types[extension] || 'application/octet-stream'
  },

  // Create chunk file name
  getChunkFilename(transferId, chunkIndex) {
    return `${transferId}_${chunkIndex}`
  },

  // Combine chunks into final file
  async combineChunks(transferId, totalChunks, outputPath) {
    const chunks = []
    
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join('./temp', this.getChunkFilename(transferId, i))
      if (fs.existsSync(chunkPath)) {
        chunks.push(fs.readFileSync(chunkPath))
        fs.unlinkSync(chunkPath) // Delete chunk after reading
      }
    }

    const finalBuffer = Buffer.concat(chunks)
    fs.writeFileSync(outputPath, finalBuffer)
    
    return outputPath
  },

  // Clean up old files
  cleanupOldFiles(dir, maxAge = 24 * 60 * 60 * 1000) {
    const files = fs.readdirSync(dir)
    const now = Date.now()

    files.forEach(file => {
      const filePath = path.join(dir, file)
      const stats = fs.statSync(filePath)
      
      if (now - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath)
      }
    })
  },
}

export default fileHelper