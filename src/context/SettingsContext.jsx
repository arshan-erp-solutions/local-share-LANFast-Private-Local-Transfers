// src/context/SettingsContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'

const SettingsContext = createContext(null)

const DEFAULT_SETTINGS = {
  defaultSaveFolder: './downloads',
  theme: 'dark',
  autoAccept: false,
  autoDiscover: true,
  deviceName: null,
  deviceId: null,
  port: 3001,
  chunkSize: 1048576,
  retryAttempts: 3,
  trustedDevices: [],
  blockedDevices: [],
  transferConfirmation: true,
}

const generateDeviceId = () => {
  return `dev_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`
}

const generateDeviceName = () => {
  return `Device-${Math.random().toString(36).substr(2, 4)}`
}

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [history, setHistory] = useState([])
  const [incomingRequests, setIncomingRequests] = useState([])

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('localShareSettings')
      const savedName = localStorage.getItem('deviceName')
      const savedDeviceId = localStorage.getItem('deviceId')

      let next = { ...DEFAULT_SETTINGS }

      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        next = { ...next, ...parsed }
      }

      if (savedName) {
        next.deviceName = savedName
      } else {
        next.deviceName = generateDeviceName()
        localStorage.setItem('deviceName', next.deviceName)
      }

      if (savedDeviceId) {
        next.deviceId = savedDeviceId
      } else {
        const newId = generateDeviceId()
        next.deviceId = newId
        localStorage.setItem('deviceId', newId)
      }

      setSettings(next)
    } catch (e) {
      console.error('Failed to load settings', e)
      const newId = generateDeviceId()
      const newName = generateDeviceName()
      setSettings(prev => ({ ...prev, deviceId: newId, deviceName: newName }))
      localStorage.setItem('deviceId', newId)
      localStorage.setItem('deviceName', newName)
    }
  }, [])

  useEffect(() => {
    try {
      const { deviceName, deviceId, ...rest } = settings
      localStorage.setItem('localShareSettings', JSON.stringify(rest))
      if (deviceName) localStorage.setItem('deviceName', deviceName)
      if (deviceId) localStorage.setItem('deviceId', deviceId)
    } catch (e) {
      console.error('Failed to save settings', e)
    }
  }, [settings])

  useEffect(() => {
    const savedHistory = localStorage.getItem('localShareHistory')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('localShareHistory', JSON.stringify(history))
  }, [history])

  const updateSettings = (newSettings) => {
    setSettings(prev => {
      const merged = { ...prev, ...newSettings }

      if (!merged.deviceName) {
        merged.deviceName =
          localStorage.getItem('deviceName') || generateDeviceName()
        localStorage.setItem('deviceName', merged.deviceName)
      }

      if (!merged.deviceId) {
        merged.deviceId =
          localStorage.getItem('deviceId') || generateDeviceId()
        localStorage.setItem('deviceId', merged.deviceId)
      }

      return merged
    })
  }

  const addToHistory = (transfer) => {
    setHistory(prev => [...prev, { ...transfer, timestamp: new Date() }])
  }

  const clearCache = () => {
    localStorage.clear()
    setSettings(DEFAULT_SETTINGS)
    setHistory([])
    setIncomingRequests([])
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    localStorage.setItem('localShareSettings', JSON.stringify(DEFAULT_SETTINGS))
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        history,
        addToHistory,
        clearCache,
        resetSettings,
        incomingRequests,
        setIncomingRequests,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const ctx = useContext(SettingsContext)
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return ctx
}