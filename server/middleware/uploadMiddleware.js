import multer from 'multer'
import path from 'path'
import fs from 'fs'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5497558138880 // 5GB

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.originalname}`
    cb(null, uniqueName)
  }
})

// File filter (allow all file types)
const fileFilter = (req, file, cb) => {
  cb(null, true)
}

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
})

// Middleware to handle single file upload
export const uploadSingle = upload.single('file')

// Middleware to handle multiple file uploads
export const uploadMultiple = upload.array('files', 10)

// Middleware to handle chunk uploads
export const uploadChunk = upload.single('chunk')

// Error handling middleware
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size exceeds the limit (5GB)'
      })
    }
    return res.status(400).json({
      success: false,
      error: err.message
    })
  }
  next(err)
}