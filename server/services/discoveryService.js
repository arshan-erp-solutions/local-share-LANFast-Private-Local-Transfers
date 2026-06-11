import os from 'os'
import dgram from 'dgram'

export const discoveryService = {
  // Get local IP address
  getLocalIP() {
    const interfaces = os.networkInterfaces()
    let localIP = 'localhost'

    for (const interfaceName in interfaces) {
      for (const iface of interfaces[interfaceName]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          localIP = iface.address
          break
        }
      }
    }

    return localIP
  },

  // Get network subnet
  getSubnet() {
    const localIP = this.getLocalIP()
    if (localIP === 'localhost') return null
    
    const ipParts = localIP.split('.')
    return ipParts.slice(0, 3).join('.')
  },

  // Scan network for devices (simplified version)
  async scanNetwork() {
    const subnet = this.getSubnet()
    const devices = []

    if (!subnet) {
      // Return mock devices for localhost
      return [
        { ip: '192.168.1.100', name: 'Sweet Mango', status: 'online', icon: 'device' },
        { ip: '192.168.1.101', name: 'Red Apple', status: 'online', icon: 'phone' },
      ]
    }

    // In production, use UDP broadcast or ICMP ping
    // This is a simplified version
    for (let i = 1; i < 255; i++) {
      const ip = `${subnet}.${i}`
      
      // Simulate device discovery
      devices.push({
        ip,
        name: 'Unknown',
        status: 'offline',
        icon: 'device',
      })
    }

    return devices
  },

  // Generate random device name
  getRandomDeviceName() {
    const names = [
      'Banana', 'Sweet Mango', 'Red Apple', 'Blue Tiger', 
      'Golden Falcon', 'Purple Panther', 'Crimson Cobra', 
      'Silver Shark', 'Midnight Wolf', 'Thunder Bear',
      'Copper Cat', 'Jade Jaguar', 'Obsidian Owl'
    ]
    return names[Math.floor(Math.random() * names.length)]
  },

  // Get device icon based on type
  getDeviceIcon(type) {
    const icons = {
      phone: '📱',
      laptop: '💼',
      desktop: '🖥️',
      tablet: '📲',
      device: '💻',
    }
    return icons[type] || icons.device
  },
}

export default discoveryService