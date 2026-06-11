// src/context/TransferContext.jsx
import React, { createContext, useContext, useState } from 'react'

const TransferContext = createContext(null)

export const TransferProvider = ({ children }) => {
  const [transfers, setTransfers] = useState([])

  const addTransfer = (transfer) => {
    setTransfers(prev => [...prev, transfer])
  }

  const updateTransfer = (id, updates) => {
    setTransfers(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t)),
    )
  }

  const removeTransfer = (id) => {
    setTransfers(prev => prev.filter(t => t.id !== id))
  }

  const clearTransfers = () => setTransfers([])

  return (
    <TransferContext.Provider
      value={{
        transfers,
        addTransfer,
        updateTransfer,
        removeTransfer,
        clearTransfers,
      }}
    >
      {children}
    </TransferContext.Provider>
  )
}

export const useTransferContext = () => {
  const ctx = useContext(TransferContext)
  if (!ctx) {
    throw new Error('useTransferContext must be used within TransferProvider')
  }
  return ctx
}