import express from 'express'
import {
  getDevices,
  getDevice,
  registerDevice,
  updateDeviceStatus,
  pingDevice,
  removeDevice,
} from '../controllers/deviceController.js'

const router = express.Router()

// Get all devices
router.get('/devices', getDevices)

// Get single device by ID
router.get('/device/:id', getDevice)

// Register a new device
router.post('/devices/register', registerDevice)

// Update device status
router.post('/device/status', updateDeviceStatus)

// Ping a device (check if reachable)
router.post('/device/ping', pingDevice)

// Remove a device
router.delete('/device/:id', removeDevice)

export default router