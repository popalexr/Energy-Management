/**
 * Mock Modbus Data Generator
 * Generates realistic electrical measurement data for testing without hardware
 */

/**
 * Generate random value within a range with optional variation
 */
function randomInRange(min, max, precision = 2) {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(precision));
}

/**
 * Generate voltage values with slight variation around nominal
 */
export function generateVoltage(phase = 'L1-N', baseVoltage = 230) {
  // Add small random variation (±5%)
  const variation = randomInRange(-0.05, 0.05);
  const voltage = baseVoltage * (1 + variation);
  
  // Add some realistic noise
  const noise = randomInRange(-1, 1);
  
  return parseFloat((voltage + noise).toFixed(2));
}

/**
 * Generate current values based on load
 */
export function generateCurrent(phase = 'L1', baseLoad = 20) {
  // Simulate varying load (50% to 150% of base)
  const loadFactor = randomInRange(0.5, 1.5);
  const current = baseLoad * loadFactor;
  
  // Add some noise
  const noise = randomInRange(-0.5, 0.5);
  
  return parseFloat((current + noise).toFixed(2));
}

/**
 * Generate power factor (typically between 0.85 and 0.99)
 */
export function generatePowerFactor() {
  return randomInRange(0.85, 0.99, 3);
}

/**
 * Calculate active power from voltage and current
 */
export function calculateActivePower(voltage, current, powerFactor) {
  // P = V * I * cos(φ) / 1000 (convert to kW)
  const power = (voltage * current * powerFactor) / 1000;
  return parseFloat(power.toFixed(3));
}

/**
 * Calculate reactive power from active power and power factor
 */
export function calculateReactivePower(activePower, powerFactor) {
  // Q = P * tan(acos(pf))
  const angle = Math.acos(powerFactor);
  const reactivePower = activePower * Math.tan(angle);
  return parseFloat(reactivePower.toFixed(3));
}

/**
 * Calculate apparent power
 */
export function calculateApparentPower(activePower, reactivePower) {
  // S = √(P² + Q²)
  const apparentPower = Math.sqrt(
    Math.pow(activePower, 2) + Math.pow(reactivePower, 2)
  );
  return parseFloat(apparentPower.toFixed(3));
}

/**
 * Generate frequency (typically 50 Hz ±0.1 Hz)
 */
export function generateFrequency() {
  return randomInRange(49.9, 50.1, 2);
}

/**
 * Generate complete mock measurements for all phases
 */
