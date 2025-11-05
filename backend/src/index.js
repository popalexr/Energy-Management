import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initModbusConnection, startPolling, stopPolling } from './modbusPoller.js';
import locationsRouter from './routes/locations.js';
import systemRouter from './routes/system.js';
import pxr10Router from './routes/pxr10.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/v1/locations', locationsRouter);
app.use('/api/v1/system', systemRouter);
app.use('/api/v1/pxr10', pxr10Router);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Energy Management Backend',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  ⚡ Energy Management Backend');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  🚀 Server running on http://localhost:${PORT}`);
  console.log(`  📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('═══════════════════════════════════════════════════════');
  
  // Initialize Modbus connection
  initModbusConnection();
  
  // Start polling after 2 seconds (give time for connection)
  setTimeout(() => {
    startPolling();
  }, 2000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⏹️  SIGTERM received, shutting down gracefully...');
  
  stopPolling();
  
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⏹️  SIGINT received, shutting down gracefully...');
  
  stopPolling();
  
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;
