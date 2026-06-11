export const discoveryService = {
  async getLocalIP() {
    try {
      // Method 1: Use window.location for local development
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return window.location.hostname
      }

      // Method 2: Try to get from backend
      try {
        const response = await fetch('http://localhost:3001/api/local-ip')
        const data = await response.json()
        if (data.ip) return data.ip
      } catch (e) {
        console.log('Backend not available for IP detection')
      }

      // Method 3: Fallback to localhost
      return 'localhost'
    } catch (error) {
      console.error('Failed to get local IP:', error)
      return 'localhost'
    }
  },

  async scanNetwork(localIP) {
    const devices = []
    
    if (localIP === 'localhost') {
      // Return mock devices for localhost
      return [
        { ip: '192.168.1.100', name: 'Sweet Mango', status: 'online', icon: 'device' },
        { ip: '192.168.1.101', name: 'Red Apple', status: 'online', icon: 'phone' },
      ]
    }

    // Extract network base (e.g., 192.168.1.x)
    const ipParts = localIP.split('.')
    const networkBase = ipParts.slice(0, 3).join('.')

    // Scan common device IPs (1-254)
    for (let i = 1; i < 255; i++) {
      const ip = `${networkBase}.${i}`
      
      try {
        // Try to ping the device (backend will handle this)
        const response = await fetch(`http://localhost:3001/api/device-ping`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetIP: ip }),
          timeout: 1000,
        })

        if (response.ok) {
          const data = await response.json()
          devices.push({
            ip,
            name: data.name || 'Unknown Device',
            status: 'online',
            icon: data.icon || 'device',
          })
        } else {
          devices.push({
            ip,
            name: 'Unknown',
            status: 'offline',
            icon: 'device',
          })
        }
      } catch (e) {
        // Device not reachable
        devices.push({
          ip,
          name: 'Unknown',
          status: 'offline',
          icon: 'device',
        })
      }
    }

    return devices
  },

  getRandomDeviceName() {
    const names = [
      'Banana', 'Sweet Mango', 'Red Apple', 'Blue Tiger', 
      'Golden Falcon', 'Purple Panther', 'Crimson Cobra', 
      'Silver Shark', 'Midnight Wolf', 'Thunder Bear',
      'Copper Cat', 'Jade Jaguar', 'Obsidian Owl'
    ]
    return names[Math.floor(Math.random() * names.length)]
  },
}