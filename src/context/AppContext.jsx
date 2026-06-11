import React from 'react'
import { SettingsProvider } from './SettingsContext.jsx'
import { DeviceProvider } from './DeviceContext.jsx'
import { TransferProvider } from './TransferContext.jsx'

export const AppProvider = ({ children }) => {
  return (
    <SettingsProvider>
      <DeviceProvider>
        <TransferProvider>{children}</TransferProvider>
      </DeviceProvider>
    </SettingsProvider>
  )
}

// Optional: agar koi purani jagah se useApp call kare to clear error dikh jaye
export const useApp = () => {
  throw new Error(
    'useApp deprecated hai. useSettings/useDevicesContext/useTransferContext use karo.',
  )
}