export function generateMockMeasurements(location = 'sala-sport') {
  const measurements = [];
  
  // Base values
  const baseVoltagePN = 230; // Phase-to-Neutral
  const baseVoltagePP = 400; // Phase-to-Phase
  const baseCurrentL1 = 25;
  const baseCurrentL2 = 22;
  const baseCurrentL3 = 28;
  
  // Generate voltage measurements (Phase-to-Neutral)
  const voltageL1N = generateVoltage('L1-N', baseVoltagePN);
  const voltageL2N = generateVoltage('L2-N', baseVoltagePN);
  const voltageL3N = generateVoltage('L3-N', baseVoltagePN);
  
  measurements.push(
    { metric: 'voltage', value: voltageL1N, unit: 'V', phase: 'L1-N' },
    { metric: 'voltage', value: voltageL2N, unit: 'V', phase: 'L2-N' },
    { metric: 'voltage', value: voltageL3N, unit: 'V', phase: 'L3-N' }
  );
  
  // Generate voltage measurements (Phase-to-Phase)
  const voltageL1L2 = generateVoltage('L1-L2', baseVoltagePP);
  const voltageL2L3 = generateVoltage('L2-L3', baseVoltagePP);
  const voltageL3L1 = generateVoltage('L3-L1', baseVoltagePP);
  
  measurements.push(
    { metric: 'voltage', value: voltageL1L2, unit: 'V', phase: 'L1-L2' },
    { metric: 'voltage', value: voltageL2L3, unit: 'V', phase: 'L2-L3' },
    { metric: 'voltage', value: voltageL3L1, unit: 'V', phase: 'L3-L1' }
  );
  
  // Generate current measurements
  const currentL1 = generateCurrent('L1', baseCurrentL1);
  const currentL2 = generateCurrent('L2', baseCurrentL2);
  const currentL3 = generateCurrent('L3', baseCurrentL3);
  const currentN = randomInRange(0, 2); // Neutral current (usually small)
  
  measurements.push(
    { metric: 'current', value: currentL1, unit: 'A', phase: 'L1' },
    { metric: 'current', value: currentL2, unit: 'A', phase: 'L2' },
    { metric: 'current', value: currentL3, unit: 'A', phase: 'L3' },
    { metric: 'current', value: currentN, unit: 'A', phase: 'N' }
  );
  
  // Generate power factor
  const powerFactorL1 = generatePowerFactor();
  const powerFactorL2 = generatePowerFactor();
  const powerFactorL3 = generatePowerFactor();
  const powerFactorTotal = (powerFactorL1 + powerFactorL2 + powerFactorL3) / 3;
  
  measurements.push(
    { metric: 'power_factor', value: powerFactorL1, unit: '', phase: 'L1' },
    { metric: 'power_factor', value: powerFactorL2, unit: '', phase: 'L2' },
    { metric: 'power_factor', value: powerFactorL3, unit: '', phase: 'L3' },
    { metric: 'power_factor', value: parseFloat(powerFactorTotal.toFixed(3)), unit: '', phase: 'total' }
  );
  
  // Calculate active power for each phase
  const activePowerL1 = calculateActivePower(voltageL1N, currentL1, powerFactorL1);
  const activePowerL2 = calculateActivePower(voltageL2N, currentL2, powerFactorL2);
  const activePowerL3 = calculateActivePower(voltageL3N, currentL3, powerFactorL3);
  const activePowerTotal = activePowerL1 + activePowerL2 + activePowerL3;
  
  measurements.push(
    { metric: 'active_power', value: activePowerL1, unit: 'kW', phase: 'L1' },
    { metric: 'active_power', value: activePowerL2, unit: 'kW', phase: 'L2' },
    { metric: 'active_power', value: activePowerL3, unit: 'kW', phase: 'L3' },
    { metric: 'active_power', value: parseFloat(activePowerTotal.toFixed(3)), unit: 'kW', phase: 'total' }
  );
  
  // Calculate reactive power
  const reactivePowerL1 = calculateReactivePower(activePowerL1, powerFactorL1);
  const reactivePowerL2 = calculateReactivePower(activePowerL2, powerFactorL2);
  const reactivePowerL3 = calculateReactivePower(activePowerL3, powerFactorL3);
  const reactivePowerTotal = reactivePowerL1 + reactivePowerL2 + reactivePowerL3;
  
  measurements.push(
    { metric: 'reactive_power', value: reactivePowerL1, unit: 'kVAR', phase: 'L1' },
    { metric: 'reactive_power', value: reactivePowerL2, unit: 'kVAR', phase: 'L2' },
    { metric: 'reactive_power', value: reactivePowerL3, unit: 'kVAR', phase: 'L3' },
    { metric: 'reactive_power', value: parseFloat(reactivePowerTotal.toFixed(3)), unit: 'kVAR', phase: 'total' }
  );
  
  // Calculate apparent power
  const apparentPowerL1 = calculateApparentPower(activePowerL1, reactivePowerL1);
  const apparentPowerL2 = calculateApparentPower(activePowerL2, reactivePowerL2);
  const apparentPowerL3 = calculateApparentPower(activePowerL3, reactivePowerL3);
  const apparentPowerTotal = apparentPowerL1 + apparentPowerL2 + apparentPowerL3;
  
  measurements.push(
    { metric: 'apparent_power', value: apparentPowerL1, unit: 'kVA', phase: 'L1' },
    { metric: 'apparent_power', value: apparentPowerL2, unit: 'kVA', phase: 'L2' },
    { metric: 'apparent_power', value: apparentPowerL3, unit: 'kVA', phase: 'L3' },
    { metric: 'apparent_power', value: parseFloat(apparentPowerTotal.toFixed(3)), unit: 'kVA', phase: 'total' }
  );
  
  // Generate energy values (cumulative, so we'll use a growing value)
  const energyActiveImport = randomInRange(1000, 5000, 2);
  const energyActiveExport = randomInRange(0, 100, 2);
  const energyReactiveImport = randomInRange(100, 500, 2);
  const energyReactiveExport = randomInRange(0, 50, 2);
  const energyApparent = randomInRange(1100, 5500, 2);
  
  measurements.push(
    { metric: 'energy_active', value: energyActiveImport, unit: 'kWh', phase: 'import' },
    { metric: 'energy_active', value: energyActiveExport, unit: 'kWh', phase: 'export' },
    { metric: 'energy_reactive', value: energyReactiveImport, unit: 'kVARh', phase: 'import' },
    { metric: 'energy_reactive', value: energyReactiveExport, unit: 'kVARh', phase: 'export' },
    { metric: 'energy_apparent', value: energyApparent, unit: 'kVAh', phase: 'total' }
  );
  
  // Generate frequency
  const frequency = generateFrequency();
  measurements.push(
    { metric: 'frequency', value: frequency, unit: 'Hz', phase: null }
  );
  
  return measurements;
}

/**
 * Simulate a single register read (for compatibility with real Modbus code)
 */
export function mockReadRegister(registerConfig) {
  const mockData = generateMockMeasurements();
  
  // Find matching measurement
  const measurement = mockData.find(
    m => m.metric === registerConfig.metric && m.phase === registerConfig.phase
  );
  
  return measurement || {
    metric: registerConfig.metric,
    value: randomInRange(0, 100),
    unit: registerConfig.unit,
    phase: registerConfig.phase
  };
}
