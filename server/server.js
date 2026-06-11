import express from 'express'
import cors from 'cors'
import http from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'

// Import routes
import deviceRoutes from './routes/deviceRoutes.js'
import transferRoutes from './routes/transferRoutes.js'

// Load environment variables
dotenv.config()

const app = express()
const server = http.createServer(app)

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Uploads dir (same as transferRoutes.js)
const uploadsDir = path.resolve('uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// (optional) static serve if needed anywhere
app.use('/uploads', express.static(uploadsDir))

// Routes
app.use('/api/devices', deviceRoutes)
app.use('/api/transfer', transferRoutes)
app.use('/api', deviceRoutes)
app.use('/api', transferRoutes)

// Local IP endpoint
app.get('/api/local-ip', async (req, res) => {
  const os = await import('os')
  const interfaces = os.default.networkInterfaces()
  let localIP = 'localhost'

  for (const interfaceName in interfaces) {
    for (const iface of interfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address
        break
      }
    }
  }

  res.json({ ip: localIP })
})

// ====== In-memory storage ======
/**
 * devicesBySocket: socket.id -> deviceInfo
 * socketByDeviceId: deviceId -> socket.id
 * transfers: transferId -> transferInfo
 */
const devicesBySocket = new Map()
const socketByDeviceId = new Map()
const transfers = new Map()

// Helper: current devices list
const getAllDevices = () => Array.from(devicesBySocket.values())

