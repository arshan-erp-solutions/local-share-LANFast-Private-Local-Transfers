// src/hooks/useTransfer.js
import { useState, useCallback } from 'react'
import { showToast } from '../components/Toast.jsx'
import { useTransferContext } from '../context/TransferContext.jsx'
import { useSettings } from '../context/SettingsContext.jsx'

// ✅ dynamic host: same IP jahan se UI open hui
const SERVER_PORT = 3001
const getServerHost = () => window.location.hostname || 'localhost'

// Helper: bytes -> human-readable string
const formatBytes = (bytes) => {
  if (!bytes || bytes <= 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const value = bytes / Math.pow(k, i)
  return `${value.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`
}

// Helper: seconds -> "1m 23s" style
const formatDuration = (seconds) => {
  if (!seconds || seconds === Infinity) return '—'
  const s = Math.max(0, Math.round(seconds))
  const m = Math.floor(s / 60)
  const rem = s % 60
  if (m === 0) return `${rem}s`
  return `${m}m ${rem}s`
}

export const useTransfer = () => {
  const {
    addTransfer,
    updateTransfer,
    removeTransfer,
  } = useTransferContext()

  // history + addToHistory ab SettingsContext me hain
  const { addToHistory } = useSettings()

  const [uploading, setUploading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentSpeed, setCurrentSpeed] = useState(0)

  // ✅ REAL upload to server with live progress, returns downloadUrl
  const sendFile = useCallback(
    async (file, _receiverIp) => {
      const transferId = `transfer_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`

      const transferData = {
        id: transferId,
        file,
        receiverIp: _receiverIp,
        status: 'uploading',
        progress: 0,
        speed: '0 MB/s',
        remainingTime: '—',
        uploadedHuman: '0 B',
        totalHuman: formatBytes(file.size),
        timestamp: new Date(),
      }

      addTransfer(transferData)
      setUploading(true)
      setProgress(0)
      setCurrentSpeed(0)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const SERVER_HOST = getServerHost()
        const uploadUrl = `http://${SERVER_HOST}:${SERVER_PORT}/api/transfer/upload`

        const startTime = Date.now()
        const xhr = new XMLHttpRequest()

        const promise = new Promise((resolve, reject) => {
          xhr.open('POST', uploadUrl, true)

          // Progress event
          xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) return

            const loaded = event.loaded
            const total = event.total

            const percent = (loaded / total) * 100
            const elapsedSec = (Date.now() - startTime) / 1000

            const loadedMB = loaded / (1024 * 1024)
            const totalMB = total / (1024 * 1024)
            const speedMBps = elapsedSec > 0 ? loadedMB / elapsedSec : 0

            const remainingBytes = total - loaded
            const speedBytesPerSec = speedMBps * 1024 * 1024
            const remainingSec =
              speedBytesPerSec > 0 ? remainingBytes / speedBytesPerSec : Infinity

            setProgress(percent)
            setCurrentSpeed(speedMBps)

            updateTransfer(transferId, {
              status: 'uploading',
              progress: percent,
              speed: `${speedMBps.toFixed(1)} MB/s`,
              remainingTime: formatDuration(remainingSec),
              uploadedHuman: formatBytes(loaded),
              totalHuman: formatBytes(total),
            })
          }

          xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const data = JSON.parse(xhr.responseText)
                  resolve(data)
                } catch (e) {
                  reject(new Error('Invalid server response'))
                }
              } else {
                reject(
                  new Error(`Upload failed with status ${xhr.status}`),
                )
              }
            }
          }

          xhr.onerror = () => {
            reject(new Error('Network error during upload'))
          }

          xhr.send(formData)
        })

        const data = await promise

        if (!data.success) {
          throw new Error(data.error || 'Upload failed')
        }

        // Upload complete
        setProgress(100)

        updateTransfer(transferId, {
          status: 'completed',
          progress: 100,
          speed: `${currentSpeed.toFixed(1)} MB/s`,
          remainingTime: '0s',
          uploadedHuman: formatBytes(file.size),
          totalHuman: formatBytes(file.size),
          downloadUrl: data.downloadUrl,
          storedName: data.storedName,
        })

        addToHistory({
          ...transferData,
          status: 'completed',
          progress: 100,
          remainingTime: '0s',
          uploadedHuman: formatBytes(file.size),
          totalHuman: formatBytes(file.size),
          downloadUrl: data.downloadUrl,
          storedName: data.storedName,
        })

        showToast('File uploaded to server!', 'success')

        return {
          success: true,
          transferId,
          downloadUrl: data.downloadUrl,
          storedName: data.storedName,
        }
      } catch (error) {
        console.error('sendFile error', error)
        updateTransfer(transferId, {
          status: 'failed',
          error: error.message,
        })

        showToast(`Failed to send file: ${error.message}`, 'error')

        return { success: false, error: error.message }
      } finally {
        setUploading(false)
      }
    },
    [addTransfer, updateTransfer, addToHistory, currentSpeed],
  )

  // Baaki helpers
  const receiveFile = useCallback(
    (transferData) => {
      const transferId = `transfer_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`

      const transfer = {
        id: transferId,
        ...transferData,
        status: 'pending',
        progress: 0,
      }

      addTransfer(transfer)
      showToast('Incoming file transfer!', 'info')

      return transferId
    },
    [addTransfer],
  )

  const acceptTransfer = useCallback(
    (transferId) => {
      updateTransfer(transferId, { status: 'accepting' })
      showToast('Transfer accepted!', 'success')
    },
    [updateTransfer],
  )

  const rejectTransfer = useCallback(
    (transferId) => {
      updateTransfer(transferId, { status: 'rejected' })
      removeTransfer(transferId)
      showToast('Transfer rejected', 'info')
    },
    [updateTransfer, removeTransfer],
  )

  const cancelTransfer = useCallback(
    (transferId) => {
      updateTransfer(transferId, { status: 'cancelled' })
      removeTransfer(transferId)
      showToast('Transfer cancelled', 'info')
    },
    [updateTransfer, removeTransfer],
  )

  const completeTransfer = useCallback(
    (transferId) => {
      updateTransfer(transferId, {
        status: 'completed',
        progress: 100,
      })

      const transfer = { id: transferId }
      addToHistory(transfer)
      removeTransfer(transferId)

      showToast('File received successfully!', 'success')
    },
    [updateTransfer, addToHistory, removeTransfer],
  )

  return {
    // State
    uploading,
    downloading,
    progress,
    currentSpeed,

    // Actions
    sendFile,
    receiveFile,
    acceptTransfer,
    rejectTransfer,
    cancelTransfer,
    completeTransfer,
  }
}