module.exports = (req, res) => {
  // Simple health check
  if (req.url === '/api/health') {
    return res.status(200).json({ 
      status: 'OK', 
      message: 'API is working!',
      timestamp: new Date().toISOString()
    });
  }

  // Properties endpoint
  if (req.url.startsWith('/api/properties')) {
    return res.status(200).json({ 
      properties: [],
      message: 'Properties endpoint working'
    });
  }

  // Default response
  res.status(404).json({ message: 'Route not found' });
};
