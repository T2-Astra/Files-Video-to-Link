import { connectToDatabase } from '../lib/mongodb.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { shareId } = req.query;

  if (!shareId) {
    return res.status(400).json({ message: 'Share ID is required' });
  }

  try {
    const { db } = await connectToDatabase();

    if (req.method === 'GET') {
      // Get file by share ID
      const file = await db.collection('files').findOne({ shareId });

      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }

      res.status(200).json(file);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Share API error:', error);
    res.status(500).json({ message: 'Internal server error: ' + error.message });
  }
}