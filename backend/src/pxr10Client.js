import Modbus from 'jsmodbus';
import { SerialPort } from 'serialport';
import dotenv from 'dotenv';
import { MODBUS_REGISTERS, getRegisterNumber } from './modbusConfig.js';

dotenv.config();

const MODBUS_UNIT_ID = parseInt(process.env.MODBUS_UNIT_ID) || 1;
const MODBUS_SERIAL_PORT = process.env.MODBUS_SERIAL_PORT || '/dev/ttyUSB0';
const MODBUS_SERIAL_BAUD_RATE = parseInt(process.env.MODBUS_SERIAL_BAUD_RATE) || 9600;
const MODBUS_SERIAL_DATA_BITS = parseInt(process.env.MODBUS_SERIAL_DATA_BITS) || 8;
const MODBUS_SERIAL_STOP_BITS = parseInt(process.env.MODBUS_SERIAL_STOP_BITS) || 1;
const MODBUS_SERIAL_PARITY = process.env.MODBUS_SERIAL_PARITY || 'none';
const MOCK_MODE = process.env.MOCK_MODE === 'true';
const FLOAT_MODE = (process.env.MODBUS_FLOAT_MODE || 'BE').toUpperCase();

function parseFloat32(buffer) {
  try {
    switch (FLOAT_MODE) {
      case 'LE':
        return buffer.readFloatLE(0);
      case 'SWAP': {
        // Swap 16-bit words (AB CD -> CD AB) then decode BE
        const swapped = Buffer.from([
          buffer[2], buffer[3], buffer[0], buffer[1],
        ]);
        return swapped.readFloatBE(0);
      }
      default: // 'BE'
        return buffer.readFloatBE(0);
    }
  } catch (e) {
    return NaN;
  }
}

class Pxr10Client {
  constructor() {
    this.port = null;
    this.client = null;
    this.connected = false;
  }

  isConnected() {
    return MOCK_MODE ? true : this.connected;
  }

  async connect() {
    if (MOCK_MODE) {
      this.connected = true;
      return;
    }

    if (this.connected) return;

    this.port = new SerialPort({
      path: MODBUS_SERIAL_PORT,
      baudRate: MODBUS_SERIAL_BAUD_RATE,
      dataBits: MODBUS_SERIAL_DATA_BITS,
      stopBits: MODBUS_SERIAL_STOP_BITS,
      parity: MODBUS_SERIAL_PARITY,
      autoOpen: false,
    });

    this.client = new Modbus.client.RTU(this.port, MODBUS_UNIT_ID);

    await new Promise((resolve, reject) => {
      const handleOpen = () => {
        this.connected = true;
        resolve();
      };
      const handleError = (err) => {
        this.connected = false;
        reject(err);
      };

      this.port.once('open', handleOpen);
      this.port.once('error', handleError);

      try {
        this.port.open((err) => {
          if (err) {
            handleError(err);
          }
        });
      } catch (err) {
        handleError(err);
      }
    });
  }

  async disconnect() {
    try {
      if (this.port && this.port.isOpen) {
        this.port.close();
      }
    } finally {
      this.connected = false;
      this.port = null;
      this.client = null;
    }
  }

  async readByKey(key) {
    const cfg = MODBUS_REGISTERS[key];
    if (!cfg) {
      throw new Error(`Unknown register key: ${key}`);
    }
    return this.readRegister(cfg);
  }

  async readRegister(cfg) {
    if (MOCK_MODE) {
      // Return a neutral mock for direct reads; for rich mock data use existing poller endpoints
      return {
        metric: cfg.metric,
        value: 0,
        unit: cfg.unit,
        phase: cfg.phase,
        address: cfg.address,
      };
    }

    if (!this.connected) {
      await this.connect();
    }

    const reg = getRegisterNumber(cfg.address);
    const length = cfg.length || 2;
    const resp = await this.client.readHoldingRegisters(reg, length);
    const buf = resp.response.body.valuesAsBuffer;

    let value;
    if (cfg.type === 'float') {
      value = parseFloat32(buf);
    } else {
      // default: 16-bit integer or raw buffer
      value = buf.readInt16BE(0);
    }

    return {
      metric: cfg.metric,
      value: Number.isFinite(value) ? parseFloat(value.toFixed(3)) : null,
      unit: cfg.unit,
      phase: cfg.phase,
      address: cfg.address,
    };
  }

  async readAll() {
    const entries = Object.entries(MODBUS_REGISTERS);
    const out = {};
    for (const [key, cfg] of entries) {
      try {
        const r = await this.readRegister(cfg);
        out[key] = r;
        // small spacing to avoid hammering device
        await new Promise((res) => setTimeout(res, 20));
      } catch (e) {
        out[key] = { error: e.message, address: cfg.address };
      }
    }
    return out;
  }
}

export const pxr10Client = new Pxr10Client();
export default pxr10Client;
