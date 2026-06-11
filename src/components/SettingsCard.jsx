import React from 'react'
import { motion } from 'framer-motion'

const SettingsCard = ({ title, children, icon }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-soft rounded-lg p-4 sm:p-5 h-full flex flex-col gap-3 border border-subtle"
    >
      <header className="flex items-center gap-3 mb-1">
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-surface text-xl">
            {icon}
          </div>
        )}
        <h3 className="text-sm sm:text-base font-semibold text-main">
          {title}
        </h3>
      </header>

      <div className="text-xs sm:text-sm text-main space-y-3">
        {children}
      </div>
    </motion.section>
  )
}

export default SettingsCard