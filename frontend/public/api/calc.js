// Mock API endpoint for OTD calculation
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { msrp, state, creditScore, downPayment, term } = req.body;

  // Basic validation
  if (!msrp || !state) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Mock calculation logic
  const stateTaxRates = {
    'CA': 0.0825,
    'NV': 0.0685,
    'AZ': 0.0560,
    'OR': 0.0000
  };

  const taxRate = stateTaxRates[state] || 0.08;
  const tax = msrp * taxRate;
  const fees = 500; // DMV and doc fees
  const estOtdoor = msrp + tax + fees;

  // APR based on credit score
  let apr = 4.5;
  if (creditScore === 'excellent') apr = 2.9;
  else if (creditScore === 'good') apr = 3.5;
  else if (creditScore === 'fair') apr = 5.5;
  else if (creditScore === 'poor') apr = 7.5;
  else if (creditScore === 'bad') apr = 12.0;

  // Log calculation
  console.log('OTD calculation:', {
    msrp,
    state,
    creditScore,
    downPayment,
    term,
    results: { estOtdoor, tax, fees, apr },
    timestamp: new Date().toISOString()
  });

  // Simulate API delay
  setTimeout(() => {
    res.status(200).json({
      estOtdoor: Math.round(estOtdoor),
      tax: Math.round(tax),
      fees,
      apr
    });
  }, 1500);
}