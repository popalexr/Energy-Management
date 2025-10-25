# Complete Setup Guide

## Step-by-Step Installation Instructions

### Part 1: Database Setup (PostgreSQL)

#### 1.1 Install PostgreSQL

If you don't have PostgreSQL installed:

```powershell
# Download installer from:
# https://www.postgresql.org/download/windows/

# Or use Chocolatey:
choco install postgresql

# Or use Scoop:
scoop install postgresql
```

#### 1.2 Create Database

```powershell
# Open PowerShell as Administrator

# Start PostgreSQL service (if not running)
net start postgresql-x64-14  # Adjust version if needed

# Connect to PostgreSQL
psql -U postgres

# In psql prompt:
CREATE DATABASE energy_management;

# Verify database was created
\l

# Exit psql
\q
```

#### 1.3 Initialize Schema

```powershell
# Navigate to backend directory
cd c:\Energy-Management\Energy-Management\backend

# Run schema file
psql -U postgres -d energy_management -f schema.sql

# Verify tables were created
psql -U postgres -d energy_management -c "\dt"
```

You should see: `measurements`, `locations`

---

### Part 2: Backend Setup (Node.js Server)

#### 2.1 Install Dependencies

```powershell
cd c:\Energy-Management\Energy-Management\backend

# Install all npm packages
npm install
```

This installs:
- `express` - Web server framework
- `pg` - PostgreSQL client
- `jsmodbus` - Modbus TCP client
- `node-schedule` - Job scheduler
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables

#### 2.2 Configure Environment

```powershell
# Create .env file from example
copy .env.example .env

# Open .env in notepad
notepad .env
```

**Edit these values in `.env`:**

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# IMPORTANT: Update with YOUR ECAM IP address
MODBUS_HOST=192.168.1.100  # ← Change this!
MODBUS_PORT=502
MODBUS_UNIT_ID=1
POLL_INTERVAL_SECONDS=5

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=energy_management
DB_USER=postgres
DB_PASSWORD=postgres  # ← Change if you set a different password
```

#### 2.3 Test Backend

```powershell
# Start development server
npm run dev
```

You should see:

```
═══════════════════════════════════════════════════════
  ⚡ Energy Management Backend
═══════════════════════════════════════════════════════
  🚀 Server running on http://localhost:3000
  📊 Environment: development
═══════════════════════════════════════════════════════
📡 Connecting to Modbus TCP at 192.168.1.100:502...
```

**If Modbus connects successfully:**
```
✅ Modbus TCP connected successfully
⏰ Starting polling every 5 seconds...
🔍 Polling registers...
✅ Polled 40 measurements
```

**If Modbus fails to connect:**
```
❌ Modbus connection error: ECONNREFUSED
```
This is normal if you don't have the ECAM connected yet. The backend will keep trying to reconnect.

#### 2.4 Test API (Optional)

Open a new PowerShell window:

```powershell
# Test health endpoint
curl http://localhost:3000/api/v1/system/health

# Test locations
curl http://localhost:3000/api/v1/locations

# Test dashboard (will be empty if no Modbus data)
curl http://localhost:3000/api/v1/locations/sala-sport/dashboard
```

---

### Part 3: Frontend Setup (React App)

#### 3.1 Install Dependencies

Open a **new PowerShell window**:

```powershell
cd c:\Energy-Management\Energy-Management\frontend\energy

# Install all npm packages
npm install
```

This installs:
- `react` - UI library
- `react-dom` - React DOM renderer
- `bootstrap` - CSS framework
- `react-bootstrap` - Bootstrap components for React
- `recharts` - Charting library
- `axios` - HTTP client
- `react-router-dom` - Routing (for future use)

#### 3.2 Configure Environment

The `.env` file is already created with default settings:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_POLL_INTERVAL=5000
```

No changes needed unless your backend is on a different port.

#### 3.3 Start Development Server

```powershell
npm run dev
```

You should see:

```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

#### 3.4 Open in Browser

1. Open your web browser
2. Navigate to: **http://localhost:5173**
3. You should see the Energy Management dashboard!

---

### Part 4: Verifying Everything Works

#### 4.1 Check Backend is Running

In the backend PowerShell window, you should see:

```
✅ Polled 40 measurements
```

Every 5 seconds (or your configured interval).

#### 4.2 Check Frontend is Displaying Data

In your browser at http://localhost:5173:

- You should see the dashboard header with "SALA SPORT"
- KPI cards showing voltage, current, power measurements
- If Modbus is connected, you'll see real values
- If Modbus is NOT connected, cards will show "--"

#### 4.3 Test Real-Time Updates

1. Watch the dashboard for 10 seconds
2. Values should update automatically every 5 seconds
3. Check the browser console (F12) - no errors should appear

---

### Part 5: Finding Your ECAM IP Address

#### Method 1: Router Admin Panel

1. Login to your router (usually http://192.168.1.1 or http://192.168.0.1)
2. Look for "DHCP Clients" or "Connected Devices"
3. Find device named "ECAM" or similar
4. Note the IP address

#### Method 2: Network Scan

```powershell
# List all devices on network
arp -a

