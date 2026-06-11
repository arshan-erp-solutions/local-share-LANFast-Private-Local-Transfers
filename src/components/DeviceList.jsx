import React, { useMemo } from 'react'
import DeviceCard from './DeviceCard.jsx'
import { motion } from 'framer-motion'

const DeviceList = ({ devices, onSelectDevice, selectedDevice }) => {
  const normalized = useMemo(
    () =>
      devices.map(d => ({
        ...d,
        displayName: d.name || d.deviceName || 'Unknown Device',
      })),
    [devices],
  )

  const onlineDevices = useMemo(
    () => normalized.filter(d => d.status === 'online'),
    [normalized],
  )

  const offlineDevices = useMemo(
    () => normalized.filter(d => d.status === 'offline'),
    [normalized],
  )

  const hasDevices =
    onlineDevices.length > 0 || offlineDevices.length > 0

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-main uppercase tracking-wide">
          Devices
        </h3>
        <span className="text-xs text-soft">
          {onlineDevices.length} online
        </span>
      </div>

      {/* Empty state */}
      {!hasDevices && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-soft rounded-lg p-6 text-center"
        >
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-sm text-muted">No devices discovered yet.</p>
          <p className="text-xs text-soft mt-1">
            Make sure other devices are on the same network and discovery is
            running.
          </p>
        </motion.div>
      )}

      {/* Online devices */}
      {onlineDevices.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-soft">Online</p>
          <div className="grid gap-3">
            {onlineDevices.map(device => (
              <DeviceCard
                key={device.deviceId || device.ip}
                device={device}
                onSelect={onSelectDevice}
                isSelected={selectedDevice?.ip === device.ip}
              />
            ))}
          </div>
        </div>
      )}

      {/* Offline devices */}
      {offlineDevices.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-soft mt-2">Offline</p>
          <div className="grid gap-3">
            {offlineDevices.map(device => (
              <DeviceCard
                key={device.deviceId || device.ip}
                device={device}
                onSelect={onSelectDevice}
                isSelected={selectedDevice?.ip === device.ip}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(DeviceList)