// Utility function to generate database name consistently across the application
export function generateDbName(identifier, environment = process.env.NODE_ENV || 'development') {
  // Clean the identifier to ensure it's a valid database name
  if (!identifier) {
    throw new Error('Identifier is required to generate database name');
  }
  // Remove dots specifically as requested, then replace other invalid chars with underscore
  const cleanIdentifier = identifier.toString().replace(/\./g, '').replace(/[^a-zA-Z0-9_]/g, '_');
  return `bet_${cleanIdentifier}_${environment}`;
}

// Function to get identifier from user profile (for sign-in)
export function getIdentifierFromProfile(profile) {
  // Use email username (part before @) as identifier
  if (profile.email) {
    return profile.email.split('@')[0];
  }
  // Fallback to using a cleaned version of the name
  if (profile.name) {
    return profile.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '_');
  }
  // Last resort: use the Google ID if available
  return profile.sub || profile.id;
}

// Function to get identifier from session (for session refresh)
export function getIdentifierFromSession(sessionUser) {
  // Use email username (part before @) as identifier
  if (sessionUser.email) {
    return sessionUser.email.split('@')[0];
  }
  // Fallback to using a cleaned version of the name
  if (sessionUser.name) {
    return sessionUser.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '_');
  }
  // Last resort: use the googleId, sub, or id if available in session
  return sessionUser.googleId || sessionUser.sub || sessionUser.id;
}