import express from 'express';
import { getConnectionStatus, manualPoll } from '../modbusPoller.js';

const router = express.Router();

/**
 * GET /api/v1/system/health
 * System health check
 */
router.get('/health', (req, res) => {
  const status = getConnectionStatus();
  
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date(),
    modbus: status,
  });
});

/**
 * GET /api/v1/system/status
 * Get system status
 */
router.get('/status', (req, res) => {
  const modbusStatus = getConnectionStatus();
  
  res.json({
    success: true,
    data: {
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        env: process.env.NODE_ENV || 'development',
      },
      modbus: modbusStatus,
    },
  });
});

/**
 * POST /api/v1/system/poll
 * Trigger manual poll (for testing)
 */
router.post('/poll', async (req, res) => {
  try {
    const measurements = await manualPoll();
    
    res.json({
      success: true,
      message: 'Manual poll completed',
      measurements: measurements?.length || 0,
    });
  } catch (error) {
    console.error('Manual poll error:', error);
    res.status(500).json({
      success: false,
      error: 'Manual poll failed',
      message: error.message,
    });
  }
});

export default router;
