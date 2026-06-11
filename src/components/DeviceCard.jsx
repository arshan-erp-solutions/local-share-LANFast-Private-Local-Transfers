import React from 'react'
import { motion } from 'framer-motion'

const DeviceCardComponent = ({ device, onSelect, isSelected }) => {
  const icons = {
    device: '💻',
    phone: '📱',
    laptop: '💼',
    desktop: '🖥️',
    tablet: '📲',
  }

  const icon = icons[device.icon] || icons.device
  const isOffline = device.status === 'offline'

  const title =
    device.displayName ||
    device.name ||
    device.deviceName ||
    'Unknown device'

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={() => !isOffline && onSelect && onSelect(device)}
      className={`
        w-full text-left glass-soft p-3 sm:p-4 rounded-md flex items-center gap-3
        border transition-all
        ${
          isSelected
            ? 'border-strong bg-primary-soft'
            : 'border-subtle hover:border-strong hover:bg-primary-soft/60'
        }
        ${isOffline ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface text-2xl">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-main truncate">
          {title}
        </p>
        <p className="text-xs text-soft truncate mt-0.5">
          {device.ip || 'No IP'} · {device.deviceId || device.id || 'No ID'}
        </p>

        <div className="flex items-center gap-2 mt-2 text-xs">
          <span
            className={`h-2 w-2 rounded-full ${
              isOffline ? 'bg-red-400' : 'bg-green-400'
            }`}
          />
          <span className={isOffline ? 'text-red-400' : 'text-green-400'}>
            {isOffline ? 'Offline' : 'Online'}
          </span>
        </div>
      </div>
    </motion.button>
  )
}

const propsAreEqual = (prev, next) => {
  return (
    prev.isSelected === next.isSelected &&
    prev.device.deviceId === next.device.deviceId &&
    prev.device.ip === next.device.ip &&
    prev.device.status === next.device.status &&
    prev.device.displayName === next.device.displayName
  )
}

export default React.memo(DeviceCardComponent, propsAreEqual)