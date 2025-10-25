# Mock Mode Guide

## What is Mock Mode?

Mock Mode allows you to test the Energy Management System **without the actual ECAM hardware**. It generates realistic simulated electrical data that mimics what you would see from a real Eaton PXR25 circuit breaker.

## ✅ Benefits

- 🔧 **Test without hardware** - No ECAM device needed
- 📊 **Realistic data** - Simulated values based on actual electrical behavior
- 🚀 **Fast setup** - Start testing immediately
- 💡 **Development friendly** - Perfect for UI development and testing

## 🎭 What Gets Simulated

Mock mode generates realistic data for:

- **Voltage** (230V ± 5% with noise)
  - Phase-to-Neutral: L1-N, L2-N, L3-N
  - Phase-to-Phase: L1-L2, L2-L3, L3-L1

- **Current** (15-35A with varying loads)
  - Per phase: L1, L2, L3, Neutral

- **Power**
  - Active Power (calculated from V × I × cos φ)
  - Reactive Power (calculated from PF)
  - Apparent Power (calculated from P and Q)

- **Power Factor** (0.85 - 0.99)
  - Per phase and total

- **Energy**
  - Active Energy Import (1000-5000 kWh)
  - Reactive Energy
  - Apparent Energy

- **Frequency** (50 Hz ± 0.1 Hz)

## 🚀 Quick Start with Mock Mode

### Step 1: Run Setup Script

```powershell
.\setup-mock.ps1
```

This will:
- ✅ Install all dependencies
- ✅ Create `.env` file with `MOCK_MODE=true`
- ✅ Optionally create the database

### Step 2: Start the Application

```powershell
.\start-all.ps1
```

### Step 3: Open Browser

Navigate to: http://localhost:5173

You should see the dashboard with **realistic, changing data** every 5 seconds!

## 🔧 Manual Configuration

### Enable Mock Mode

Edit `backend\.env`:

```env
MOCK_MODE=true
```

### Disable Mock Mode (When You Have Hardware)

Edit `backend\.env`:

```env
MOCK_MODE=false
MODBUS_HOST=192.168.1.100  # Your actual ECAM IP
```

## 📊 How Mock Data Works

### Data Generation

The mock system:

1. **Generates base values** with realistic ranges
   - Voltage: ~230V (phase-neutral), ~400V (phase-phase)
   - Current: 15-35A per phase
   - Power Factor: 0.85-0.99

2. **Adds variation** on each poll
   - ±5% voltage variation
   - Load variations (50%-150% of base)
   - Small noise to simulate real measurements

3. **Calculates derived values**
   - Active Power = V × I × cos(φ) ÷ 1000
   - Reactive Power = P × tan(acos(PF))
   - Apparent Power = √(P² + Q²)

4. **Saves to database** just like real data
   - Same schema and structure
   - Timestamped measurements
   - Available via API

### Data Updates

- **Polling interval**: Every 5 seconds (configurable)
- **Values change** on each poll to simulate real load variations
- **Database grows** just like with real hardware

## 🧪 Testing Scenarios

### Test 1: Dashboard Display

✅ Verify all KPI cards show values
✅ Check voltage is around 230V (L-N) and 400V (L-L)
✅ Confirm power values update every 5 seconds

### Test 2: Historical Charts

1. Click any "Open" button
2. Verify chart displays in modal
3. Check data points appear over time

### Test 3: API Endpoints

```powershell
# Health check
curl http://localhost:3000/api/v1/system/health

# Should show: "mockMode": true

# Get dashboard data
curl http://localhost:3000/api/v1/locations/sala-sport/dashboard

# Get history
curl "http://localhost:3000/api/v1/locations/sala-sport/history/active_power?limit=10"
```

### Test 4: Database Verification

```powershell
psql -U postgres -d energy_management

# Check measurements
SELECT COUNT(*) FROM measurements;

# View latest data
SELECT * FROM measurements ORDER BY captured_at DESC LIMIT 10;

# Check by metric
SELECT metric, phase, value, unit 
FROM latest_measurements 
WHERE location = 'sala-sport'
ORDER BY metric, phase;
```

## 🔍 Verifying Mock Mode is Active

### Backend Logs

Look for this in the backend terminal:

```
🎭 MOCK MODE ENABLED - Using simulated data
✅ Mock data generator ready
⏰ Starting polling every 5 seconds...
🎭 Generating mock data at 2025-10-25T10:00:00.000Z...
✅ Generated 40 mock measurements
```

