import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const SALT_LENGTH = 16;
const IV_LENGTH = 16;
const ITERATIONS = 100000;

export function deriveKey(masterPassword, salt) {
  return crypto.pbkdf2Sync(masterPassword, salt, ITERATIONS, 32, 'sha256');
}

export function hashMasterPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function verifyMasterPassword(password, hash) {
  return hashMasterPassword(password) === hash;
}

export function encryptPassword(plainPassword, masterPassword) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(masterPassword, salt);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plainPassword, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const combined = Buffer.concat([salt, iv, Buffer.from(encrypted, 'hex')]);
  return combined.toString('base64');
}

export function decryptPassword(encryptedData, masterPassword) {
  try {
    const combined = Buffer.from(encryptedData, 'base64');

    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH);

    const key = deriveKey(masterPassword, salt);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    // التعديل هنا لضمان قراءة الـ Ciphertext بشكل سليم كـ Buffer
    let decrypted = decipher.update(ciphertext);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    console.error("Decryption error:", error.message);
    return "Error decrypting password"; // عشان الفرونت إند ميهنجش
  }
}

export function generateStrongPassword(length = 16) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  return password;
}