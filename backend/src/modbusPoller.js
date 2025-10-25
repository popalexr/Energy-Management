import Modbus from 'jsmodbus';
import net from 'net';
import schedule from 'node-schedule';
import dotenv from 'dotenv';
import { insertMeasurement } from './database.js';
import { MODBUS_REGISTERS, getRegisterNumber, parseFloat32BE } from './modbusConfig.js';
import { generateMockMeasurements } from './mockModbus.js';

dotenv.config();

// Modbus client configuration
const MODBUS_HOST = process.env.MODBUS_HOST || '192.168.1.100';
const MODBUS_PORT = parseInt(process.env.MODBUS_PORT) || 502;
const MODBUS_UNIT_ID = parseInt(process.env.MODBUS_UNIT_ID) || 1;
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL_SECONDS) || 5;
const LOCATION = process.env.LOCATION_SALA_SPORT || 'sala-sport';
const MOCK_MODE = process.env.MOCK_MODE === 'true';

let socket = null;
let client = null;
let isConnected = false;
let pollJob = null;

/**
 * Initialize Modbus TCP connection
 */
export function initModbusConnection() {
  if (MOCK_MODE) {
    console.log('🎭 MOCK MODE ENABLED - Using simulated data');
    console.log('✅ Mock data generator ready');
    isConnected = true;
    return;
  }
  
  console.log(`📡 Connecting to Modbus TCP at ${MODBUS_HOST}:${MODBUS_PORT}...`);
  
  socket = new net.Socket();
  client = new Modbus.client.TCP(socket, MODBUS_UNIT_ID);
  
  socket.on('connect', () => {
    console.log('✅ Modbus TCP connected successfully');
    isConnected = true;
  });
  
  socket.on('error', (err) => {
    console.error('❌ Modbus connection error:', err.message);
    isConnected = false;
  });
  
  socket.on('close', () => {
    console.log('⚠️  Modbus connection closed');
    isConnected = false;
    
    // Attempt reconnection after 10 seconds
    setTimeout(() => {
      console.log('🔄 Attempting to reconnect...');
      connectToModbus();
    }, 10000);
  });
  
  connectToModbus();
}

/**
 * Connect to Modbus device
 */
function connectToModbus() {
  try {
    socket.connect({ host: MODBUS_HOST, port: MODBUS_PORT });
  } catch (error) {
    console.error('❌ Failed to connect to Modbus:', error.message);
  }
}

/**
 * Read a single register value
 */
async function readRegister(registerConfig) {
  if (!isConnected) {
    throw new Error('Modbus not connected');
  }
  
  const registerNumber = getRegisterNumber(registerConfig.address);
  
  try {
    const response = await client.readHoldingRegisters(registerNumber, registerConfig.length);
    const value = parseFloat32BE(response.response.body.valuesAsBuffer);
    
    return {
      metric: registerConfig.metric,
      value: parseFloat(value.toFixed(3)),
      unit: registerConfig.unit,
      phase: registerConfig.phase,
    };
  } catch (error) {
    console.error(`Error reading register ${registerConfig.address}:`, error.message);
    return null;
  }
}

/**
 * Poll all registers and save to database
 */
async function pollAllRegisters() {
  if (MOCK_MODE) {
    console.log(`🎭 Generating mock data at ${new Date().toISOString()}...`);
    
    try {
      const measurements = generateMockMeasurements(LOCATION);
      
      // Save all measurements to database
      for (const data of measurements) {
        await insertMeasurement(
          LOCATION,
          data.metric,
          data.value,
          data.unit,
          data.phase
        );
      }
      
      console.log(`✅ Generated ${measurements.length} mock measurements`);
      return measurements;
    } catch (error) {
      console.error('Error generating mock data:', error.message);
      return [];
    }
  }
  
  if (!isConnected) {
    console.warn('⚠️  Skipping poll - Modbus not connected');
    return;
  }
  
  console.log(`🔍 Polling registers at ${new Date().toISOString()}...`);
  
  const measurements = [];
  
  // Read all registers
  for (const [key, registerConfig] of Object.entries(MODBUS_REGISTERS)) {
    try {
      const data = await readRegister(registerConfig);
      
      if (data && !isNaN(data.value)) {
        measurements.push(data);
        
        // Save to database
        await insertMeasurement(
          LOCATION,
          data.metric,
          data.value,
          data.unit,
          data.phase
        );
      }
      
      // Small delay between reads to avoid overwhelming the device
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      console.error(`Error polling ${key}:`, error.message);
    }
  }
  
  console.log(`✅ Polled ${measurements.length} measurements`);
  
  return measurements;
}

/**
 * Start periodic polling
 */
export function startPolling() {
  console.log(`⏰ Starting polling every ${POLL_INTERVAL} seconds...`);
  
  // Poll immediately
  pollAllRegisters().catch(err => {
    console.error('Initial poll error:', err);
  });
  
  // Schedule periodic polling
  pollJob = schedule.scheduleJob(`*/${POLL_INTERVAL} * * * * *`, async () => {
    await pollAllRegisters();
  });
  
  console.log('✅ Polling scheduler started');
}

/**
 * Stop polling
 */
export function stopPolling() {
  if (pollJob) {
    pollJob.cancel();
    console.log('⏹️  Polling stopped');
  }
  
  if (socket) {
    socket.end();
  }
}

/**
 * Get connection status
 */
export function getConnectionStatus() {
  return {
    connected: isConnected,
    mockMode: MOCK_MODE,
    host: MODBUS_HOST,
    port: MODBUS_PORT,
    unitId: MODBUS_UNIT_ID,
    pollInterval: POLL_INTERVAL,
  };
}

/**
 * Manual poll trigger (for testing)
 */
export async function manualPoll() {
  return await pollAllRegisters();
}
