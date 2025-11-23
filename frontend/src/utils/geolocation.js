/**
 * Geolocation utilities for hunter.lease
 * Auto-detect user location and show nearby offers
 */

// California zip codes to cities mapping
export const CA_ZIP_TO_CITY = {
  '90001': 'Downtown LA',
  '90012': 'Downtown LA',
  '90015': 'Downtown LA',
  '90024': 'Westwood',
  '90028': 'Hollywood',
  '90210': 'Beverly Hills',
  '90245': 'El Segundo',
  '90401': 'Santa Monica',
  '90802': 'Long Beach',
  '91801': 'Alhambra',
  '92101': 'San Diego',
  '92602': 'Irvine',
  '92606': 'Irvine',
  '92614': 'Irvine',
  '94102': 'San Francisco',
  '94103': 'San Francisco'
};

/**
 * Get user's approximate location via browser geolocation
 */
export const getUserLocation = async () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ zip: null, city: null, error: 'Geolocation not supported' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Reverse geocode to get zip
          // В production использовать Google Geocoding API
          // Для MVP - fallback на IP geolocation или manual input
          
          // Mock: если LA area координаты → 90210
          const { latitude, longitude } = position.coords;
          
          // Простая проверка если в LA area
          if (latitude > 33 && latitude < 34.5 && longitude > -119 && longitude < -117) {
            resolve({ zip: '90210', city: 'Beverly Hills', detected: true });
          } else if (latitude > 32 && latitude < 33.5 && longitude > -117.5 && longitude < -116.5) {
            resolve({ zip: '92606', city: 'Irvine', detected: true });
          } else {
            resolve({ zip: null, city: 'California', detected: true });
          }
        } catch (error) {
          resolve({ zip: null, city: null, error: error.message });
        }
      },
      (error) => {
        resolve({ zip: null, city: null, error: error.message });
      },
      { timeout: 5000 }
    );
  });
};

/**
 * Get city name from zip code
 */
export const getCityFromZip = (zip) => {
  return CA_ZIP_TO_CITY[zip] || 'California';
};

/**
 * Check if zip is in service area
 */
export const isInServiceArea = (zip) => {
  return Object.keys(CA_ZIP_TO_CITY).includes(zip);
};

/**
 * Calculate distance between two zip codes (simplified)
 * В production использовать real distance calculation
 */
export const getDistanceFromZip = (userZip, dealerZip) => {
  // Mock implementation
  if (!userZip || !dealerZip) return 0;
  if (userZip === dealerZip) return 0;
  
  // Simple approximation based on first 3 digits
  const diff = Math.abs(parseInt(userZip.slice(0, 3)) - parseInt(dealerZip.slice(0, 3)));
  return diff * 10; // Miles (очень грубо)
};
