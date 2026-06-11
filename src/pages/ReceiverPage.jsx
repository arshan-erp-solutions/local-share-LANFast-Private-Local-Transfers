import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DeviceList from '../components/DeviceList.jsx'
import TransferCard from '../components/TransferCard.jsx'
import TransferModal from '../components/TransferModal.jsx'
import { useDevices } from '../hooks/useDevices.js'
import { useSocketContext } from '../context/SocketContext.jsx'
import { useTransferContext } from '../context/TransferContext.jsx'
import { useSettings } from '../context/SettingsContext.jsx'
import { showToast } from '../components/Toast.jsx'

// icons
import devicesIcon from '../assets/devices.png'
import receiveIcon from '../assets/reciveicon.png'
import searchIcon from '../assets/searchicon.png'

// dynamic host/port (same server as backend)
const SERVER_PORT = 3001
const getServerHost = () => window.location.hostname || 'localhost'

const ReceiverPage = () => {
  const { devices, localIP, discovering, discoverDevices } = useDevices()
  const { socket, connected } = useSocketContext()

  // Transfers global context
  const { transfers } = useTransferContext()

  // incomingRequests + setter SettingsContext me
  const { incomingRequests, setIncomingRequests, settings } = useSettings()

  const [selectedDevice, setSelectedDevice] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [savePath, setSavePath] = useState('')

  // Latest pending request for modal
  const latestIncoming = useMemo(
    () => incomingRequests.find((r) => r.status === 'pending') || null,
    [incomingRequests],
  )

  // current host use
  const buildFullDownloadUrl = (relativeUrl) => {
    if (!relativeUrl) return null
    const host = getServerHost()
    return `http://${host}:${SERVER_PORT}${relativeUrl}`
  }

  const triggerDownload = (fullUrl, filename) => {
    try {
      const link = document.createElement('a')
      link.href = fullUrl
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (e) {
      console.error('download error', e)
      window.open(fullUrl, '_blank')
    }
  }

  const handleAccept = () => {
    if (!latestIncoming) return

    const downloadUrl = latestIncoming.fileData?.downloadUrl
    const fullUrl = buildFullDownloadUrl(downloadUrl)

    if (!fullUrl) {
      showToast('No download URL found for this file', 'error')
      return
    }

    const path =
      savePath || localStorage.getItem('defaultSaveFolder') || './downloads'

    const transferId = latestIncoming.id

    // (optional) yahan transfer context me koi UI entry add/update kar sakte ho

    // Browser download trigger
    triggerDownload(fullUrl, latestIncoming.fileData?.name)

    showToast('Download started. Check your browser downloads.', 'success')

    setIncomingRequests((prev) =>
      prev.filter((r) => r.id !== latestIncoming.id),
    )
  }

  const handleReject = () => {
    if (!latestIncoming) return

    const transferId = latestIncoming.id

    // backend ko batao ke reject hua
    if (socket) {
      socket.emit('reject_transfer', { transferId })
    }

    // UI se remove
    setIncomingRequests((prev) =>
      prev.filter((r) => r.id !== latestIncoming.id),
    )

    showToast('Transfer rejected', 'info')
  }

  // 🔥 yahan self device hide + search filter dono
  const filteredDevices = useMemo(() => {
    const term = searchTerm.toLowerCase()

    return devices
      .filter((d) => {
        if (d.deviceId && settings.deviceId) {
          // apna khud ka device list se hide karo
          return d.deviceId !== settings.deviceId
        }
        return true
      })
      .filter((d) => {
        const name = (d.name || '').toLowerCase()
        const ip = d.ip || ''
        return name.includes(term) || ip.includes(searchTerm)
      })
  }, [devices, settings.deviceId, searchTerm])

  const activeTransfers = useMemo(
    () =>
      transfers.filter(
        (t) => t.status !== 'completed' && t.status !== 'failed',
      ),
    [transfers],
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-soft p-4 rounded-lg flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="text-left">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-1">
            Receive files over LAN
          </h1>
          <p className="text-sm text-muted">
            Keep this screen open to accept incoming transfers.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="px-3 py-2 rounded-md bg-surface">
            <span className="text-soft">Your IP: </span>
            <span className="font-medium text-accent">{localIP || '—'}</span>
          </div>
          <div
            className={`px-3 py-2 rounded-md text-xs sm:text-sm flex items-center gap-2 ${
              connected
                ? 'bg-success-soft text-green-400'
                : 'bg-danger-soft text-red-400'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                connected ? 'bg-green-400' : 'bg-red-400'
              }`}
            />
            <span>{connected ? 'Connected to server' : 'Disconnected'}</span>
          </div>
        </div>
      </motion.section>

      {/* Main grid */}
      <section className="grid lg-grid-2 gap-6">
        {/* Left: Devices list */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-lg p-5 sm:p-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div className="flex items-center gap-2">
                <img
                  src={devicesIcon}
                  alt="Devices"
                  className="icon-lg"
                />
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold">
                    Devices on your LAN
                  </h2>
                  <p className="text-xs sm:text-sm text-muted mt-1">
                    See who&apos;s currently discoverable on the network.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={discoverDevices}
                disabled={discovering}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-xs sm:text-sm font-medium text-white transition-all hover:bg-accent-strong disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{discovering ? 'Scanning…' : 'Discover'}</span>
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 rounded-md bg-surface px-3 py-2 border border-subtle">
                <img
                  src={searchIcon}
                  alt="Search"
                  className="icon"
                />
                <input
                  type="text"
                  placeholder="Search by device name or IP…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-sm text-main placeholder:text-soft focus:outline-none"
                />
              </div>
            </div>

            <DeviceList
              devices={filteredDevices}
              onSelectDevice={setSelectedDevice}
              selectedDevice={selectedDevice}
            />
          </motion.div>
        </div>

        {/* Right: Active transfers + save settings */}
        <div className="space-y-6">
          {/* Active transfers */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-lg p-5 sm:p-6"
          >
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <img
                  src={receiveIcon}
                  alt="Active transfers"
                  className="icon-lg"
                />
                <h2 className="text-lg sm:text-xl font-semibold">
                  Active transfers
                </h2>
              </div>
              <span className="text-xs text-soft">
                {activeTransfers.length} in progress
              </span>
            </div>

            {activeTransfers.length === 0 ? (
              <div className="text-center text-muted py-8">
                <div className="mb-3 sm:mb-4 flex justify-center">
                  <img
                    src={receiveIcon}
                    alt="No transfers"
                    className="icon-lg"
                  />
                </div>
                <p className="text-sm">
                  No active transfers. Waiting for incoming files…
                </p>
                <p className="text-xs text-soft mt-1">
                  When someone sends you a file, you&apos;ll see a prompt here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeTransfers.map((transfer) => (
                  <TransferCard key={transfer.id} transfer={transfer} />
                ))}
              </div>
            )}
          </motion.div>

          {/* Save settings */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-lg p-5 sm:p-6"
          >
            <h2 className="text-lg sm:text-xl font-semibold mb-3">
              Download location
            </h2>
            <p className="text-xs sm:text-sm text-muted mb-3">
              Your browser usually asks where to save files. You can store a
              preferred folder path here for reference or for future automation.
            </p>
            <input
              type="text"
              placeholder="Example: D:\\Downloads\\LocalShare"
              value={savePath}
              onChange={(e) => setSavePath(e.target.value)}
              className="w-full rounded-md border border-subtle bg-surface px-3 py-2 text-sm text-main placeholder:text-soft focus:outline-none focus:ring-2"
            />
            <p className="text-xs text-soft mt-2">
              If left empty, the default browser download folder is used.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Incoming transfer modal */}
      <AnimatePresence>
        {latestIncoming && (
          <TransferModal
            transfer={{
              id: latestIncoming.id,
              senderName: latestIncoming.senderName,
              senderIp: latestIncoming.senderIp,
              fileName: latestIncoming.fileData?.name,
              fileSize: latestIncoming.fileData?.size,
              fileType: latestIncoming.fileData?.type,
              status: latestIncoming.status,
            }}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default ReceiverPage