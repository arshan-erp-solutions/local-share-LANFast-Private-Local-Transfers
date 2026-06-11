import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const Sidebar = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Sender', icon: '📤' },
    { path: '/receiver', label: 'Receiver', icon: '📥' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass w-64 min-h-screen p-4 hidden md:block"
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-3xl">🔄</div>
          <h1 className="text-xl font-bold text-primary">Local Share LAN</h1>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${location.pathname === item.path
                ? 'bg-primary text-white'
                : 'text-gray-400 hover:bg-white/10'
              }
            `}
          >
            <span>{item.icon}</span>
            <span className="font-semibold">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        <div className="glass rounded-xl p-4">
          <h3 className="font-semibold mb-2">Quick Stats</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <p>📤 Sent: 0 files</p>
            <p>📥 Received: 0 files</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Sidebar