import { useState, useEffect, useCallback } from 'react'
import { useDevicesContext } from '../context/DeviceContext.jsx'

const SERVER_PORT = 3001
const getServerHost = () => window.location.hostname || 'localhost'

export const useDevices = () => {
  const {
    devices,
    updateDeviceStatus,
  } = useDevicesContext()

  const [discovering, setDiscovering] = useState(false)
  const [localIP, setLocalIP] = useState('')

  const getLocalIP = useCallback(async () => {
    try {
      const host = getServerHost()

      // Backend se current local IP lo (router, hotspot, jo bhi active ho)
      const response = await fetch(`http://${host}:${SERVER_PORT}/api/local-ip`)
      if (response.ok) {
        const data = await response.json()
        if (data?.ip) {
          setLocalIP(data.ip)
          return data.ip
        }
      }

      // Agar backend se IP na mile to fallback: window.location.hostname
      if (
        window.location.hostname &&
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1'
      ) {
        setLocalIP(window.location.hostname)
        return window.location.hostname
      }

      // final fallback
      setLocalIP('localhost')
      return 'localhost'
    } catch (error) {
      console.error('Failed to get local IP:', error)
      setLocalIP('localhost')
      return 'localhost'
    }
  }, [])

  // Discover: ab sirf IP refresh, future me backend discovery add kar sakte ho
  const discoverDevices = useCallback(async () => {
    setDiscovering(true)
    try {
      await getLocalIP()
      // TODO: yahan future me backend-based device discovery call add kar sakte ho.
      // Abhi devices sirf SocketContext ke device_join events se aayenge.
    } catch (error) {
      console.error('Discovery failed:', error)
    } finally {
      setDiscovering(false)
    }
  }, [getLocalIP])

  const refreshDeviceStatus = useCallback(
    async (ip) => {
      try {
        const host = getServerHost()
        const response = await fetch(
          `http://${host}:${SERVER_PORT}/api/device/ping`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetIP: ip }),
          },
        )

        if (response.ok) {
          updateDeviceStatus(ip, 'online')
          return true
        } else {
          updateDeviceStatus(ip, 'offline')
          return false
        }
      } catch (error) {
        updateDeviceStatus(ip, 'offline')
        return false
      }
    },
    [updateDeviceStatus],
  )

  useEffect(() => {
    // initial IP fetch
    getLocalIP()

    // IP polling: har 5 second me current IP refresh
    const intervalId = setInterval(getLocalIP, 5000)

    // online/offline pe bhi refresh
    const handleOnline = () => getLocalIP()
    const handleOffline = () => getLocalIP()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [getLocalIP])

  return {
    devices,
    localIP,
    discovering,
    discoverDevices,
    refreshDeviceStatus,
  }
}