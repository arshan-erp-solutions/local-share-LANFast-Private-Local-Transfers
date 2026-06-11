import React from 'react'
import { motion } from 'framer-motion'
import ProgressBar from './ProgressBar.jsx'

const formatSize = (bytes) => {
  if (bytes == null) return 'Unknown size'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  if (bytes < 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

const getFileIcon = (type) => {
  if (!type) return '📁'
  if (type.startsWith('image/')) return '🖼️'
  if (type.startsWith('video/')) return '🎬'
  if (type.startsWith('audio/')) return '🎵'
  if (type.includes('pdf')) return '📄'
  return '📁'
}

const TransferModal = ({ transfer, onAccept, onReject }) => {
  if (!transfer) return null

  const isPending = transfer.status === 'pending'
  const isUploading = transfer.status === 'uploading'
  const isCompleted = transfer.status === 'completed'


  return (
     <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay"
    >
      {/* Click-blocker */}
     <div className="absolute inset-0" />
  <motion.div
        initial={{ scale: 0.92, y: 18, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 18, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 210, damping: 20 }}
        className="relative mx-4 w-full max-w-md glass rounded-lg p-5 sm:p-6"
      >
        {/* Header */}
        <div className="text-center mb-5">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-2xl">
            {getFileIcon(transfer.fileType)}
          </div>
          <h2 className="text-lg sm:text-xl font-semibold mb-1">
            Incoming file
          </h2>
          <p className="text-xs sm:text-sm text-soft">
            from <span className="font-medium text-main">{transfer.senderName}</span>{' '}
            {transfer.senderIp && <span>({transfer.senderIp})</span>}
          </p>
        </div>

        {/* File details */}
        <div className="glass-soft rounded-md p-4 mb-5">
          <p className="text-sm font-medium text-main truncate">
            {transfer.fileName}
          </p>
          <div className="mt-2 space-y-1 text-xs text-soft">
            <p>Size: {formatSize(transfer.fileSize)}</p>
            <p>Type: {transfer.fileType || 'Unknown'}</p>
          </div>
        </div>

        {/* Progress (if uploading / downloading visible here) */}
        {isUploading && (
          <div className="mb-5">
            <ProgressBar progress={transfer.progress || 0} />
            <p className="mt-2 text-xs text-soft">
              {transfer.speed ? `${transfer.speed}` : ''}
              {transfer.remainingTime
                ? `${transfer.speed ? ' • ' : ''}${transfer.remainingTime}`
                : ''}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          {isPending && (
            <>
              <button
                type="button"
                onClick={onReject}
                className="flex-1 rounded-full bg-danger-soft px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/25"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={onAccept}
                className="flex-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-accent-strong"
              >
                Accept &amp; download
              </button>
            </>
          )}

          {isCompleted && (
            <div className="w-full text-center text-green-400 text-sm">
              <div className="text-3xl mb-2">✅</div>
              <p>Transfer completed successfully.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default TransferModal