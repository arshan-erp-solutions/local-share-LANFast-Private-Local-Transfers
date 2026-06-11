import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useSettings } from './SettingsContext.jsx'
import { useDevicesContext } from './DeviceContext.jsx'

export const SocketContext = createContext(null)

// Host hamesha current page ke hostname se
const getServerHost = () => window.location.hostname || 'localhost'

export const SocketProvider = ({ children }) => {
  const { settings, setIncomingRequests } = useSettings()
  const { addDevice, removeDevice, clearDevices } = useDevicesContext()

  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const SERVER_HOST = getServerHost()
    const port = settings.port || 3001
    const url = `http://${SERVER_HOST}:${port}`

    console.log('Connecting socket to:', url)

  const s = io(url, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 2000,
  reconnectionAttempts: Infinity, // jab tak server available na ho
})

    const handleConnect = () => {
      setConnected(true)
      console.log('✓ Socket connected', s.id)

      const safeName = settings.deviceName || 'Unknown Device'

      const payload = {
        name: safeName,
        ip: window.location.hostname,
        deviceId: settings.deviceId,
      }

      console.log('Emitting device_join with payload:', payload)

      // 1) Register this device on server
      s.emit('device_join', payload)

      // 2) Ask for full devices list (already online devices)
      s.emit('request_devices')
    }

    const handleDisconnect = () => {
      setConnected(false)
      console.log('✗ Socket disconnected')
      // Optional: clear local devices on disconnect so ghost entries na rahen
      clearDevices()
    }

    const handleDeviceJoin = (device) => {
      console.log('device_join received on client:', device)

      // device ko sirf deviceId se identify karo
      if (!device.deviceId) return

      addDevice(device)
    }

    const handleDeviceLeave = (idOrIp) => {
      console.log('device_leave received on client:', idOrIp)
      removeDevice(idOrIp)
    }

    const handleDevicesList = (list) => {
      console.log('devices_list received on client:', list)

      // Fresh sync: purani list clear, nayi list se rebuild
      clearDevices()
      if (Array.isArray(list)) {
        list.forEach((d) => {
          if (d.deviceId) addDevice(d)
        })
      }
    }

    const handleSendRequest = (data) => {
      console.log('SocketContext: Received send_request on this device:', data)
      setIncomingRequests((prev) => [
        ...prev,
        {
          id:
            data.transferId ||
            `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          senderName: data.senderName,
          senderIp: data.senderIp,
          senderDeviceId: data.senderDeviceId,
          fileData: data.fileData,
          status: 'pending',
        },
      ])
    }

    s.on('connect', handleConnect)
    s.on('disconnect', handleDisconnect)
    s.on('device_join', handleDeviceJoin)
    s.on('device_leave', handleDeviceLeave)
    s.on('devices_list', handleDevicesList)
    s.on('send_request', handleSendRequest)

    setSocket(s)

    return () => {
      s.off('connect', handleConnect)
      s.off('disconnect', handleDisconnect)
      s.off('device_join', handleDeviceJoin)
      s.off('device_leave', handleDeviceLeave)
      s.off('devices_list', handleDevicesList)
      s.off('send_request', handleSendRequest)
      s.close()
    }
  }, [settings.port, settings.deviceName, settings.deviceId])

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocketContext = () => {
  const ctx = useContext(SocketContext)
  if (!ctx) {
    throw new Error('useSocketContext must be used within a SocketProvider')
  }
  return ctx
}