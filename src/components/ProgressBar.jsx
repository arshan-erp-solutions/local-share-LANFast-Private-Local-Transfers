import React from 'react'
import { motion } from 'framer-motion'

const ProgressBar = ({ progress = 0 }) => {
  const clamped = Math.min(100, Math.max(0, progress))

  return (
    <div className="w-full h-2 rounded-full bg-surface overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="h-full rounded-full bg-accent"
      />
    </div>
  )
}

export default ProgressBar