import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.connected = false
  }

  connect(url) {
    if (this.socket) return

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    this.socket.on('connect', () => {
      this.connected = true
      console.log('✓ Socket connected')
    })

    this.socket.on('disconnect', () => {
      this.connected = false
      console.log('✗ Socket disconnected')
    })

    this.socket.on('device_join', (device) => {
      console.log('Device joined:', device)
    })

    this.socket.on('device_leave', (ip) => {
      console.log('Device left:', ip)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
      this.connected = false
    }
  }

  sendDiscoveryRequest(deviceData) {
    this.socket?.emit('device_join', deviceData)
  }

  announceLeave(ip) {
    this.socket?.emit('device_leave', ip)
  }

  sendTransferRequest(receiverIp, fileData) {
    this.socket?.emit('send_request', {
      receiverIp,
      fileData,
      senderIp: this.socket?.id,
    })
  }

  acceptTransfer(transferId) {
    this.socket?.emit('accept_transfer', { transferId })
  }

  rejectTransfer(transferId) {
    this.socket?.emit('reject_transfer', { transferId })
  }

  sendProgress(transferId, progress) {
    this.socket?.emit('transfer_progress', { transferId, progress })
  }

  sendComplete(transferId) {
    this.socket?.emit('transfer_complete', { transferId })
  }

  on(event, callback) {
    this.socket?.on(event, callback)
  }

  off(event, callback) {
    this.socket?.off(event, callback)
  }

  isConnected() {
    return this.connected
  }
}

export const socketService = new SocketService()