// server/routes/transferRoutes.js
import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = express.Router()

// Upload folder ensure
const UPLOAD_DIR = path.resolve('uploads')
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  },
})

const upload = multer({ storage })

// ✅ Simple upload endpoint
// POST /api/transfer/upload
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' })
  }

  const storedName = req.file.filename
  const originalName = req.file.originalname
  const size = req.file.size
  const mimeType = req.file.mimetype

  const downloadUrl = `/api/transfer/download/${storedName}`

  return res.json({
    success: true,
    filename: originalName,
    storedName,
    size,
    mimeType,
    downloadUrl,
  })
})

// ✅ Download endpoint (download + auto delete)
// GET /api/transfer/download/:filename
router.get('/download/:filename', (req, res) => {
  const fileName = req.params.filename
  const fullPath = path.join(UPLOAD_DIR, fileName)

  if (!fs.existsSync(fullPath)) {
    return res
      .status(404)
      .json({ success: false, error: 'File not found' })
  }

  res.download(fullPath, fileName, (err) => {
    if (err) {
      console.error('Error sending file:', err)
      // Agar yahan error hai to delete skip kar sakte hain
      return
    }

    // ✅ Download complete (ya close) hone ke baad file delete
    fs.unlink(fullPath, (unlinkErr) => {
      if (unlinkErr) {
        console.error('Error deleting file after download:', unlinkErr)
      } else {
        console.log('File deleted after download:', fileName)
      }
    })
  })
})

export default router