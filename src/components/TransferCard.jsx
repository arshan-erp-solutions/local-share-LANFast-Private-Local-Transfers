import React from 'react'
import { motion } from 'framer-motion'
import ProgressBar from './ProgressBar.jsx'

const formatSize = (bytes) => {
  if (bytes == null) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  if (bytes < 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'text-yellow-400'
    case 'uploading':
    case 'downloading':
      return 'text-blue-400'
    case 'completed':
      return 'text-green-400'
    case 'failed':
      return 'text-red-400'
    case 'cancelled':
    default:
      return 'text-gray-400'
  }
}

const TransferCardComponent = ({ transfer, onCancel }) => {
  const isActive =
    transfer.status !== 'completed' &&
    transfer.status !== 'failed' &&
    transfer.status !== 'cancelled'

  const uploadedLabel =
    transfer.uploadedHuman ||
    (transfer.file?.size != null ? formatSize(transfer.file.size) : '—')
  const totalLabel =
    transfer.totalHuman ||
    (transfer.file?.size != null ? formatSize(transfer.file.size) : '—')
  const speedLabel = transfer.speed || ''
  const remainingLabel = transfer.remainingTime || ''

  const targetLabel = transfer.receiverIp || transfer.senderIp || ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-soft rounded-md p-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface text-2xl">
          📦
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-main truncate">
                {transfer.file?.name || transfer.fileName || 'File'}
              </p>
              {targetLabel && (
                <p className="text-xs text-soft mt-1 truncate">
                  {formatSize(transfer.file?.size)} → {targetLabel}
                </p>
              )}
            </div>

            <span
              className={`text-xs font-medium capitalize ${getStatusColor(
                transfer.status,
              )}`}
            >
              {transfer.status}
            </span>
          </div>

          {isActive && (
            <>
              <div className="mt-2">
                <ProgressBar progress={transfer.progress || 0} />
              </div>

              <div className="mt-1 flex items-center justify-between text-[11px] text-soft">
                <span>
                  {uploadedLabel} / {totalLabel}
                </span>
                {(speedLabel || remainingLabel) && (
                  <span>
                    {speedLabel}
                    {speedLabel && remainingLabel ? ' • ' : ''}
                    {remainingLabel}
                  </span>
                )}
              </div>
            </>
          )}

          {!isActive && transfer.progress === 100 && (
            <div className="mt-1 flex items-center justify-between text-[11px] text-soft">
              <span>
                {totalLabel} / {totalLabel}
              </span>
              <span>Done</span>
            </div>
          )}
        </div>

        {onCancel && transfer.status === 'uploading' && (
          <button
            type="button"
            onClick={onCancel}
            className="ml-1 inline-flex items-center justify-center rounded-full bg-danger-soft px-3 py-1 text-xs font-medium text-red-400 transition-all hover:bg-red-500/25"
          >
            Cancel
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default React.memo(TransferCardComponent)