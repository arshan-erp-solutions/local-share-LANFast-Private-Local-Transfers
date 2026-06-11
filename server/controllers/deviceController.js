import { v4 as uuidv4 } from 'uuid'

// Device storage (in-memory - use database in production)
const devices = new Map()

export const getDevices = (req, res) => {
  try {
    const deviceList = Array.from(devices.values())
    res.json({
      success: true,
      count: deviceList.length,
      devices: deviceList
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

export const getDevice = (req, res) => {
  try {
    const device = devices.get(req.params.id)
    
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found'
      })
    }

    res.json({
      success: true,
      device
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

export const registerDevice = (req, res) => {
  try {
    const { ip, name, icon } = req.body

    const deviceId = uuidv4()
    const device = {
      id: deviceId,
      ip,
      name: name || `Device_${deviceId.slice(0, 5)}`,
      icon: icon || 'device',
      status: 'online',
      joinedAt: new Date(),
      lastSeen: new Date(),
    }

    devices.set(deviceId, device)

    res.json({
      success: true,
      message: 'Device registered successfully',
      device
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

export const updateDeviceStatus = (req, res) => {
  try {
    const { id, status } = req.body

    const device = devices.get(id)
    
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found'
      })
    }

    device.status = status
    device.lastSeen = new Date()

    res.json({
      success: true,
      message: `Device status updated to ${status}`,
      device
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

export const pingDevice = (req, res) => {
  try {
    const { targetIP } = req.body

    // Simulate ping (in production, use netcat or similar)
    const device = Array.from(devices.values()).find(d => d.ip === targetIP)
    
    if (device) {
      res.json({
        success: true,
        name: device.name,
        icon: device.icon,
        status: device.status
      })
    } else {
      res.status(404).json({
        success: false,
        error: 'Device not reachable'
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

export const removeDevice = (req, res) => {
  try {
    const device = devices.delete(req.params.id)
    
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found'
      })
    }

    res.json({
      success: true,
      message: 'Device removed successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

// Export devices for use in other files
export const getDevicesMap = () => devices