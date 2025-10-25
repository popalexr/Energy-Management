# Energy Management Backend

Node.js backend server for polling Modbus TCP devices and providing REST API.

## Architecture

```
Eaton ECAM (Modbus TCP) → Backend Poller → PostgreSQL → REST API → Frontend
```

## Features

- ✅ Modbus TCP client for Eaton PXR25
- ✅ Automatic polling every 5 seconds
- ✅ PostgreSQL persistence
- ✅ RESTful API
- ✅ Auto-reconnection on failure
- ✅ CORS enabled

## Installation

```powershell
npm install
copy .env.example .env
# Edit .env with your settings
npm run dev
```

## Configuration

Edit `.env`:

```env
PORT=3000
MOCK_MODE=true             # Set to true for simulated data (no hardware needed)
MODBUS_HOST=192.168.1.100  # Your ECAM IP
MODBUS_PORT=502
POLL_INTERVAL_SECONDS=5
DB_NAME=energy_management
DB_USER=postgres
DB_PASSWORD=postgres
```

### Mock Mode (Testing Without Hardware)

For testing without the ECAM hardware, enable mock mode:

```env
MOCK_MODE=true
```

This will:
- ✅ Generate realistic simulated electrical data
- ✅ Skip Modbus TCP connection attempts  
- ✅ Allow full testing of the application
- ✅ Populate the database with realistic changing values

When you have the ECAM hardware available, set `MOCK_MODE=false`.

## API Endpoints

### System

#### GET /api/v1/system/health
Health check endpoint

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-10-25T10:00:00.000Z",
  "modbus": {
    "connected": true,
    "host": "192.168.1.100",
    "port": 502
  }
}
```

#### GET /api/v1/system/status
Get detailed system status

**Response:**
```json
{
  "success": true,
  "data": {
    "server": {
      "uptime": 3600,
      "memory": { ... },
      "env": "development"
    },
    "modbus": {
      "connected": true,
      "host": "192.168.1.100",
      "port": 502,
      "pollInterval": 5
    }
  }
}
```

#### POST /api/v1/system/poll
Trigger manual poll (for testing)

**Response:**
```json
{
  "success": true,
  "message": "Manual poll completed",
  "measurements": 40
}
```

### Locations

#### GET /api/v1/locations
Get all locations

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "sala-sport",
      "display_name": "SALA SPORT",
      "is_active": true
    }
  ]
}
```

#### GET /api/v1/locations/:location/latest
Get latest measurements for a location

**Example:** `/api/v1/locations/sala-sport/latest`

**Response:**
```json
{
  "success": true,
  "location": "sala-sport",
  "data": {
    "voltage": [
      { "phase": "L1-N", "value": 230.5, "unit": "V" },
      { "phase": "L2-N", "value": 231.2, "unit": "V" }
    ],
    "active_power": [
      { "phase": "L1", "value": 5.4, "unit": "kW" }
    ]
  }
}
```

#### GET /api/v1/locations/:location/dashboard
Get formatted dashboard data

**Example:** `/api/v1/locations/sala-sport/dashboard`

**Response:**
```json
{
  "success": true,
  "location": "sala-sport",
  "data": {
    "voltage": {
      "L1-N": { "value": 230.5, "unit": "V" },
      "L2-N": { "value": 231.2, "unit": "V" }
    },
    "activePower": {
      "total": { "value": 15.6, "unit": "kW" }
    },
    "energy": {
      "energy_active_import": { "value": 1234.56, "unit": "kWh" }
    }
  }
}
```

#### GET /api/v1/locations/:location/history/:metric
Get historical data for a metric

**Parameters:**
- `from` - ISO date string (default: 24 hours ago)
- `to` - ISO date string (default: now)
- `limit` - Number of records (default: 1000)

**Example:** `/api/v1/locations/sala-sport/history/active_power?from=2025-10-25T00:00:00Z&to=2025-10-25T23:59:59Z`

**Response:**
```json
{
  "success": true,
  "location": "sala-sport",
  "metric": "active_power",
  "data": [
    {
      "value": 15.6,
      "unit": "kW",
      "phase": "total",
      "captured_at": "2025-10-25T10:00:00.000Z"
    }
  ]
}
```

## Modbus Register Map

See `src/modbusConfig.js` for complete mapping.

Key registers (PXR25):

| Register | Metric | Type | Unit |
|----------|--------|------|------|
| 404609 | Voltage L1-N | Float32 | V |
| 404621 | Current L1 | Float32 | A |
| 404651 | Active Power Total | Float32 | kW |
| 404677 | Power Factor Total | Float32 | - |
| 404801 | Energy Active Import | Float32 | kWh |

## Database Schema

```sql
CREATE TABLE measurements (
    id BIGSERIAL PRIMARY KEY,
    location VARCHAR(100) NOT NULL,
    metric VARCHAR(100) NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(20),
    phase VARCHAR(10),
    captured_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    is_active BOOLEAN DEFAULT true
);
```

## Development

```powershell
# Install dependencies
npm install

# Run in development mode (with auto-reload)
npm run dev

# Run in production mode
npm start
```

## Testing

### Test Modbus Connection

```powershell
# Manual poll
curl -X POST http://localhost:3000/api/v1/system/poll
```

### Test Database

```powershell
psql -U postgres -d energy_management

# Check latest measurements
SELECT * FROM measurements ORDER BY captured_at DESC LIMIT 10;

# Check by location
SELECT * FROM latest_measurements WHERE location = 'sala-sport';
```

## Troubleshooting

### Modbus connection fails

```
❌ Modbus connection error: ECONNREFUSED
```

**Solutions:**
1. Check ECAM IP in `.env`
2. Verify network connectivity: `ping YOUR_IP`
3. Test with Modbus tool (ModScan, QModMaster)
4. Check firewall settings

### Database errors

```
❌ Unexpected database error
```

**Solutions:**
1. Verify PostgreSQL is running
2. Check credentials in `.env`
3. Run schema: `psql -U postgres -d energy_management -f schema.sql`

## File Structure

```
backend/
├── src/
│   ├── index.js           # Main server
│   ├── database.js        # PostgreSQL client
│   ├── modbusPoller.js    # Modbus TCP poller
│   ├── modbusConfig.js    # Register definitions
│   └── routes/
│       ├── locations.js   # Location endpoints
│       └── system.js      # System endpoints
├── schema.sql             # Database schema
├── package.json
└── .env                   # Configuration
```

## Dependencies

- `express` - Web framework
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables
- `pg` - PostgreSQL client
- `jsmodbus` - Modbus TCP library
- `node-schedule` - Job scheduler

## License

MIT
