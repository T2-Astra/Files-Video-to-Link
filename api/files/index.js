import { connectToDatabase } from '../lib/mongodb.js';

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();

    if (req.method === 'GET') {
      // Get all files
      const files = await db.collection('files')
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      res.status(200).json(files);
    } else if (req.method === 'DELETE') {
      // Delete all files
      await db.collection('files').deleteMany({});
      res.status(200).json({ message: 'All files deleted successfully' });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
