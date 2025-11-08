import fs from 'fs';
import path from 'path';

const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, 'app.log');

export const logInfo = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] INFO: ${message}\n`;
  fs.appendFileSync(logFile, logMessage);
  console.log(logMessage.trim());
};

export const logError = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ERROR: ${message}\n`;
  fs.appendFileSync(logFile, logMessage);
  console.error(logMessage.trim());
};

export const logDebug = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] DEBUG: ${message}\n`;
  fs.appendFileSync(logFile, logMessage);
  console.log(logMessage.trim());
};