import os from 'os'

export const ipHelper = {
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

  // Check if IP is local
  isLocalIP(ip) {
    return ip === 'localhost' || 
           ip === '127.0.0.1' || 
           ip.startsWith('192.168.') || 
           ip.startsWith('10.0.') || 
           ip.startsWith('172.16.')
  },

  // Get network subnet
  getSubnet(ip = this.getLocalIP()) {
    if (ip === 'localhost') return null
    
    const ipParts = ip.split('.')
    return ipParts.slice(0, 3).join('.')
  },

  // Validate IP format
  isValidIP(ip) {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
    return ipRegex.test(ip)
  },

  // Convert IP to number (for comparison)
  ipToNumber(ip) {
    if (!this.isValidIP(ip)) return 0
    
    const parts = ip.split('.')
    return parts.reduce((acc, part) => acc * 256 + parseInt(part), 0)
  },
}

export default ipHelper