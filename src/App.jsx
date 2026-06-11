// src/App.jsx
import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'

// Route-based lazy loading
const SenderPage = React.lazy(() => import('./pages/SenderPage.jsx'))
const ReceiverPage = React.lazy(() => import('./pages/ReceiverPage.jsx'))
const SettingsPage = React.lazy(() => import('./pages/SettingsPage.jsx'))
const NotFound = React.lazy(() => import('./pages/NotFound.jsx'))

// Simple fallback component (can be replaced with your skeleton)
const RouteFallback = () => (
  <div className="flex justify-center items-center py-10">
    <p className="text-sm text-slate-400">Loading...</p>
  </div>
)

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top navigation */}
      <Navbar />

      {/* Main content area */}
      <main className="flex-1">
        {/* Constrained, responsive container */}
        <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:py-6 lg:py-8">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<SenderPage />} />
              <Route path="/sender" element={<SenderPage />} />
              <Route path="/receiver" element={<ReceiverPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </main>

      {/* App footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-3 text-xs text-slate-400 sm:flex-row sm:text-sm">
          <p className="text-center sm:text-left">
            Powered by <span className="font-medium text-slate-200">Arshan ERP Solutions</span>
          </p>
          <p className="text-center sm:text-right text-slate-500">
            Local Share · Fast, private LAN transfers
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App