// src/pages/SenderPage.jsx
import React, { useState, useMemo, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import DeviceList from '../components/DeviceList.jsx'
import FileCard from '../components/FileCard.jsx'
import TransferCard from '../components/TransferCard.jsx'
import { useDevices } from '../hooks/useDevices.js'
import { useTransfer } from '../hooks/useTransfer.js'
import { useSocketContext } from '../context/SocketContext.jsx'
import { showToast } from '../components/Toast.jsx'
import { useSettings } from '../context/SettingsContext.jsx'

import fileSelectionIcon from '../assets/fileselection.png'
import sendIcon from '../assets/sendicon.png'

const SERVER_PORT = 3001
const SERVER_HOST = window.location.hostname

const SenderPage = () => {
  const { devices, localIP, discovering, discoverDevices } = useDevices()
  const { sendFile, cancelTransfer, uploading, progress } = useTransfer()
  const { socket, connected } = useSocketContext()
  const { settings } = useSettings()

  const [selectedFiles, setSelectedFiles] = useState([])
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [transfers, setTransfers] = useState([])

  // Handlers memoized
  const onDrop = useCallback((files) => {
    if (!files?.length) return
    setSelectedFiles((prev) => [...prev, ...files])
    showToast(`Added ${files.length} file(s)`, 'success')
  }, [])

  const removeFile = useCallback((index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSend = useCallback(
    async () => {
      if (!selectedFiles.length) {
        showToast('Please select files to send', 'error')
        return
      }

      if (!selectedDevice) {
        showToast('Please select a device', 'error')
        return
      }

      if (!connected || !socket) {
        showToast('Not connected to server', 'error')
        return
      }

      const targetDeviceId =
        selectedDevice.deviceId || selectedDevice.id || null

      if (!targetDeviceId) {
        showToast('Selected device has no valid id', 'error')
        return
      }

      for (const file of selectedFiles) {
        const result = await sendFile(file, selectedDevice.ip)

        if (!result.success) {
          showToast(`Failed to upload file: ${result.error}`, 'error')
          continue
        }

        const { downloadUrl, transferId } = result

        socket.emit('send_request', {
          senderName: settings.deviceName || 'Unknown Device',
          senderIp: localIP,
          senderDeviceId: settings.deviceId,
          receiverDeviceId: targetDeviceId,
          transferId,
          fileData: {
            name: file.name,
            size: file.size,
            type: file.type,
            downloadUrl,
          },
        })

        const newTransfer = {
          id: transferId,
          file,
          receiverIp: selectedDevice.ip,
          receiverDeviceId: targetDeviceId,
          status: 'completed',
          progress: 100,
        }

        setTransfers((prev) => [newTransfer, ...prev])

        showToast('File sent (ready to download on receiver)', 'success')
      }

      setSelectedFiles([])
      setSelectedDevice(null)
    },
    [
      selectedFiles,
      selectedDevice,
      connected,
      socket,
      sendFile,
      settings.deviceName,
      settings.deviceId,
      localIP,
    ],
  )

  const handleCancelTransfer = useCallback(
    async (transferId) => {
      cancelTransfer(transferId)

      try {
        await fetch(`http://${SERVER_HOST}:${SERVER_PORT}/api/cancel-transfer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transferId }),
        })
      } catch (err) {
        console.error('cancel-transfer cleanup error', err)
      }

      setTransfers((prev) => prev.filter((t) => t.id !== transferId))
    },
    [cancelTransfer],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    disabled: uploading,
  })

  const filteredDevices = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return devices
      .filter((d) => {
        if (d.deviceId && settings.deviceId) {
          // self device hide
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
            Send files over LAN
          </h1>
          <p className="text-sm text-muted">
            Drop your files, pick a device, and we handle the rest.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="px-3 py-2 rounded-md bg-surface border border-subtle">
            <span className="text-soft">Your IP: </span>
            <span className="font-medium text-accent">{localIP || '—'}</span>
          </div>
          <div
            className={`px-3 py-2 rounded-md border text-xs sm:text-sm flex items-center gap-2 ${
              connected
                ? 'border-strong bg-success-soft text-green-400'
                : 'border-strong bg-danger-soft text-red-400'
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
        {/* Left column: Files & transfers */}
        <div className="space-y-6">
          {/* File chooser */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-lg p-5 sm:p-6"
          >
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">
                  Choose files to send
                </h2>
                <p className="text-xs sm:text-sm text-muted mt-1">
                  Drag &amp; drop files below, or click the area to browse.
                </p>
              </div>
              {selectedFiles.length > 0 && (
                <div className="text-xs text-soft text-right">
                  <span className="font-medium text-main">
                    {selectedFiles.length}
                  </span>{' '}
                  file{selectedFiles.length > 1 ? 's' : ''} selected
                </div>
              )}
            </div>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`
                relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed text-center cursor-pointer transition-all overflow-hidden
                p-6 sm:p-8
                ${
                  isDragActive
                    ? 'border-accent bg-primary-soft/80'
                    : 'border-subtle bg-surface hover:bg-primary-soft/40'
                }
                ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input {...getInputProps()} />
              <div className="mb-3 sm:mb-4 flex justify-center">
                <img
                  src={fileSelectionIcon}
                  alt="Select files"
                  className="icon-file-selection"
                />
              </div>
              <p className="text-base sm:text-lg font-semibold">
                {isDragActive ? 'Drop files to add' : 'Drag & drop files here'}
              </p>
              <p className="text-xs sm:text-sm text-muted mt-1">
                or click anywhere in this box to choose from your device.
              </p>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface/70 px-4 py-2 text-[11px] sm:text-xs text-soft">
                <span className="font-medium text-main">Tips</span>
                <span className="opacity-80">
                  You can select multiple files at once. Folders are not
                  supported.
                </span>
              </div>
            </div>

            {/* Selected files list */}
            {selectedFiles.length > 0 && (
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-soft">
                    Selected files
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedFiles([])}
                    className="text-[11px] text-soft hover:text-red-400 transition"
                  >
                    Clear all
                  </button>
                </div>
                <AnimatePresence>
                  {selectedFiles.map((file, index) => (
                    <FileCard
                      key={`${file.name}-${index}`}
                      file={file}
                      onRemove={() => removeFile(index)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* Transfers */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-lg p-5 sm:p-6"
          >
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">
                Recent transfers
              </h2>
              <span className="text-xs text-soft">
                {transfers.length} record(s)
              </span>
            </div>

            {transfers.length === 0 ? (
              <p className="text-sm text-muted text-center py-4">
                No transfers yet. Start by sending a file to a device.
              </p>
            ) : (
              <div className="space-y-3">
                {transfers.map((transfer) => (
                  <TransferCard
                    key={transfer.id}
                    transfer={transfer}
                    onCancel={() => handleCancelTransfer(transfer.id)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right column: Devices & send */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-lg p-5 sm:p-6 h-full"
          >
            {/* Devices header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">
                  Available devices
                </h2>
                <p className="text-xs sm:text-sm text-muted mt-1">
                  Devices on your local network that can receive files.
                </p>
              </div>
              <button
                type="button"
                onClick={discoverDevices}
                disabled={discovering}
                className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs sm:text-sm font-medium text-white transition-all hover:bg-accent-strong disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {discovering ? 'Scanning…' : '🔍 Discover'}
              </button>
            </div>

            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by name or IP…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-subtle bg-surface px-3 py-2 text-sm text-main placeholder:text-soft focus:outline-none focus:ring-2"
              />
            </div>

            {/* Device list */}
            <DeviceList
              devices={filteredDevices}
              onSelectDevice={setSelectedDevice}
              selectedDevice={selectedDevice}
            />

            {/* Selected device + send CTA */}
            {selectedDevice && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-3"
              >
                <div className="glass-soft p-4 rounded-md">
                  <p className="text-xs text-soft mb-1">Selected device</p>
                  <p className="text-sm font-medium text-main">
                    {selectedDevice.name}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {selectedDevice.ip} ·{' '}
                    {selectedDevice.deviceId || selectedDevice.id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={uploading || selectedFiles.length === 0}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm sm:text-base font-semibold text-white transition-all hover:bg-accent-strong disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <span>⏳</span>
                      <span>Sending… {progress.toFixed(0)}%</span>
                    </>
                  ) : (
                    <>
                      <img
                        src={sendIcon}
                        alt="Send"
                        className="icon"
                      />
                      <span>
                        Send {selectedFiles.length} file
                        {selectedFiles.length > 1 ? 's' : ''}
                      </span>
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Hint */}
      {selectedFiles.length > 0 && !selectedDevice && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs sm:text-sm text-muted"
        >
          👉 Select a device on the right to send your selected file(s).
        </motion.p>
      )}
    </div>
  )
}

export default SenderPage