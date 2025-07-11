/**
 * Polyfill for Node.js crypto module
 * This ensures the crypto module is explicitly imported and available for the NestJS scheduler
 */
import * as crypto from 'crypto';

// Expose crypto globally if it's not already defined
if (typeof global.crypto === 'undefined') {
  (global as any).crypto = crypto;
}
