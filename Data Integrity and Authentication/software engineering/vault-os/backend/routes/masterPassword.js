import express from 'express';
import { authenticateToken } from '../middleware.js';
import { query } from '../db.js';
import { hashMasterPassword, verifyMasterPassword } from '../encryption.js';

const router = express.Router();

// Setup master password
router.post('/setup', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.userId;

    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if master password already exists
    const existing = await query('SELECT * FROM master_passwords WHERE user_id = ?', [userId]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Master password already set' });
    }

    const hashedPassword = hashMasterPassword(password);
    await query('INSERT INTO master_passwords (user_id, hashed_password) VALUES (?, ?)', [
      userId,
      hashedPassword,
    ]);

    res.status(201).json({ message: 'Master password set successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to set master password' });
  }
});

// Verify master password
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    // التعديل هنا: بنقبل password أو masterPassword عشان نمنع الـ 400 error
    const { password, masterPassword } = req.body;
    const submittedPassword = password || masterPassword;

    const userId = req.user.userId;

    if (!submittedPassword) {
      return res.status(400).json({ error: 'Master password is required' });
    }

    const masterPasswords = await query('SELECT * FROM master_passwords WHERE user_id = ?', [userId]);
    
    if (masterPasswords.length === 0) {
      return res.status(404).json({ verified: false, message: 'Master password not set' });
    }

    const masterPasswordData = masterPasswords[0];
    const verified = verifyMasterPassword(submittedPassword, masterPasswordData.hashed_password);

    if (!verified) {
      return res.status(401).json({ verified: false, message: 'Invalid master password' });
    }

    // لو تمام، بنرجع verified: true
    res.json({
      verified: true,
      message: 'Master password verified',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;