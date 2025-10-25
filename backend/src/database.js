import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'energy_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

/**
 * Insert a measurement into the database
 */
export async function insertMeasurement(location, metric, value, unit = null, phase = null) {
  const query = `
    INSERT INTO measurements (location, metric, value, unit, phase, captured_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING *
  `;
  
  try {
    const result = await pool.query(query, [location, metric, value, unit, phase]);
    return result.rows[0];
  } catch (error) {
    console.error('Error inserting measurement:', error);
    throw error;
  }
}

/**
 * Get latest measurements for a location
 */
export async function getLatestMeasurements(location) {
  const query = `
    SELECT DISTINCT ON (metric, phase)
      metric, value, unit, phase, captured_at
    FROM measurements
    WHERE location = $1
    ORDER BY metric, phase, captured_at DESC
  `;
  
  try {
    const result = await pool.query(query, [location]);
    return result.rows;
  } catch (error) {
    console.error('Error getting latest measurements:', error);
    throw error;
  }
}

/**
 * Get measurement history for a location and metric
 */
export async function getMeasurementHistory(location, metric, fromDate, toDate, limit = 1000) {
  const query = `
    SELECT metric, value, unit, phase, captured_at
    FROM measurements
    WHERE location = $1 
      AND metric = $2
      AND captured_at BETWEEN $3 AND $4
    ORDER BY captured_at DESC
    LIMIT $5
  `;
  
  try {
    const result = await pool.query(query, [location, metric, fromDate, toDate, limit]);
    return result.rows;
  } catch (error) {
    console.error('Error getting measurement history:', error);
    throw error;
  }
}

/**
 * Get all locations
 */
export async function getLocations() {
  const query = 'SELECT * FROM locations WHERE is_active = true ORDER BY name';
  
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error getting locations:', error);
    throw error;
  }
}

/**
 * Get aggregated data for dashboard
 */
export async function getDashboardData(location) {
  const query = `
    SELECT 
      metric,
      phase,
      value,
      unit,
      captured_at
    FROM latest_measurements
    WHERE location = $1
    ORDER BY metric, phase
  `;
  
  try {
    const result = await pool.query(query, [location]);
    return result.rows;
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    throw error;
  }
}

export default pool;