// ====== Cancel transfer HTTP endpoint (delete uploaded file) ======
app.post('/api/cancel-transfer', (req, res) => {
  const { transferId } = req.body

  if (!transferId) {
    return res.status(400).json({ error: 'transferId required' })
  }

  const transfer = transfers.get(transferId)

  if (!transfer) {
    return res.status(404).json({ error: 'Transfer not found' })
  }

  const downloadUrl = transfer.fileData?.downloadUrl
  if (!downloadUrl) {
    return res.status(400).json({ error: 'No downloadUrl for this transfer' })
  }

  try {
    const parts = downloadUrl.split('/')
    const storedName = parts[parts.length - 1]
    const filePath = path.join(uploadsDir, storedName)

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log('🧹 Deleted cancelled upload:', filePath)
    } else {
      console.log('⚠️ File for cancelled transfer not found on disk:', filePath)
    }

    transfers.delete(transferId)

    return res.json({ success: true })
  } catch (err) {
    console.error('cancel-transfer error', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ====== Socket.IO connection handling ======
io.on('connection', (socket) => {
  console.log('✓ Client connected:', socket.id)

  // Device joins / registers
  socket.on('device_join', (deviceData = {}) => {
    const ip =
      deviceData.ip ||
      socket.handshake.address?.replace('::ffff:', '') ||
      'unknown'

    const deviceId = deviceData.deviceId || socket.id

    // Same deviceId se existing socket ho to clean karo
    const existingSocketId = socketByDeviceId.get(deviceId)
    if (existingSocketId && existingSocketId !== socket.id) {
      devicesBySocket.delete(existingSocketId)
      console.log(
        `⚠️ Replacing existing deviceId ${deviceId} (old socket ${existingSocketId})`,
      )
    }

    const device = {
      socketId: socket.id,
      deviceId,
      ip,
      name: deviceData.name || `Device_${socket.id.slice(0, 5)}`,
      status: 'online',
      joinedAt: new Date(),
    }

    devicesBySocket.set(socket.id, device)
    socketByDeviceId.set(deviceId, socket.id)

    // Broadcast to ALL clients (including the one who joined)
    io.emit('device_join', device)

    console.log(`Device joined: ${device.name} (${ip}) [${deviceId}]`)
  })

  // Client asks for current devices list
  socket.on('request_devices', () => {
    const allDevices = getAllDevices()
    console.log('request_devices from', socket.id, '->', allDevices.length, 'devices')
    socket.emit('devices_list', allDevices)
  })

  // Device leaves (manual, from client)
  socket.on('device_leave', (deviceIdOrIp) => {
    let targetSocketId = null

    if (deviceIdOrIp && socketByDeviceId.has(deviceIdOrIp)) {
      targetSocketId = socketByDeviceId.get(deviceIdOrIp)
      socketByDeviceId.delete(deviceIdOrIp)
      devicesBySocket.delete(targetSocketId)
    }

    const payload = deviceIdOrIp || targetSocketId || socket.id
    io.emit('device_leave', payload)
    console.log(`Device left: ${payload}`)
  })

  // Transfer request (Sender -> Receiver, deviceId ke basis pe)
  socket.on('send_request', (data = {}) => {
    console.log(
      'send_request from',
      data.senderDeviceId,
      'to',
      data.receiverDeviceId,
    )

    if (!data.receiverDeviceId) {
      console.log('send_request: missing receiverDeviceId')
      return
    }

    const targetSocketId = socketByDeviceId.get(data.receiverDeviceId)

    if (!targetSocketId) {
      console.log(
        'send_request: No socket found for receiverDeviceId',
        data.receiverDeviceId,
      )
      return
    }

    const transferId = data.transferId || uuidv4()

    transfers.set(transferId, {
      id: transferId,
      senderDeviceId: data.senderDeviceId,
      receiverDeviceId: data.receiverDeviceId,
      fileData: data.fileData, // { name, size, type, downloadUrl }
      createdAt: new Date(),
      status: 'pending',
    })

    io.to(targetSocketId).emit('send_request', {
      transferId,
      senderName: data.senderName,
      senderIp: data.senderIp,
      senderDeviceId: data.senderDeviceId,
      fileData: data.fileData,
    })
  })

  // Accept transfer
  socket.on('accept_transfer', (data = {}) => {
    console.log('accept_transfer', data)
    const transfer = transfers.get(data.transferId)
    if (transfer) {
      transfer.status = 'accepted'
    }
  })

  // Reject transfer  👉 delete uploaded file here
  socket.on('reject_transfer', (data = {}) => {
    console.log('reject_transfer', data)
    const transfer = transfers.get(data.transferId)

    if (!transfer) {
      console.log('reject_transfer: transfer not found for', data.transferId)
      return
    }

    transfer.status = 'rejected'

    const downloadUrl = transfer.fileData?.downloadUrl

    if (!downloadUrl) {
      console.log('reject_transfer: no downloadUrl for transfer', data.transferId)
      return
    }

    try {
      const parts = downloadUrl.split('/')
      const storedName = parts[parts.length - 1]
      const filePath = path.join(uploadsDir, storedName)

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        console.log('🧹 Deleted rejected upload:', filePath)
      } else {
        console.log('⚠️ File for rejected transfer not found on disk:', filePath)
      }

      transfers.delete(data.transferId)
    } catch (err) {
      console.error('reject_transfer delete error:', err)
    }
  })

  // Transfer progress (optional logging only)
  socket.on('transfer_progress', (data = {}) => {
    console.log('transfer_progress', data)
  })

  // Transfer complete
  socket.on('transfer_complete', (data = {}) => {
    console.log('transfer_complete', data)
    const transfer = transfers.get(data.transferId)
    if (transfer) {
      transfer.status = 'completed'
    }
  })

  // Disconnect cleanup
  socket.on('disconnect', () => {
    const device = devicesBySocket.get(socket.id)
    if (device) {
      device.status = 'offline'

      // Broadcast to ALL that this device left
      io.emit('device_leave', device.deviceId || socket.id)

      console.log(`Device disconnected: ${device.name} [${device.deviceId}]`)

      devicesBySocket.delete(socket.id)
      if (device.deviceId) {
        socketByDeviceId.delete(device.deviceId)
      }
    } else {
      console.log(`Client disconnected (no device): ${socket.id}`)
    }
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Local Share LAN Server is running' })
})

// Start server
const PORT = process.env.PORT || 3001

server.listen(PORT, '0.0.0.0', () => {
  console.log('')
  console.log('🚀 Local Share LAN Server')
  console.log(`📡 Server running on http://0.0.0.0:${PORT}`)
  console.log(`🔌 Socket.IO ready on port ${PORT}`)
  console.log('')
})