export const socketService = {
  // Broadcast event to all connected clients
  broadcast(io, event, data) {
    io.emit(event, data)
  },

  // Send event to specific client
  sendToClient(io, clientId, event, data) {
    io.to(clientId).emit(event, data)
  },

  // Send event to all clients in a room
  sendToRoom(io, room, event, data) {
    io.to(room).emit(event, data)
  },

  // Join room
  joinRoom(socket, room) {
    socket.join(room)
  },

  // Leave room
  leaveRoom(socket, room) {
    socket.leave(room)
  },

  // Get connected clients count
  getConnectedCount(io) {
    return io.sockets.sockets.size
  },

  // Get all connected socket IDs
  getConnectedSockets(io) {
    return Array.from(io.sockets.sockets.keys())
  },
}

export default socketService