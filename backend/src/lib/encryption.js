// chat-app/backend/src/lib/encryption.js
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

// Hash the JWT_SECRET to ensure we always have exactly 32 bytes for AES-256
const getEncryptionKey = () => {
    const secret = process.env.JWT_SECRET || "032054072307523";
    return crypto.createHash('sha256').update(String(secret)).digest('base64').substring(0, 32);
};

const ENCRYPTION_KEY = getEncryptionKey();
const IV_LENGTH = 16;

export const encrypt = (text) => {
  if (!text) return text;
  try {
      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
      let encrypted = cipher.update(text);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (e) {
      console.error("Encryption error:", e);
      return text;
  }
};

export const decrypt = (text) => {
  if (!text) return text;
  try {
    const textParts = text.split(':');
    if (textParts.length !== 2) return text; // Probably not encrypted
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (e) {
    console.error("Decryption failed:", e.message);
    return "[Encrypted Message Error]";
  }
};