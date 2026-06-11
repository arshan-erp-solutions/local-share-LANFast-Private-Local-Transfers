import React, { createContext, useContext, useState } from 'react'

const DeviceContext = createContext(null)

export const DeviceProvider = ({ children }) => {
  const [devices, setDevices] = useState([])

  /**
   * Add or update a device in the list.
   * Primary identity: deviceId
   * Fallback (only if deviceId missing): ip
   */
  const addDevice = (device) => {
    if (!device) return

    const hasDeviceId = Boolean(device.deviceId)
    const hasIp = Boolean(device.ip)

    setDevices((prev) => {
      let index = -1

      // 1) Try match by deviceId
      if (hasDeviceId) {
        index = prev.findIndex((d) => d.deviceId === device.deviceId)
      }

      // 2) If no deviceId match, try by ip (for older/edge cases)
      if (index === -1 && hasIp) {
        index = prev.findIndex((d) => d.ip === device.ip)
      }

      // 3) If found, merge/update existing entry
      if (index !== -1) {
        const next = [...prev]
        next[index] = {
          ...next[index],
          ...device,
          status: device.status || 'online',
        }
        return next
      }

      // 4) Otherwise, append as new device
      return [...prev, { ...device, status: device.status || 'online' }]
    })
  }

  /**
   * Remove a device by deviceId or ip
   */
  const removeDevice = (idOrIp) => {
    if (!idOrIp) return

    setDevices((prev) =>
      prev.filter((d) =>
        d.deviceId
          ? d.deviceId !== idOrIp
          : d.ip !== idOrIp,
      ),
    )
  }

  /**
   * Update only status by ip (legacy / optional)
   */
  const updateDeviceStatus = (ip, status) => {
    if (!ip) return

    setDevices((prev) =>
      prev.map((d) =>
        d.ip === ip
          ? { ...d, status }
          : d,
      ),
    )
  }

  /**
   * Clear all devices (e.g. on disconnect)
   */
  const clearDevices = () => setDevices([])

  return (
    <DeviceContext.Provider
      value={{
        devices,
        addDevice,
        removeDevice,
        updateDeviceStatus,
        clearDevices,
      }}
    >
      {children}
    </DeviceContext.Provider>
  )
}

export const useDevicesContext = () => {
  const ctx = useContext(DeviceContext)
  if (!ctx) {
    throw new Error('useDevicesContext must be used within DeviceProvider')
  }
  return ctx
}