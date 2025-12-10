// Registers sourced from device manual; scale divides raw register values to engineering units
export const MODBUS_REGISTERS = {
  CURRENT_L1: { address: 0x1802, length: 2, type: 'int32', scale: 10.0, unit: 'A', metric: 'current', phase: 'L1' },
  CURRENT_L2: { address: 0x1804, length: 2, type: 'int32', scale: 10.0, unit: 'A', metric: 'current', phase: 'L2' },
  CURRENT_L3: { address: 0x1806, length: 2, type: 'int32', scale: 10.0, unit: 'A', metric: 'current', phase: 'L3' },

  VOLTAGE_L1N: { address: 0x1816, length: 2, type: 'int32', scale: 10.0, unit: 'V', metric: 'voltage', phase: 'L1-N' },
  VOLTAGE_L2N: { address: 0x1818, length: 2, type: 'int32', scale: 10.0, unit: 'V', metric: 'voltage', phase: 'L2-N' },
  VOLTAGE_L3N: { address: 0x181A, length: 2, type: 'int32', scale: 10.0, unit: 'V', metric: 'voltage', phase: 'L3-N' },

  ACTIVE_POWER_TOTAL: { address: 0x182A, length: 2, type: 'int32', scale: 1.0, unit: 'kW', metric: 'active_power', phase: 'total' },

  // Energy import (kWh); register uses four 16-bit words (64-bit unsigned) scaled by 1000
  ENERGY_ACTIVE_IMPORT: { address: 0x1848, length: 6, type: 'uint64', scale: 1000.0, unit: 'kWh', metric: 'energy_active', phase: 'import' },
};

/**
 * Convert Modbus address to zero-based register number for jsmodbus.
 * - 4XXXXX addresses are normalized by subtracting 400001
 * - For raw offsets, pass zeroBased=false if your source is 1-based
 */
export function getRegisterNumber(address, zeroBased = true) {
  if (address >= 400001) {
    return address - 400001;
  }
  return zeroBased ? address : Math.max(address - 1, 0);
}

/**
 * Parse 32-bit float from two Modbus registers.
 *
 * Float decoding mode is controlled by MODBUS_FLOAT_MODE:
 * - BE   → Big Endian (AB CD)
 * - LE   → Little Endian (DC BA)
 * - SWAP → Word swap (CD AB, each word Big Endian)
 */
export function parseFloat32BE(buffer, offset = 0) {
  const mode = (process.env.MODBUS_FLOAT_MODE || 'BE').toUpperCase();

  try {
    switch (mode) {
      case 'LE':
        return buffer.readFloatLE(offset);
      case 'SWAP': {
        // Swap 16-bit words: AB CD -> CD AB, then decode as BE
        const swapped = Buffer.from([
          buffer[offset + 2],
          buffer[offset + 3],
          buffer[offset + 0],
          buffer[offset + 1],
        ]);
        return swapped.readFloatBE(0);
      }
      default: // 'BE'
        return buffer.readFloatBE(offset);
    }
  } catch {
    return NaN;
  }
}

/**
 * Decode a Modbus response buffer into a scaled value using register metadata
 */
export function decodeRegisterValue(buffer, registerConfig) {
  const { type = 'int32', scale = 1 } = registerConfig;

  try {
    let rawValue;

    switch (type) {
      case 'float':
        rawValue = parseFloat32BE(buffer);
        break;
      case 'uint64':
        rawValue = Number(buffer.readBigUInt64BE(0));
        break;
      case 'int64':
        rawValue = Number(buffer.readBigInt64BE(0));
        break;
      case 'uint32':
        rawValue = buffer.readUInt32BE(0);
        break;
      case 'int32':
        rawValue = buffer.readInt32BE(0);
        break;
      default:
        rawValue = buffer.readInt16BE(0);
    }

    if (!Number.isFinite(rawValue)) {
      return NaN;
    }

    return rawValue / (scale || 1);
  } catch {
    return NaN;
  }
}

/**
 * Get all registers to poll (grouped for efficiency)
 */
export function getRegistersToPoll() {
  return Object.values(MODBUS_REGISTERS);
}
