/**
 * Modbus Register Map for Eaton PXR25
 * Based on PXR10 manual - Table 24
 * 
 * Register addresses are in Modbus format (subtract 400001 for actual register)
 * All power/energy values are 32-bit floats (2 registers)
 */

export const MODBUS_REGISTERS = {
  // Voltage Measurements (Phase-to-Neutral)
  VOLTAGE_L1N: { address: 404609, length: 2, type: 'float', unit: 'V', metric: 'voltage', phase: 'L1-N' },
  VOLTAGE_L2N: { address: 404611, length: 2, type: 'float', unit: 'V', metric: 'voltage', phase: 'L2-N' },
  VOLTAGE_L3N: { address: 404613, length: 2, type: 'float', unit: 'V', metric: 'voltage', phase: 'L3-N' },
  
  // Voltage Measurements (Phase-to-Phase)
  VOLTAGE_L1L2: { address: 404615, length: 2, type: 'float', unit: 'V', metric: 'voltage', phase: 'L1-L2' },
  VOLTAGE_L2L3: { address: 404617, length: 2, type: 'float', unit: 'V', metric: 'voltage', phase: 'L2-L3' },
  VOLTAGE_L3L1: { address: 404619, length: 2, type: 'float', unit: 'V', metric: 'voltage', phase: 'L3-L1' },
  
  // Current Measurements
  CURRENT_L1: { address: 404621, length: 2, type: 'float', unit: 'A', metric: 'current', phase: 'L1' },
  CURRENT_L2: { address: 404623, length: 2, type: 'float', unit: 'A', metric: 'current', phase: 'L2' },
  CURRENT_L3: { address: 404625, length: 2, type: 'float', unit: 'A', metric: 'current', phase: 'L3' },
  CURRENT_N: { address: 404627, length: 2, type: 'float', unit: 'A', metric: 'current', phase: 'N' },
  
  // Active Power (Putere Activa)
  ACTIVE_POWER_L1: { address: 404641, length: 2, type: 'float', unit: 'kW', metric: 'active_power', phase: 'L1' },
  ACTIVE_POWER_L2: { address: 404643, length: 2, type: 'float', unit: 'kW', metric: 'active_power', phase: 'L2' },
  ACTIVE_POWER_L3: { address: 404645, length: 2, type: 'float', unit: 'kW', metric: 'active_power', phase: 'L3' },
  ACTIVE_POWER_TOTAL: { address: 404651, length: 2, type: 'float', unit: 'kW', metric: 'active_power', phase: 'total' },
  
  // Reactive Power (Putere Reactiva)
  REACTIVE_POWER_L1: { address: 404653, length: 2, type: 'float', unit: 'kVAR', metric: 'reactive_power', phase: 'L1' },
  REACTIVE_POWER_L2: { address: 404655, length: 2, type: 'float', unit: 'kVAR', metric: 'reactive_power', phase: 'L2' },
  REACTIVE_POWER_L3: { address: 404657, length: 2, type: 'float', unit: 'kVAR', metric: 'reactive_power', phase: 'L3' },
  REACTIVE_POWER_TOTAL: { address: 404659, length: 2, type: 'float', unit: 'kVAR', metric: 'reactive_power', phase: 'total' },
  
  // Apparent Power (Putere Aparenta)
  APPARENT_POWER_L1: { address: 404661, length: 2, type: 'float', unit: 'kVA', metric: 'apparent_power', phase: 'L1' },
  APPARENT_POWER_L2: { address: 404663, length: 2, type: 'float', unit: 'kVA', metric: 'apparent_power', phase: 'L2' },
  APPARENT_POWER_L3: { address: 404665, length: 2, type: 'float', unit: 'kVA', metric: 'apparent_power', phase: 'L3' },
  APPARENT_POWER_TOTAL: { address: 404667, length: 2, type: 'float', unit: 'kVA', metric: 'apparent_power', phase: 'total' },
  
  // Power Factor (cos φ)
  POWER_FACTOR_L1: { address: 404671, length: 2, type: 'float', unit: '', metric: 'power_factor', phase: 'L1' },
  POWER_FACTOR_L2: { address: 404673, length: 2, type: 'float', unit: '', metric: 'power_factor', phase: 'L2' },
  POWER_FACTOR_L3: { address: 404675, length: 2, type: 'float', unit: '', metric: 'power_factor', phase: 'L3' },
  POWER_FACTOR_TOTAL: { address: 404677, length: 2, type: 'float', unit: '', metric: 'power_factor', phase: 'total' },
  
  // Energy - Active (Energie Activa)
  ENERGY_ACTIVE_IMPORT: { address: 404801, length: 2, type: 'float', unit: 'kWh', metric: 'energy_active', phase: 'import' },
  ENERGY_ACTIVE_EXPORT: { address: 404803, length: 2, type: 'float', unit: 'kWh', metric: 'energy_active', phase: 'export' },
  
  // Energy - Reactive (Energie Reactiva)
  ENERGY_REACTIVE_IMPORT: { address: 404811, length: 2, type: 'float', unit: 'kVARh', metric: 'energy_reactive', phase: 'import' },
  ENERGY_REACTIVE_EXPORT: { address: 404813, length: 2, type: 'float', unit: 'kVARh', metric: 'energy_reactive', phase: 'export' },
  
  // Energy - Apparent (Energie Aparenta)
  ENERGY_APPARENT: { address: 404821, length: 2, type: 'float', unit: 'kVAh', metric: 'energy_apparent', phase: 'total' },
  
  // Frequency (Tensiune Faze - Frequency)
  FREQUENCY: { address: 404631, length: 2, type: 'float', unit: 'Hz', metric: 'frequency', phase: null },
};

/**
 * Convert Modbus address to register number
 * Modbus address format: 4XXXXX (holding registers)
 * Actual register = address - 400001
 */
export function getRegisterNumber(address) {
  return address - 400001;
}

/**
 * Parse 32-bit float from two Modbus registers (Big Endian)
 */
export function parseFloat32BE(buffer, offset = 0) {
  return buffer.readFloatBE(offset);
}

/**
 * Get all registers to poll (grouped for efficiency)
 */
export function getRegistersToPoll() {
  return Object.values(MODBUS_REGISTERS);
}
