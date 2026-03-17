import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logFile = path.join(__dirname, '../../debug-auth.log');

function writeLog(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage);
  try {
    fs.appendFileSync(logFile, logMessage);
  } catch (err) {
    console.error('Failed to write to auth log file:', err);
  }
}

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    writeLog(`Auth middleware - Authorization header present: ${!!authHeader}`);

    const token = authHeader?.split(' ')[1];

    if (!token) {
      writeLog('Auth middleware - No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    writeLog(`Auth middleware - Token present, verifying...`);
    const decoded = jwt.verify(token, config.jwtSecret);
    req.userId = decoded.userId;
    writeLog(`Auth middleware - Token verified, userId: ${req.userId}`);
    next();
  } catch (error) {
    writeLog(`Auth middleware - Error: ${error.message}`);
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.userId = decoded.userId;
      } catch (error) {

      }
    }
    next();
  } catch (error) {
    next();
  }
};

