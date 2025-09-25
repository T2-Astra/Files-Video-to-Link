export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('Files API called:', req.method);

    if (req.method === 'GET') {
      // Return empty array for now
      res.status(200).json([]);
    } else if (req.method === 'DELETE') {
      // Mock delete response
      res.status(200).json({ message: 'All files deleted successfully' });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ message: 'Internal server error: ' + error.message });
  }
}