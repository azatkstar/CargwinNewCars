// Mock magic link authentication
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Mock different roles based on email
  let role = 'viewer';
  if (email.includes('admin@')) role = 'admin';
  else if (email.includes('editor@')) role = 'editor';

  // In a real implementation, this would:
  // 1. Generate a secure token
  // 2. Send email with magic link
  // 3. Store token in database with expiration

  console.log('Magic link request:', {
    email,
    role,
    timestamp: new Date().toISOString()
  });

  // Mock success response
  setTimeout(() => {
    res.status(200).json({
      ok: true,
      message: 'Magic link sent successfully'
    });
  }, 1000);
}