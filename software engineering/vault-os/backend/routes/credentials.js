import express from 'express';
import { authenticateToken } from '../middleware.js';
import { query } from '../db.js';
import { encryptPassword, decryptPassword, verifyMasterPassword, generateStrongPassword } from '../encryption.js';

const router = express.Router();

// Get all credentials for user (metadata only)
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const credentials = await query('SELECT id, service_name, username, created_at FROM credentials WHERE user_id = ?', [userId]);
    res.json(credentials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch credentials' });
  }
});

// Get single credential with decryption
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    // التعديل هنا: بنحاول نجيب الماستر باسورد من الـ Query أو الـ Headers
    const masterPassword = req.query.masterPassword || req.headers['x-master-password'];
    const userId = req.user.userId;

    if (!masterPassword) {
      return res.status(400).json({ error: 'Master password required to decrypt' });
    }

    const credentials = await query('SELECT * FROM credentials WHERE id = ? AND user_id = ?', [id, userId]);
    if (credentials.length === 0) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    const credential = credentials[0];

    // Verify master password
    const masterPasswords = await query('SELECT * FROM master_passwords WHERE user_id = ?', [userId]);
    if (masterPasswords.length === 0) {
      return res.status(400).json({ error: 'Master password not set' });
    }

    const verified = verifyMasterPassword(masterPassword, masterPasswords[0].hashed_password);
    if (!verified) {
      return res.status(401).json({ error: 'Invalid master password' });
    }

    // Decrypting
    const decryptedPassword = decryptPassword(credential.encrypted_password, masterPassword);

    res.json({
      id: credential.id,
      serviceName: credential.service_name,
      username: credential.username,
      password: decryptedPassword, // الباسورد الحقيقي هيرجع هنا
      createdAt: credential.created_at,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Decryption failed' });
  }
});

// Add new credential
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { serviceName, username, password, masterPassword } = req.body;
    const userId = req.user.userId;

    if (!serviceName || !username || !password || !masterPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const masterPasswords = await query('SELECT * FROM master_passwords WHERE user_id = ?', [userId]);
    if (masterPasswords.length === 0) {
      return res.status(400).json({ error: 'Master password not set' });
    }

    const verified = verifyMasterPassword(masterPassword, masterPasswords[0].hashed_password);
    if (!verified) {
      return res.status(401).json({ error: 'Invalid master password' });
    }

    const encryptedPassword = encryptPassword(password, masterPassword);

    const result = await query(
      'INSERT INTO credentials (user_id, service_name, username, encrypted_password) VALUES (?, ?, ?, ?)',
      [userId, serviceName, username, encryptedPassword]
    );

    res.status(201).json({
      message: 'Credential added successfully',
      credentialId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add credential' });
  }
});

// Delete credential
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const masterPassword = req.query.masterPassword || req.headers['x-master-password'];
    const userId = req.user.userId;

    const masterPasswords = await query('SELECT * FROM master_passwords WHERE user_id = ?', [userId]);
    const verified = verifyMasterPassword(masterPassword, masterPasswords[0].hashed_password);
    if (!verified) return res.status(401).json({ error: 'Invalid master password' });

    await query('DELETE FROM credentials WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Credential deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Generate password
router.get('/generate/password', (req, res) => {
  try {
    const length = parseInt(req.query.length) || 16;
    const password = generateStrongPassword(length);
    res.json({ password });
  } catch (error) {
    res.status(500).json({ error: 'Generation failed' });
  }
});

export default router;