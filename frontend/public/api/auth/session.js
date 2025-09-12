// Mock session check
export default function handler(req, res) {
  // In a real implementation, this would verify JWT token from httpOnly cookie
  
  // Mock authenticated user (for demo purposes)
  const mockUser = {
    id: 'user_123',
    email: 'admin@cargwin.com',
    role: 'admin',
    loginAt: new Date().toISOString()
  };

  // Simulate session check
  const isAuthenticated = true; // Set to false to test login flow

  if (isAuthenticated) {
    res.status(200).json({
      user: {
        id: mockUser.id,
        email: mockUser.email
      },
      role: mockUser.role
    });
  } else {
    res.status(401).json({
      error: 'Not authenticated'
    });
  }
}