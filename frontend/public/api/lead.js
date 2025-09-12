// Mock API endpoint for lead generation
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, carId, message, consent } = req.body;

  // Basic validation
  if (!name || !phone || !email || !consent) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Mock processing
  const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Log to console in development
  console.log('Lead submitted:', {
    id: leadId,
    name,
    phone,
    email,
    carId,
    message,
    timestamp: new Date().toISOString()
  });

  // Simulate API delay
  setTimeout(() => {
    res.status(200).json({
      ok: true,
      id: leadId,
      message: 'Lead submitted successfully'
    });
  }, 1000);
}