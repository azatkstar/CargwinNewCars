// Mock API endpoint for deal intent
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, dealId, consent } = req.body;

  // Basic validation
  if (!name || !phone || !email || !consent) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Mock processing
  const intentId = `intent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Log to console in development
  console.log('Deal intent submitted:', {
    id: intentId,
    name,
    phone,
    email,
    dealId,
    timestamp: new Date().toISOString()
  });

  // Simulate API delay
  setTimeout(() => {
    res.status(200).json({
      ok: true,
      id: intentId,
      message: 'Deal intent submitted successfully'
    });
  }, 800);
}