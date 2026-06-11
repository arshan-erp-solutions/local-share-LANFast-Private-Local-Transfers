import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'
const TEMP_DIR = process.env.TEMP_DIR || './temp'

// Transfer storage (in-memory)
const transfers = new Map()

// Ensure directories exist
const ensureDirectories = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true })
  }
}

ensureDirectories()

export const requestTransfer = (req, res) => {
  try {
    const { receiverIp, fileData } = req.body

    const transferId = uuidv4()
    const transfer = {
      id: transferId,
      receiverIp,
      senderIp: req.body.senderIp,
      fileName: fileData.name,
      fileSize: fileData.size,
      fileType: fileData.type,
      status: 'pending',
      progress: 0,
      chunksReceived: 0,
      totalChunks: 0,
      createdAt: new Date(),
      savePath: path.join(UPLOAD_DIR, fileData.name),
    }

    transfers.set(transferId, transfer)

    res.json({
      success: true,
      message: 'Transfer request created',
      transferId
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

export const uploadChunk = (req, res) => {
  try {
    const {
      receiverIp,
      chunk,
      chunkIndex,
      totalChunks,
      transferId,
      filename,
      size,
      type
    } = req.body

    const transfer = transfers.get(transferId)
    
    if (!transfer) {
      return res.status(404).json({
        success: false,
        error: 'Transfer not found'
      })
    }

    if (transfer.status !== 'accepting' && transfer.status !== 'uploading') {
      return res.status(400).json({
        success: false,
        error: 'Transfer not in uploading state'
      })
    }

    // Save chunk to temp file
    const tempFilePath = path.join(TEMP_DIR, `${transferId}_${chunkIndex}`)
    
    // In production, handle binary chunks properly
    // For now, simulate chunk storage
    fs.writeFileSync(tempFilePath, chunk || 'chunk-data')

    transfer.chunksReceived = chunkIndex + 1
    transfer.totalChunks = totalChunks
    transfer.progress = ((chunkIndex + 1) / totalChunks) * 100
    transfer.status = 'uploading'

    // Check if all chunks received
    if (transfer.chunksReceived === totalChunks) {
      transfer.status = 'completed'
      transfer.progress = 100
      
      // Move chunks to final file (in production)
      const finalPath = transfer.savePath
      // Combine chunks logic here
    }

    res.json({
      success: true,
      message: 'Chunk uploaded successfully',
      progress: transfer.progress,
      chunksReceived: transfer.chunksReceived,
      totalChunks: transfer.totalChunks
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

export const acceptTransfer = (req, res) => {
  try {
    const { transferId } = req.body

    const transfer = transfers.get(transferId)
    
    if (!transfer) {
      return res.status(404).json({
        success: false,
        error: 'Transfer not found'
      })
    }

    if (transfer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Transfer not in pending state'
      })
    }

    transfer.status = 'accepting'

    res.json({
      success: true,
      message: 'Transfer accepted',
      transfer
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

export const rejectTransfer = (req, res) => {
  try {
    const { transferId } = req.body

    const transfer = transfers.get(transferId)
    
    if (!transfer) {
      return res.status(404).json({
        success: false,
        error: 'Transfer not found'
      })
    }

    if (transfer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Transfer not in pending state'
      })
    }

    transfer.status = 'rejected'

    res.json({
      success: true,
      message: 'Transfer rejected'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

export const getTransferStatus = (req, res) => {
  try {
    const transfer = transfers.get(req.params.transferId)
    
    if (!transfer) {
      return res.status(404).json({
        success: false,
        error: 'Transfer not found'
      })
    }

    res.json({
      success: true,
      transfer
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

export const getTransfers = (req, res) => {
  try {
    const transferList = Array.from(transfers.values())
    
    res.json({
      success: true,
      count: transferList.length,
      transfers: transferList
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

export const completeTransfer = (req, res) => {
  try {
    const { transferId } = req.body

    const transfer = transfers.get(transferId)
    
    if (!transfer) {
      return res.status(404).json({
        success: false,
        error: 'Transfer not found'
      })
    }

    transfer.status = 'completed'
    transfer.progress = 100
    transfer.completedAt = new Date()

    res.json({
      success: true,
      message: 'Transfer completed successfully',
      transfer
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

export const cancelTransfer = (req, res) => {
  try {
    const transferId = req.params.transferId

    const transfer = transfers.get(transferId)
    
    if (!transfer) {
      return res.status(404).json({
        success: false,
        error: 'Transfer not found'
      })
    }

    transfer.status = 'cancelled'

    // Clean up temp files
    const tempFiles = fs.readdirSync(TEMP_DIR)
    tempFiles.forEach(file => {
      if (file.startsWith(transferId)) {
        fs.unlinkSync(path.join(TEMP_DIR, file))
      }
    })

    res.json({
      success: true,
      message: 'Transfer cancelled'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}