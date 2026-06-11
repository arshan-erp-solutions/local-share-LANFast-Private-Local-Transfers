import React from 'react'
import { toast } from 'react-hot-toast'

export const showToast = (message, type = 'info') => {
  const baseOptions = {
    position: 'top-right',
    duration: 3500,
    style: {
      background: '#020617',
      color: '#e5e7eb',
      borderRadius: '999px',
      padding: '8px 14px',
      fontSize: '13px',
      border: '1px solid rgba(148, 163, 184, 0.35)',
    },
  }

  switch (type) {
    case 'success':
      toast.success(message, {
        ...baseOptions,
        icon: '✅',
      })
      break
    case 'error':
      toast.error(message, {
        ...baseOptions,
        icon: '⚠️',
      })
      break
    case 'info':
    default:
      toast(message, {
        ...baseOptions,
        icon: '🔔',
      })
      break
  }
}

// Placeholder component (react-hot-toast <Toaster /> ko main.jsx me mount karte ho)
export const Toast = () => null