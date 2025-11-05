import express from 'express';
import { pxr10Client } from '../pxr10Client.js';

const router = express.Router();

router.get('/status', (req, res) => {
  res.json({
    success: true,
    connected: pxr10Client.isConnected(),
    mode: process.env.MOCK_MODE === 'true' ? 'mock' : 'live',
  });
});

router.get('/registers', async (req, res) => {
  try {
    const data = await pxr10Client.readAll();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/read/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const data = await pxr10Client.readByKey(key);
    res.json({ success: true, key, data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Writes are often unsupported or risky; keep disabled unless explicitly enabled
router.post('/write', async (req, res) => {
  res.status(501).json({ success: false, error: 'Write not implemented for safety' });
});

export default router;

