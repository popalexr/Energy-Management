import Modbus from 'jsmodbus';
import { SerialPort } from 'serialport';
import schedule from 'node-schedule';
import dotenv from 'dotenv';
import { insertMeasurement } from './database.js';
import { MODBUS_REGISTERS, getRegisterNumber, parseFloat32BE } from './modbusConfig.js';
import { generateMockMeasurements } from './mockModbus.js';

dotenv.config();

// Modbus client configuration
const MODBUS_UNIT_ID = parseInt(process.env.MODBUS_UNIT_ID) || 1;
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL_SECONDS) || 5;
const LOCATION = process.env.LOCATION_SALA_SPORT || 'sala-sport';
const MOCK_MODE = process.env.MOCK_MODE === 'true';

const MODBUS_SERIAL_PORT = process.env.MODBUS_SERIAL_PORT || '/dev/ttyUSB0';
const MODBUS_SERIAL_BAUD_RATE = parseInt(process.env.MODBUS_SERIAL_BAUD_RATE) || 9600;
const MODBUS_SERIAL_DATA_BITS = parseInt(process.env.MODBUS_SERIAL_DATA_BITS) || 8;
const MODBUS_SERIAL_STOP_BITS = parseInt(process.env.MODBUS_SERIAL_STOP_BITS) || 1;
const MODBUS_SERIAL_PARITY = process.env.MODBUS_SERIAL_PARITY || 'none';

let port = null;
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
  
  console.log(`📡 Connecting to Modbus RTU on ${MODBUS_SERIAL_PORT}...`);
  
  port = new SerialPort({
    path: MODBUS_SERIAL_PORT,
    baudRate: MODBUS_SERIAL_BAUD_RATE,
    dataBits: MODBUS_SERIAL_DATA_BITS,
    stopBits: MODBUS_SERIAL_STOP_BITS,
    parity: MODBUS_SERIAL_PARITY,
    autoOpen: false,
  });

  client = new Modbus.client.RTU(port, MODBUS_UNIT_ID);
  
  port.on('open', () => {
    console.log('✅ Modbus RTU connected successfully');
    isConnected = true;
  });
  
  port.on('error', (err) => {
    console.error('❌ Modbus serial error:', err.message);
    isConnected = false;
  });
  
  port.on('close', () => {
    console.log('⚠️  Modbus serial connection closed');
    isConnected = false;
    
    // Attempt reconnection after 10 seconds
    setTimeout(() => {
      console.log('🔄 Attempting to reopen serial port...');
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
    if (port && !port.isOpen) {
      port.open((err) => {
        if (err) {
          console.error('❌ Failed to open Modbus serial port:', err.message);
        }
      });
    }
  } catch (error) {
    console.error('❌ Failed to open Modbus serial port:', error.message);
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
  
  if (port && port.isOpen) {
    port.close();
  }
}

/**
 * Get connection status
 */
export function getConnectionStatus() {
  return {
    connected: isConnected,
    mockMode: MOCK_MODE,
    serialPort: MODBUS_SERIAL_PORT,
    baudRate: MODBUS_SERIAL_BAUD_RATE,
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
