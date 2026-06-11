import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import logo from '../assets/logo.png'

// nav icons
import sendIcon from '../assets/sendicon.png'
import receiveIcon from '../assets/reciveicon.png'
import settingIcon from '../assets/setting.png'

// network info
import NetworkInfo from './NetworkInfo.jsx'

const Navbar = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Sender', icon: sendIcon },
    { path: '/receiver', label: 'Receiver', icon: receiveIcon },
    { path: '/settings', label: 'Settings', icon: settingIcon },
  ]

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true
    return location.pathname.startsWith(path) && path !== '/'
  }

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 160, damping: 20 }}
      className="sticky top-0 z-50 bg-overlay backdrop-blur border-b border-subtle"
    >
      <div className="container">
        {/* Top bar */}
        <div className="flex h-14 sm:h-16 items-center justify-between gap-3">
          {/* Left: Brand */}
          <Link
            to="/"
            className="flex items-center gap-2 cursor-pointer min-w-0"
          >
            <img
              src={logo}
              alt="Local Share LAN"
              className="logo-icon"
            />
            <div className="flex flex-col leading-tight truncate">
              <span className="text-sm sm:text-base font-semibold text-main truncate">
                Local Share LAN
              </span>
              <span className="text-[10px] sm:text-[11px] text-muted">
                Fast, private local transfers
              </span>
            </div>
          </Link>

          {/* CENTER: Desktop nav (no dropdown) */}
          <nav className="hidden sm:flex items-center gap-1 mx-4 flex-1 justify-center">
            {navItems.map((item) => {
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    group relative px-4 py-2 rounded-full flex items-center gap-2
                    text-xs sm:text-sm font-medium transition-all
                    ${active
                      ? 'bg-primary-soft text-main shadow-sm'
                      : 'text-soft hover:text-main hover:bg-primary-soft/50'
                    }
                  `}
                >
                  <img
                    src={item.icon}
                    alt={item.label}
                    className="h-4 w-4 opacity-80 group-hover:opacity-100"
                  />
                  <span>{item.label}</span>
                  {active && (
                    <span className="absolute inset-x-3 -bottom-1 h-[2px] rounded-full bg-accent" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* RIGHT: Network info on desktop */}
          <div className="hidden sm:block">
            <NetworkInfo />
          </div>

          {/* Mobile: simple icon nav (NO dropdown) */}
          <nav className="flex sm:hidden items-center gap-2">
            {navItems.map((item) => {
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-label={item.label}
                  className={`
                    relative inline-flex items-center justify-center rounded-full p-1.5
                    ${active ? 'bg-primary-soft' : 'bg-surface'}
                  `}
                >
                  <img
                    src={item.icon}
                    alt={item.label}
                    className="icon-nav"
                  />
                  {active && (
                    <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-accent" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </motion.header>
  )
}

export default Navbar