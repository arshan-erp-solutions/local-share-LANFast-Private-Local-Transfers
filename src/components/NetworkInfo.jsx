import React, { useEffect, useState } from 'react'

const API_PORT = 3001          // Node/Socket server ka port
const FRONTEND_PORT = 5173     // Vite React app ka dev port
const REFRESH_MS = 15000

const NetworkInfo = () => {
  const [serverIp, setServerIp] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchIp = async () => {
    try {
      setError('')
      const host = window.location.hostname
      const res = await fetch(`http://${host}:${API_PORT}/api/local-ip`)
      if (!res.ok) throw new Error('Failed to fetch IP')
      const data = await res.json()
      setServerIp(data.ip || '')
    } catch (err) {
      console.error('NetworkInfo error', err)
      setError('IP not available')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIp()
    const id = setInterval(fetchIp, REFRESH_MS)
    return () => clearInterval(id)
  }, [])

  const shareUrl = serverIp ? `http://${serverIp}:${FRONTEND_PORT}` : ''

  const handleCopy = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      alert('URL copied: ' + shareUrl)
    } catch {
      alert('Copy failed, URL: ' + shareUrl)
    }
  }

  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm px-3 py-2 rounded-md bg-surface border border-subtle">
      <span className="font-medium text-soft">Connect on LAN:</span>

      {loading ? (
        <span className="text-muted">Detecting…</span>
      ) : error ? (
        <span className="text-red-400">{error}</span>
      ) : (
        <>
          <span className="font-mono text-accent text-[11px] sm:text-xs">
            {shareUrl || '—'}
          </span>
          {shareUrl && (
            <button
              type="button"
              onClick={handleCopy}
              className="ml-1 rounded-full border border-subtle px-2 py-[2px] text-[11px] text-soft hover:bg-primary-soft hover:text-main transition"
            >
              Copy
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default NetworkInfo