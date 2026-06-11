import { Server } from 'socket.io'

// Har device ka deviceId -> socket.id map
const deviceToSocket = new Map()

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log('✓ Client connected:', socket.id)

    // Device joins
    socket.on('device_join', (deviceData = {}) => {
      const ip =
        deviceData.ip ||
        socket.handshake.address?.replace('::ffff:', '') ||
        'unknown'

      const deviceId = deviceData.deviceId || socket.id

      const device = {
        id: socket.id,
        deviceId,
        ip,
        name: deviceData.name || `Device_${socket.id.slice(0, 5)}`,
        status: 'online',
        joinedAt: new Date(),
      }

      // deviceId -> socketId save
      deviceToSocket.set(deviceId, socket.id)

      // Baaki clients ko batana ke naya device aaya
      socket.broadcast.emit('device_join', device)
      console.log(`Device joined: ${device.name} (${ip}) [${deviceId}]`)
    })

    // Device leaves (manual event)
    socket.on('device_leave', (deviceIdOrIp) => {
      if (deviceIdOrIp) {
        deviceToSocket.delete(deviceIdOrIp)
      }
      socket.broadcast.emit('device_leave', deviceIdOrIp || socket.id)
      console.log(`Device left (manual): ${deviceIdOrIp}`)
    })

    // Sender -> Server -> Receiver (deviceId ke basis pe)
    socket.on('send_request', (data = {}) => {
      console.log(
        'send_request from',
        data.senderDeviceId,
        'to',
        data.receiverDeviceId,
      )

      if (!data.receiverDeviceId) {
        console.log('Missing receiverDeviceId in send_request')
        return
      }

      const targetSocketId = deviceToSocket.get(data.receiverDeviceId)

      if (!targetSocketId) {
        console.log('No socket found for receiverDeviceId', data.receiverDeviceId)
        return
      }

      io.to(targetSocketId).emit('send_request', {
        senderName: data.senderName,
        senderIp: data.senderIp,
        senderDeviceId: data.senderDeviceId,
        fileData: data.fileData,
      })
    })

    socket.on('accept_transfer', (data) => {
      console.log('accept_transfer', data)
      // yahan baad me actual transfer control events handle kar sakte ho
    })

    socket.on('reject_transfer', (data) => {
      console.log('reject_transfer', data)
    })

    // Auto disconnect cleanup
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`)

      for (const [deviceId, sockId] of deviceToSocket.entries()) {
        if (sockId === socket.id) {
          deviceToSocket.delete(deviceId)
          socket.broadcast.emit('device_leave', deviceId)
          console.log(`Cleaned up deviceId on disconnect: ${deviceId}`)
          break
        }
      }
    })
  })

  return io
}

export default initializeSocket