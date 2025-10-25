import express from 'express';
import {
  getLatestMeasurements,
  getMeasurementHistory,
  getLocations,
  getDashboardData,
} from '../database.js';

const router = express.Router();

/**
 * GET /api/v1/locations
 * Get all locations
 */
router.get('/', async (req, res) => {
  try {
    const locations = await getLocations();
    res.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch locations',
    });
  }
});

/**
 * GET /api/v1/locations/:location/latest
 * Get latest measurements for a location
 */
router.get('/:location/latest', async (req, res) => {
  try {
    const { location } = req.params;
    const measurements = await getLatestMeasurements(location);
    
    // Group by metric type
    const grouped = measurements.reduce((acc, m) => {
      if (!acc[m.metric]) {
        acc[m.metric] = [];
      }
      acc[m.metric].push({
        phase: m.phase,
        value: m.value,
        unit: m.unit,
        timestamp: m.captured_at,
      });
      return acc;
    }, {});
    
    res.json({
      success: true,
      location,
      data: grouped,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error fetching latest measurements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch latest measurements',
    });
  }
});

/**
 * GET /api/v1/locations/:location/dashboard
 * Get dashboard data for a location
 */
router.get('/:location/dashboard', async (req, res) => {
  try {
    const { location } = req.params;
    const data = await getDashboardData(location);
    
    // Transform data for dashboard
    const dashboard = {
      voltage: {},
      current: {},
      activePower: {},
      reactivePower: {},
      apparentPower: {},
      powerFactor: {},
      energy: {},
      frequency: null,
    };
    
    data.forEach(item => {
      const key = item.phase || 'total';
      
      switch (item.metric) {
        case 'voltage':
          dashboard.voltage[key] = { value: item.value, unit: item.unit };
          break;
        case 'current':
          dashboard.current[key] = { value: item.value, unit: item.unit };
          break;
        case 'active_power':
          dashboard.activePower[key] = { value: item.value, unit: item.unit };
          break;
        case 'reactive_power':
          dashboard.reactivePower[key] = { value: item.value, unit: item.unit };
          break;
        case 'apparent_power':
          dashboard.apparentPower[key] = { value: item.value, unit: item.unit };
          break;
        case 'power_factor':
          dashboard.powerFactor[key] = { value: item.value, unit: item.unit };
          break;
        case 'energy_active':
        case 'energy_reactive':
        case 'energy_apparent':
          dashboard.energy[`${item.metric}_${key}`] = { value: item.value, unit: item.unit };
          break;
        case 'frequency':
          dashboard.frequency = { value: item.value, unit: item.unit };
          break;
      }
    });
    
    res.json({
      success: true,
      location,
      data: dashboard,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
    });
  }
});

/**
 * GET /api/v1/locations/:location/history/:metric
 * Get measurement history for a specific metric
 */
router.get('/:location/history/:metric', async (req, res) => {
  try {
    const { location, metric } = req.params;
    const { from, to, limit } = req.query;
    
    const fromDate = from ? new Date(from) : new Date(Date.now() - 24 * 60 * 60 * 1000); // Default: last 24 hours
    const toDate = to ? new Date(to) : new Date();
    const queryLimit = limit ? parseInt(limit) : 1000;
    
    const history = await getMeasurementHistory(location, metric, fromDate, toDate, queryLimit);
    
    res.json({
      success: true,
      location,
      metric,
      data: history,
      range: {
        from: fromDate,
        to: toDate,
      },
    });
  } catch (error) {
    console.error('Error fetching measurement history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch measurement history',
    });
  }
});

export default router;