### API Response

```json
{
  "success": true,
  "status": "healthy",
  "modbus": {
    "connected": true,
    "mockMode": true,  // ← This confirms mock mode
    "host": "192.168.1.100",
    "pollInterval": 5
  }
}
```

### Dashboard Behavior

- Values update every 5 seconds
- Values change slightly each time
- No "Modbus connection error" messages
- All metrics show realistic data

## 🎯 Use Cases

### UI Development

- ✅ Design and test dashboard layouts
- ✅ Verify chart rendering
- ✅ Test responsive design
- ✅ Develop new features

### Integration Testing

- ✅ Test API endpoints
- ✅ Verify database queries
- ✅ Test data persistence
- ✅ Validate frontend-backend communication

### Demonstrations

- ✅ Show the system to stakeholders
- ✅ Demo without hardware setup
- ✅ Present features in meetings
- ✅ Create training materials

### Development

- ✅ Work on new features offline
- ✅ Test without hardware dependencies
- ✅ Debug issues safely
- ✅ Rapid iteration

## 🔄 Switching Between Mock and Real Mode

### From Mock to Real

1. Connect your ECAM hardware to network
2. Find ECAM IP address
3. Edit `backend\.env`:
   ```env
   MOCK_MODE=false
   MODBUS_HOST=192.168.1.xxx  # Your ECAM IP
   ```
4. Restart backend: Stop and run `.\start-backend.ps1`

### From Real to Mock

1. Edit `backend\.env`:
   ```env
   MOCK_MODE=true
   ```
2. Restart backend

**No database changes needed!** The same schema works for both modes.

## 📝 Mock Data Characteristics

### Voltage Ranges

| Measurement | Typical Range | Unit |
|-------------|---------------|------|
| L1-N | 225 - 235 | V |
| L2-N | 225 - 235 | V |
| L3-N | 225 - 235 | V |
| L1-L2 | 395 - 405 | V |
| L2-L3 | 395 - 405 | V |
| L3-L1 | 395 - 405 | V |

### Current Ranges

| Phase | Typical Range | Unit |
|-------|---------------|------|
| L1 | 12 - 38 | A |
| L2 | 11 - 33 | A |
| L3 | 14 - 42 | A |
| N | 0 - 2 | A |

### Power Ranges

| Type | Typical Range | Unit |
|------|---------------|------|
| Active (per phase) | 2 - 8 | kW |
| Active (total) | 10 - 20 | kW |
| Reactive (total) | 2 - 6 | kVAR |
| Apparent (total) | 11 - 21 | kVA |

## ⚙️ Configuration Options

### Poll Interval

Change how often data is generated:

```env
POLL_INTERVAL_SECONDS=5  # Default: every 5 seconds
```

### Database Persistence

All mock data is saved to PostgreSQL, so:
- Historical charts work
- Data accumulates over time
- API history endpoints function normally

### Cleanup Old Data

```sql
-- Clean measurements older than 7 days
SELECT clean_old_measurements(7);
```

## 🐛 Troubleshooting Mock Mode

### Mock data not appearing

**Check backend logs for:**
```
🎭 MOCK MODE ENABLED
```

**If not showing:**
1. Verify `backend\.env` has `MOCK_MODE=true`
2. Restart backend server
3. Check for typos in .env file

### Database errors in mock mode

**Same requirements as real mode:**
- PostgreSQL must be running
- Database must exist
- Schema must be applied

**Fix:**
```powershell
psql -U postgres -c "CREATE DATABASE energy_management;"
psql -U postgres -d energy_management -f backend\schema.sql
```

### Frontend shows "--" instead of values

**Causes:**
1. Backend not running
2. Database connection failed
3. No data polled yet (wait 5-10 seconds)

**Solutions:**
```powershell
# Check backend is running
curl http://localhost:3000/api/v1/system/health

# Check database has data
psql -U postgres -d energy_management -c "SELECT COUNT(*) FROM measurements;"
```

## 📚 Additional Resources

- **Backend Mock Implementation**: `backend/src/mockModbus.js`
- **Configuration**: `backend/.env`
- **Setup Script**: `setup-mock.ps1`
- **Full Documentation**: `README.md`

---

**Enjoy testing your Energy Management System with Mock Mode!** 🎭⚡
