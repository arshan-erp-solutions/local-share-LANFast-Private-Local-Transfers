import React from 'react'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div className="min-h-screen">
      {/* Top Navbar */}
      <Navbar />

      <div className="flex">
        {/* Sidebar (Desktop only) */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-6 ml-0 md:ml-64">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="glass mt-auto py-4 text-center text-sm text-gray-400">
        Powered by Arshan ERP Solutions
      </footer>
    </div>
  )
}

export default MainLayout