import { connectToDatabase } from '../lib/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'File ID is required' });
  }

  try {
    const { db } = await connectToDatabase();

    if (req.method === 'DELETE') {
      // Delete file by ID
      const result = await db.collection('files').deleteOne({ 
        $or: [
          { id: id },
          { _id: new ObjectId(id) }
        ]
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'File not found' });
      }

      res.status(200).json({ message: 'File deleted successfully' });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Delete API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
