// Timer utilities for CargwinNewCar

// Get next Monday at midnight in LA timezone
export const getNextMondayMidnight = () => {
  const now = new Date();
  const losAngeles = new Date(now.toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
  
  // Calculate days until next Monday (1 = Monday, 0 = Sunday)
  const currentDay = losAngeles.getDay();
  const daysUntilMonday = currentDay === 0 ? 1 : 8 - currentDay;
  
  const nextMonday = new Date(losAngeles);
  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  
  return nextMonday;
};

// Format time remaining
export const formatTimeRemaining = (targetDate) => {
  const now = new Date();
  const diff = targetDate - now;
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds };
};

// Format price with comma separators
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Calculate monthly payment for financing
export const calculateMonthlyPayment = (principal, apr, termMonths) => {
  const monthlyRate = apr / 100 / 12;
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                 (Math.pow(1 + monthlyRate, termMonths) - 1);
  return Math.round(payment);
};

// Phone number formatting
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};