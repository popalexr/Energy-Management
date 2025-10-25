# Quick Reference Guide

## 🚀 Quick Start Commands

### First Time Setup

```powershell
# Run automated setup
.\setup.ps1

# Or manual setup:
# 1. Database
psql -U postgres -c "CREATE DATABASE energy_management;"
psql -U postgres -d energy_management -f backend\schema.sql

# 2. Backend
cd backend
npm install
copy .env.example .env
notepad .env  # Configure your settings

# 3. Frontend
cd ..\frontend\energy
npm install
```

### Start Servers

```powershell
# Option 1: Start both servers automatically
.\start-all.ps1

# Option 2: Start individually
.\start-backend.ps1     # Terminal 1
.\start-frontend.ps1    # Terminal 2
```

### Access Points

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Health Check:** http://localhost:3000/api/v1/system/health

---

## 📝 Configuration Checklist

### Backend `.env`

```env
MODBUS_HOST=192.168.1.100    # ← CHANGE THIS to your ECAM IP
MODBUS_PORT=502
MODBUS_UNIT_ID=1
POLL_INTERVAL_SECONDS=5
DB_PASSWORD=postgres         # ← CHANGE if different
```

### Find ECAM IP Address

```powershell
# Method 1: Check router admin panel
# Method 2: Scan network
arp -a

# Method 3: Ping common IPs
ping 192.168.1.100
ping 192.168.1.101
```

---

## 🔧 Common Commands

### Backend

```powershell
cd backend

# Development mode (auto-reload)
npm run dev

# Production mode
npm start

# Install packages
npm install

# Manual poll test
curl -X POST http://localhost:3000/api/v1/system/poll
```

### Frontend

```powershell
cd frontend\energy

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Database

```powershell
# Connect to database
psql -U postgres -d energy_management

# View latest measurements
SELECT * FROM measurements ORDER BY captured_at DESC LIMIT 10;

# View by location
SELECT * FROM latest_measurements WHERE location = 'sala-sport';

# Check locations
SELECT * FROM locations;

# Clean old data (older than 90 days)
SELECT clean_old_measurements(90);
```

---

## 🌐 API Quick Reference

### System Endpoints

```http
GET  /api/v1/system/health
GET  /api/v1/system/status
POST /api/v1/system/poll
```

### Data Endpoints

```http
GET /api/v1/locations
GET /api/v1/locations/:location/latest
GET /api/v1/locations/:location/dashboard
GET /api/v1/locations/:location/history/:metric?from=&to=&limit=
```

### Test Commands

```powershell
# Health check
curl http://localhost:3000/api/v1/system/health

# Get dashboard data
curl http://localhost:3000/api/v1/locations/sala-sport/dashboard

# Get history
curl "http://localhost:3000/api/v1/locations/sala-sport/history/active_power?limit=100"
```

---

## 🐛 Troubleshooting Quick Fixes

### Backend won't start

```powershell
# Check if port is in use
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <PID> /F
```

### Database connection failed

```powershell
# Check PostgreSQL service
Get-Service postgresql*

# Start if stopped
net start postgresql-x64-14

# Verify credentials
psql -U postgres -l
```

### Modbus connection failed

```powershell
# Test network connectivity
ping YOUR_ECAM_IP

# Verify IP in .env
notepad backend\.env

# Check with Modbus tool
# Download ModScan or QModMaster
```

### Frontend shows errors

```powershell
# Clear npm cache
cd frontend\energy
npm cache clean --force
rm -r node_modules
npm install

# Check if backend is running
curl http://localhost:3000/api/v1/system/health
```

---

## 📊 Modbus Registers Quick Reference

| Metric | Register | Type | Unit |
|--------|----------|------|------|
| Voltage L1-N | 404609 | Float32 | V |
| Voltage L2-N | 404611 | Float32 | V |
| Voltage L3-N | 404613 | Float32 | V |
| Current L1 | 404621 | Float32 | A |
| Current L2 | 404623 | Float32 | A |
| Current L3 | 404625 | Float32 | A |
| Active Power Total | 404651 | Float32 | kW |
| Reactive Power Total | 404659 | Float32 | kVAR |
| Apparent Power Total | 404667 | Float32 | kVA |
| Power Factor Total | 404677 | Float32 | - |
| Energy Active Import | 404801 | Float32 | kWh |
| Frequency | 404631 | Float32 | Hz |

> Full mapping in: `backend/src/modbusConfig.js`

---

## 📁 File Locations

### Configuration Files

- `backend/.env` - Backend configuration
- `frontend/energy/.env` - Frontend configuration
- `backend/schema.sql` - Database schema

### Key Source Files

- `backend/src/index.js` - Server entry point
- `backend/src/modbusPoller.js` - Modbus polling logic
- `frontend/energy/src/App.jsx` - React app entry
- `frontend/energy/src/pages/SalaSportPage.jsx` - Main dashboard

### Helper Scripts

- `setup.ps1` - Automated installation
- `start-all.ps1` - Start both servers
- `start-backend.ps1` - Start backend only
- `start-frontend.ps1` - Start frontend only

---

## 🔍 Logs & Debugging

### View Backend Logs

Backend logs appear in the PowerShell window where you ran `npm run dev`

Look for:
- `✅ Modbus TCP connected` - Connection successful
- `🔍 Polling registers...` - Polling active
- `✅ Polled N measurements` - Data collected

### View Frontend Logs

Open browser DevTools (F12) → Console tab

### View Database Activity

```sql
-- Recent measurements
SELECT location, metric, value, unit, captured_at 
FROM measurements 
ORDER BY captured_at DESC 
LIMIT 20;

-- Measurement counts
SELECT location, metric, COUNT(*) 
FROM measurements 
GROUP BY location, metric;
```

---

## 🚀 Production Deployment

### Build Frontend

```powershell
cd frontend\energy
npm run build
# Output: frontend\energy\dist\
```

### Run Backend with PM2

```powershell
npm install -g pm2

cd backend
pm2 start src/index.js --name energy-backend
pm2 startup
pm2 save
```

### Serve Frontend

```powershell
npm install -g serve
cd frontend\energy\dist
serve -s . -p 80
```

---

## 📞 Support

**Documentation:**
- Full guide: `SETUP_GUIDE.md`
- Backend API: `backend/README.md`
- Project overview: `README.md`

**Check Status:**
1. Backend logs in PowerShell
2. Frontend DevTools console (F12)
3. Database: `SELECT * FROM measurements LIMIT 5;`
4. API health: http://localhost:3000/api/v1/system/health

**Common Issues:**
- Port conflicts → Change PORT in .env
- Modbus timeout → Verify ECAM IP
- Database errors → Check PostgreSQL service
- CORS errors → Restart backend
