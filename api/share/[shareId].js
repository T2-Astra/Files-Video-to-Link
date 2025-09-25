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
    // Mock shared file response
    const mockFile = {
      id: `mock-${Date.now()}`,
      filename: `${shareId}.txt`,
      originalName: 'shared-file.txt',
      mimeType: 'text/plain',
      size: 1024,
      shareId,
      isFolder: false,
      createdAt: new Date().toISOString(),
      dataUrl: 'data:text/plain;base64,VGhpcyBpcyBhIHNoYXJlZCBmaWxlIQ==', // "This is a shared file!" in base64
    };

    res.status(200).json(mockFile);
  } catch (error) {
    console.error('Share API error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch file' });
  }
}