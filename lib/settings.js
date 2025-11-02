// Utility functions for managing user settings
import { DEFAULT_CURRENCY } from './currency';

// Get user settings from API
export const getUserSettings = async () => {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      return await res.json();
    } else {
      console.error('Failed to fetch user settings');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return null;
  }
};

// Update user settings via API
export const updateUserSettings = async (settings) => {
  try {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    });
    
    if (res.ok) {
      return await res.json();
    } else {
      console.error('Failed to update user settings');
      return null;
    }
  } catch (error) {
    console.error('Error updating user settings:', error);
    return null;
  }
};

// Get default user currency based on locale
export const getDefaultCurrency = () => {
  const locale = navigator.language || 'en-US';
  let detectedCurrency = DEFAULT_CURRENCY;
  
  if (locale.includes('en-IN') || locale.includes('hi')) {
    // Find INR in our currency options
    const inrCurrency = { code: 'INR', symbol: '₹', name: 'Indian Rupee' };
    detectedCurrency = inrCurrency;
  } else if (locale.includes('en-GB')) {
    // Find GBP in our currency options
    const gbpCurrency = { code: 'GBP', symbol: '£', name: 'British Pound' };
    detectedCurrency = gbpCurrency;
  } else if (locale.includes('de-') || locale.includes('fr-') || locale.includes('it-') || 
             locale.includes('es-') || locale.includes('nl-')) {
    // Find EUR in our currency options
    const eurCurrency = { code: 'EUR', symbol: '€', name: 'Euro' };
    detectedCurrency = eurCurrency;
  }
  
  return detectedCurrency;
};