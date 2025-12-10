#!/usr/bin/env node
// Simple Modbus reader (TCP or Serial/RTU) that reuses register definitions from the backend
import net from 'net';
import dotenv from 'dotenv';
import Modbus from 'jsmodbus';
import { SerialPort } from 'serialport';
import {
  MODBUS_REGISTERS,
  decodeRegisterValue,
  getRegisterNumber,
} from '../../backend/src/modbusConfig.js';

dotenv.config();

const protocol = (process.env.MODBUS_PROTOCOL || (process.env.MODBUS_SERIAL_PORT ? 'serial' : 'tcp')).toLowerCase();
const host = process.env.MODBUS_HOST || '127.0.0.1';
const tcpPort = parseInt(process.env.MODBUS_PORT ?? '502', 10);
const unitId = parseInt(process.env.MODBUS_UNIT_ID ?? '1', 10);
const connectTimeoutMs = parseInt(process.env.MODBUS_CONNECT_TIMEOUT_MS ?? '5000', 10);
const interReadDelayMs = parseInt(process.env.MODBUS_READ_DELAY_MS ?? '50', 10);

// Serial settings (used when protocol=serial)
const serialPath = process.env.MODBUS_SERIAL_PORT || '/dev/ttyUSB0';
const serialBaudRate = parseInt(process.env.MODBUS_SERIAL_BAUD_RATE ?? '9600', 10);
const serialDataBits = parseInt(process.env.MODBUS_SERIAL_DATA_BITS ?? '8', 10);
const serialStopBits = parseInt(process.env.MODBUS_SERIAL_STOP_BITS ?? '1', 10);
const serialParity = process.env.MODBUS_SERIAL_PARITY || 'none';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function connectModbusTCP(socket, { host, port, timeout }) {
  return new Promise((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      socket.off('connect', onConnect);
      socket.off('error', onError);
      socket.off('timeout', onTimeout);
      socket.setTimeout(0);
    };

    const onConnect = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };

    const onError = (err) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(err);
    };

    const onTimeout = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error(`Connection timed out after ${timeout}ms`));
    };

    socket.once('connect', onConnect);
    socket.once('error', onError);
    socket.once('timeout', onTimeout);
    socket.setTimeout(timeout);

    socket.connect({ host, port });
  });
}

function openSerialPort(port, timeout) {
  return new Promise((resolve, reject) => {
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error(`Serial open timed out after ${timeout}ms`));
    }, timeout);

    const cleanup = () => {
      clearTimeout(timer);
      port.off('open', onOpen);
      port.off('error', onError);
    };

    const onOpen = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };

    const onError = (err) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(err);
    };

    port.once('open', onOpen);
    port.once('error', onError);
    port.open();
  });
}

async function readRegister(client, key, registerConfig) {
  const registerNumber = getRegisterNumber(
    registerConfig.address,
    registerConfig.zeroBased ?? true
  );

  const response = await client.readHoldingRegisters(
    registerNumber,
    registerConfig.length
  );

  const value = decodeRegisterValue(
    response.response.body.valuesAsBuffer,
    registerConfig
  );

  if (!Number.isFinite(value)) {
    throw new Error('Received non-numeric/NaN value');
  }

  const rounded = Number.parseFloat(value.toFixed(3));
  return rounded;
}

async function readAllRegisters(client) {
  console.log('Reading registers defined in backend/src/modbusConfig.js...');

  for (const [key, registerConfig] of Object.entries(MODBUS_REGISTERS)) {
    try {
      const value = await readRegister(client, key, registerConfig);
      const unit = registerConfig.unit ? ` ${registerConfig.unit}` : '';
      const phase = registerConfig.phase ? ` / ${registerConfig.phase}` : '';

      console.log(
        `${key.padEnd(22)} -> ${value}${unit} (metric=${registerConfig.metric}${phase})`
      );
    } catch (error) {
      console.error(
        `${key.padEnd(22)} x  ${error.message} (address=${registerConfig.address})`
      );
    }

    if (interReadDelayMs > 0) {
      await sleep(interReadDelayMs);
    }
  }
}

async function runTCP() {
  console.log(`Connecting to Modbus TCP ${host}:${tcpPort} (unit ${unitId})...`);

  const socket = new net.Socket();
  const client = new Modbus.client.TCP(socket, unitId);

  try {
    await connectModbusTCP(socket, { host, port: tcpPort, timeout: connectTimeoutMs });
    await readAllRegisters(client);
  } catch (error) {
    console.error('Unable to connect/read registers over TCP:', error.message);
  } finally {
    socket.end();
    socket.destroy();
  }
}

async function runSerial() {
  console.log(
    `Connecting to Modbus RTU serial ${serialPath} @ ${serialBaudRate} baud (unit ${unitId})...`
  );

  const port = new SerialPort({
    path: serialPath,
    baudRate: serialBaudRate,
    dataBits: serialDataBits,
    stopBits: serialStopBits,
    parity: serialParity,
    autoOpen: false,
  });

  const client = new Modbus.client.RTU(port, unitId);

  try {
    await openSerialPort(port, connectTimeoutMs);
    await readAllRegisters(client);
  } catch (error) {
    console.error('Unable to connect/read registers over Serial:', error.message);
  } finally {
    if (port.isOpen) {
      await new Promise((resolve) => port.close(() => resolve()));
    }
  }
}

async function main() {
  if (protocol === 'serial') {
    await runSerial();
    return;
  }

  await runTCP();
}

main();
