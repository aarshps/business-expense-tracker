import fs from 'fs';
import path from 'path';

// Determine if we are in a production environment (Vercel)
// Vercel sets NODE_ENV to 'production' and VERCEL to '1'
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

// Only setup log directory and file if NOT in production
const logDir = path.join(process.cwd(), 'logs');
const logFile = path.join(logDir, 'app.log');

if (!isProduction) {
  if (!fs.existsSync(logDir)) {
    try {
      fs.mkdirSync(logDir, { recursive: true });
    } catch (err) {
      console.error('Failed to create log directory:', err);
    }
  }
}

export const logInfo = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] INFO: ${message}\n`;

  // Always log to console
  console.log(logMessage.trim());

  // Only log to file if NOT in production
  if (!isProduction) {
    try {
      fs.appendFileSync(logFile, logMessage);
    } catch (err) {
      // Ignore file write errors to prevent crashing
    }
  }
};

export const logError = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ERROR: ${message}\n`;

  // Always log to console
  console.error(logMessage.trim());

  // Only log to file if NOT in production
  if (!isProduction) {
    try {
      fs.appendFileSync(logFile, logMessage);
    } catch (err) {
      // Ignore file write errors
    }
  }
};

export const logDebug = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] DEBUG: ${message}\n`;

  // Always log to console
  console.log(logMessage.trim());

  // Only log to file if NOT in production
  if (!isProduction) {
    try {
      fs.appendFileSync(logFile, logMessage);
    } catch (err) {
      // Ignore file write errors
    }
  }
};