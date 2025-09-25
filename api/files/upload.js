import { connectToDatabase } from '../lib/mongodb.js';
import multer from 'multer';
import { nanoid } from 'nanoid';

// Custom share ID generator for branded URLs
function generateCustomShareId() {
  const prefix = "Astra"; // Astra personal branding
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  
  // Generate 8 character code for better uniqueness
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `${prefix}-${result}`;
}

// Configure multer for memory storage (since we're using Vercel serverless)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// Helper to run multer middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Run multer middleware
    await runMiddleware(req, res, upload.array('files'));

    const { db } = await connectToDatabase();
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const createdFiles = [];

    for (const file of files) {
      const shareId = generateCustomShareId();
      const fileId = nanoid();
      
      // Convert buffer to base64 for storage
      const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      
      const fileDoc = {
        id: fileId,
        filename: `${Date.now()}-${fileId}${getFileExtension(file.originalname)}`,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        shareId,
        isFolder: false,
        createdAt: new Date().toISOString(),
        dataUrl, // Store as base64
      };

      // Insert into MongoDB
      const result = await db.collection('files').insertOne(fileDoc);
      fileDoc._id = result.insertedId;
      
      createdFiles.push(fileDoc);
    }

    res.status(200).json(createdFiles);
  } catch (error) {
    console.error('Upload error:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'File too large. Maximum size is 100MB.' });
    }
    
    res.status(500).json({ message: 'Failed to upload files: ' + error.message });
  }
}

function getFileExtension(filename) {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.substring(lastDot) : '';
}

export const config = {
  api: {
    bodyParser: false,
  },
};