# Look for IP addresses in your subnet
# Try pinging each one to find the ECAM
ping 192.168.1.100
ping 192.168.1.101
# etc.
```

#### Method 3: Eaton Configuration Software

1. Use Eaton's smartWire-DT Configurator or similar tool
2. Scan for devices on the network
3. The tool will display the ECAM's IP address

#### Update Backend Configuration

Once you find the IP:

```powershell
# Stop backend (Ctrl+C)
# Edit .env
notepad backend\.env

# Change:
MODBUS_HOST=YOUR_ACTUAL_IP_HERE

# Restart backend
npm run dev
```

---

### Part 6: Testing Modbus Connection

#### Using ModScan (Windows Tool)

1. Download ModScan from: https://www.modscan.com/download.html
2. Install and open
3. Configure:
   - Connection: Modbus TCP/IP
   - IP Address: Your ECAM IP
   - Port: 502
   - Modbus Address: 1
4. Try reading:
   - Function: 03 (Read Holding Registers)
   - Address: 404608 (subtract 400001 = register 4608)
   - Length: 2
5. If successful, you should see two 16-bit values

#### Using QModMaster (Free, Open Source)

1. Download from: https://sourceforge.net/projects/qmodmaster/
2. Configure TCP connection
3. Test reading registers

---

## Troubleshooting Common Issues

### Issue 1: npm install fails

**Error:**
```
npm ERR! code ENOENT
```

**Solution:**
```powershell
# Make sure you're in the correct directory
cd backend  # or frontend\energy

# Try clearing npm cache
npm cache clean --force

# Try again
npm install
```

### Issue 2: PostgreSQL connection refused

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**
```powershell
# Check if PostgreSQL is running
Get-Service postgresql*

# If not running, start it
net start postgresql-x64-14

# Check if database exists
psql -U postgres -l

# Verify credentials in .env match your PostgreSQL setup
```

### Issue 3: Port already in use

**Error:**
```
Error: listen EADDRINUSE :::3000
```

**Solution:**
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=3001
```

### Issue 4: Modbus timeout

**Error:**
```
❌ Modbus connection error: ETIMEDOUT
```

**Solutions:**
1. Verify ECAM IP is correct
2. Check network connectivity: `ping YOUR_ECAM_IP`
3. Ensure ECAM is powered on
4. Check firewall settings
5. Verify Modbus TCP is enabled on ECAM

### Issue 5: Frontend shows CORS errors

**Error in browser console:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
Backend already has CORS enabled. Check:
1. Backend is running on port 3000
2. Frontend .env has correct API URL
3. Clear browser cache
4. Try incognito mode

---

## Production Deployment Notes

### Build Frontend for Production

```powershell
cd frontend\energy

# Create production build
npm run build

# Output will be in: frontend\energy\dist\
```

### Run Backend in Production Mode

```powershell
cd backend

# Set environment
$env:NODE_ENV="production"

# Run with node (not nodemon)
node src/index.js
```

### Use PM2 for Process Management

```powershell
# Install PM2 globally
npm install -g pm2

# Start backend
cd backend
pm2 start src/index.js --name energy-backend

# Monitor
pm2 status
pm2 logs energy-backend

# Set to start on system boot
pm2 startup
pm2 save
```

---

## Next Steps

1. ✅ Verify all 3 components are running:
   - PostgreSQL database
   - Backend server (port 3000)
   - Frontend dev server (port 5173)

2. ✅ Configure ECAM IP address in backend/.env

3. ✅ Test Modbus connection

4. ✅ Watch dashboard update in real-time

5. 🎉 You're ready to use the Energy Management System!

---

## Support & Documentation

- Backend API docs: http://localhost:3000/
- Frontend: http://localhost:5173/
- Modbus register map: `backend/src/modbusConfig.js`
- Database schema: `backend/schema.sql`

For issues, check:
1. Backend logs in PowerShell
2. Frontend logs in browser console (F12)
3. PostgreSQL logs
4. Modbus connection status
