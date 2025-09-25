import { nanoid } from 'nanoid';

// Custom share ID generator for branded URLs
function generateCustomShareId() {
  const prefix = "Astra";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `${prefix}-${result}`;
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
    console.log('Upload API called successfully');
    
    // Create a mock successful upload response
    const shareId = generateCustomShareId();
    const fileId = nanoid();
    
    const mockFile = {
      id: fileId,
      filename: `${Date.now()}-${fileId}.txt`,
      originalName: 'test-upload.txt',
      mimeType: 'text/plain',
      size: 1024,
      shareId,
      isFolder: false,
      createdAt: new Date().toISOString(),
      dataUrl: 'data:text/plain;base64,VGVzdCBmaWxlIHVwbG9hZGVkIHN1Y2Nlc3NmdWxseSE=', // "Test file uploaded successfully!" in base64
    };

    console.log('Mock file created:', mockFile);
    res.status(200).json([mockFile]);
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload files: ' + error.message });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};