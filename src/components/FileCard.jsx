import React from 'react'
import { motion } from 'framer-motion'

const FileCard = ({ file, onRemove }) => {
  const getFileBadge = (type) => {
    if (!type) return { label: 'FILE', color: 'bg-blue-500/15 text-blue-300' }
    if (type.startsWith('image/')) return { label: 'IMG', color: 'bg-emerald-500/15 text-emerald-300' }
    if (type.startsWith('video/')) return { label: 'VID', color: 'bg-purple-500/15 text-purple-300' }
    if (type.startsWith('audio/')) return { label: 'AUD', color: 'bg-pink-500/15 text-pink-300' }
    if (type.includes('pdf')) return { label: 'PDF', color: 'bg-red-500/15 text-red-300' }
    if (type.includes('word')) return { label: 'DOC', color: 'bg-sky-500/15 text-sky-300' }
    if (type.includes('excel') || type.includes('sheet')) {
      return { label: 'XLS', color: 'bg-green-500/15 text-green-300' }
    }
    return { label: 'FILE', color: 'bg-blue-500/15 text-blue-300' }
  }

  const formatSize = (bytes) => {
    if (bytes == null) return 'Unknown size'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    if (bytes < 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    }
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }

  const badge = getFileBadge(file.type)

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="glass-soft rounded-md px-3 py-2.5 sm:px-4 sm:py-3"
    >
      <div className="flex items-center gap-3">
        {/* Left: badge */}
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg text-[11px] font-semibold tracking-wide ${badge.color}`}
        >
          {badge.label}
        </div>

        {/* Middle: name + meta */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-main truncate">
            {file.name}
          </p>
          <p className="text-[11px] text-soft mt-0.5 truncate">
            {formatSize(file.size)}
            {file.type && (
              <>
                {' · '}
                <span className="uppercase">
                  {file.type.split('/')[1] || file.type}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Right: remove */}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[12px] text-soft hover:text-red-400 hover:bg-red-500/10 transition-all"
            aria-label="Remove file"
          >
            ✕
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default FileCard