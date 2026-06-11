import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import SettingsCard from '../components/SettingsCard.jsx'
import ThemeSwitcher from '../components/ThemeSwitcher.jsx'
import { useSettings } from '../context/SettingsContext.jsx'
import { useDevices } from '../hooks/useDevices.js'
import { showToast } from '../components/Toast.jsx'

// simple mobile detect (enough for UI toggles)
const isMobileDevice = () =>
  /android|iphone|ipad|ipod|opera mini|iemobile|wpdesktop/i.test(
    navigator.userAgent || '',
  )

const SettingsPage = () => {
  const { settings, updateSettings, clearCache, resetSettings } = useSettings()
  const { localIP, discoverDevices } = useDevices()

  const isMobile = useMemo(() => isMobileDevice(), [])

  const handleSaveFolderChange = (e) => {
    updateSettings({ defaultSaveFolder: e.target.value })
    showToast('Save folder updated', 'success')
  }

  const handleDeviceNameChange = (e) => {
    const value = e.target.value
    updateSettings({ deviceName: value })
    showToast('Device name updated', 'success')
  }

  const handlePortChange = (e) => {
    const value = parseInt(e.target.value, 10)
    updateSettings({ port: value || 3001 })
    showToast('Port updated (reconnect required)', 'info')
  }

  const handleChunkSizeChange = (e) => {
    const value = parseInt(e.target.value, 10)
    updateSettings({ chunkSize: value || 1048576 })
    showToast('Chunk size updated', 'success')
  }

  const handleRetryAttemptsChange = (e) => {
    const value = parseInt(e.target.value, 10)
    updateSettings({ retryAttempts: value || 3 })
    showToast('Retry attempts updated', 'success')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-soft p-4 rounded-lg flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold mb-1">
            Settings
          </h1>
          <p className="text-sm text-muted">
            Configure how Local Share LAN behaves on this device.
          </p>
        </div>
        <div className="text-xs sm:text-sm text-soft">
          Device ID:{' '}
          <span className="font-mono text-main break-all">
            {settings.deviceId || '—'}
          </span>
        </div>
      </motion.section>

      {/* Cards grid */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* General */}
        <SettingsCard title="General" icon="⚙️">
          <div className="space-y-4">
            {/* Desktop: default save folder visible; Mobile: hide */}
            {!isMobile && (
              <div>
                <label className="text-xs font-medium text-soft block mb-1">
                  Default save folder
                </label>
                <input
                  type="text"
                  value={settings.defaultSaveFolder}
                  onChange={handleSaveFolderChange}
                  placeholder="Example: D:\\Downloads\\LocalShare"
                  className="w-full rounded-md border border-subtle bg-surface px-3 py-2 text-sm text-main placeholder:text-soft focus:outline-none focus:ring-2"
                />
                <p className="text-xs text-soft mt-1">
                  Reference path for where you keep received files on this PC.
                </p>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-soft block mb-1">
                Theme
              </label>
              <ThemeSwitcher />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-soft block">
                Behaviour
              </label>
              <div className="flex items-center gap-2 text-xs text-main">
                <input
                  type="checkbox"
                  id="autoAccept"
                  checked={settings.autoAccept}
                  onChange={(e) =>
                    updateSettings({ autoAccept: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="autoAccept">
                  Auto‑accept transfers from trusted devices
                </label>
              </div>

              <div className="flex items-center gap-2 text-xs text-main">
                <input
                  type="checkbox"
                  id="autoDiscover"
                  checked={settings.autoDiscover}
                  onChange={(e) =>
                    updateSettings({ autoDiscover: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="autoDiscover">
                  Auto‑discover devices on startup
                </label>
              </div>
            </div>
          </div>
        </SettingsCard>

        {/* Network */}
        <SettingsCard title="Network" icon="🔗">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-soft block mb-1">
                Local IP
              </label>
              <input
                type="text"
                value={localIP}
                disabled
                className="w-full rounded-md border border-subtle bg-surface px-3 py-2 text-sm text-soft"
              />
              <p className="text-xs text-soft mt-1">
                IP address used by other devices on your LAN to reach this
                device.
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-soft block mb-1">
                Device name
              </label>
              <input
                type="text"
                value={settings.deviceName || ''}
                onChange={handleDeviceNameChange}
                placeholder={
                  isMobile ? 'Example: D Arshu Phone' : 'Example: Office‑PC'
                }
                className="w-full rounded-md border border-subtle bg-surface px-3 py-2 text-sm text-main placeholder:text-soft focus:outline-none focus:ring-2"
              />
              <p className="text-xs text-soft mt-1">
                Shown to other devices when you send or receive files.
              </p>
            </div>

            {/* Port: desktop me dikhana useful, mobile pe optional (hide for simplicity) */}
            {!isMobile && (
              <div>
                <label className="text-xs font-medium text-soft block mb-1">
                  Port
                </label>
                <input
                  type="number"
                  value={settings.port}
                  onChange={handlePortChange}
                  className="w-full rounded-md border border-subtle bg-surface px-3 py-2 text-sm text-main focus:outline-none focus:ring-2"
                />
                <p className="text-xs text-soft mt-1">
                  Changing the port requires restarting the server.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={discoverDevices}
              className="w-full inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs sm:text-sm font-medium text-white transition-all hover:bg-accent-strong"
            >
              🔍 Refresh discovery
            </button>
          </div>
        </SettingsCard>

        {/* Transfers */}
        <SettingsCard title="Transfers" icon="📦">
          <div className="space-y-4">
            {/* Chunk size: PC user ko control useful, mobile pe bhi rehne do but advanced jaisa feel */}
            <div>
              <label className="text-xs font-medium text-soft block mb-1">
                Chunk size (bytes)
              </label>
              <input
                type="number"
                value={settings.chunkSize}
                onChange={handleChunkSizeChange}
                className="w-full rounded-md border border-subtle bg-surface px-3 py-2 text-sm text-main focus:outline-none focus:ring-2"
              />
              <p className="text-xs text-soft mt-1">
                {(settings.chunkSize / 1048576).toFixed(2)} MB per chunk. Larger
                chunks = fewer requests, but more memory usage.
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-soft block mb-1">
                Retry attempts
              </label>
              <input
                type="number"
                value={settings.retryAttempts}
                onChange={handleRetryAttemptsChange}
                className="w-full rounded-md border border-subtle bg-surface px-3 py-2 text-sm text-main focus:outline-none focus:ring-2"
              />
              <p className="text-xs text-soft mt-1">
                How many times to retry a failed chunk before giving up.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-main">
              <input
                type="checkbox"
                id="transferConfirmation"
                checked={settings.transferConfirmation}
                onChange={(e) =>
                  updateSettings({ transferConfirmation: e.target.checked })
                }
                className="w-4 h-4"
              />
              <label htmlFor="transferConfirmation">
                Always ask before starting a transfer
              </label>
            </div>
          </div>
        </SettingsCard>

        {/* Security – simple counts only (no edit UI yet) */}
        <SettingsCard title="Security" icon="🔒">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-soft block mb-1">
                Trusted devices
              </label>
              <div className="rounded-md border border-subtle bg-surface px-3 py-2 text-xs text-soft">
                {settings.trustedDevices.length} device
                {settings.trustedDevices.length !== 1 ? 's' : ''}
              </div>
              <p className="text-xs text-soft mt-1">
                Transfers from trusted devices can be auto‑accepted if enabled.
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-soft block mb-1">
                Blocked devices
              </label>
              <div className="rounded-md border border-subtle bg-surface px-3 py-2 text-xs text-soft">
                {settings.blockedDevices.length} device
                {settings.blockedDevices.length !== 1 ? 's' : ''}
              </div>
              <p className="text-xs text-soft mt-1">
                Blocked devices cannot send you files.
              </p>
            </div>
          </div>
        </SettingsCard>

        {/* Advanced – sirf jo sach me useful hai woh rakho */}
        <SettingsCard title="Advanced" icon="🧹">
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                clearCache()
                showToast('Cache cleared', 'success')
              }}
              className="w-full inline-flex items-center justify-center rounded-full bg-danger-soft px-4 py-2 text-xs sm:text-sm font-medium text-red-400 transition-all hover:bg-red-500/25"
            >
              🗑️ Clear cache
            </button>

            <button
              type="button"
              onClick={() => {
                resetSettings()
                showToast('Settings reset to defaults', 'success')
              }}
              className="w-full inline-flex items-center justify-center rounded-full bg-warning-soft px-4 py-2 text-xs sm:text-sm font-medium text-yellow-400 transition-all hover:bg-orange-500/25"
            >
              🔧 Reset settings
            </button>
          </div>
        </SettingsCard>
      </section>
    </div>
  )
}

export default SettingsPage