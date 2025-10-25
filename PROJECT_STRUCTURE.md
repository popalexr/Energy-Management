# Project Files Overview

## Complete File Structure

```
Energy-Management/
│
├── README.md                     # Main project documentation
├── SETUP_GUIDE.md               # Detailed setup instructions
├── QUICK_REFERENCE.md           # Quick command reference
│
├── setup.ps1                    # Automated installation script
├── start-all.ps1                # Start both servers
├── start-backend.ps1            # Start backend only
├── start-frontend.ps1           # Start frontend only
│
├── backend/                     # Node.js Backend Server
│   ├── README.md               # Backend documentation
│   ├── package.json            # Dependencies & scripts
│   ├── schema.sql              # PostgreSQL database schema
│   ├── .env.example            # Environment template
│   ├── .env                    # Configuration (create from .env.example)
│   ├── .gitignore             # Git ignore rules
│   │
│   └── src/                    # Source code
│       ├── index.js            # Main Express server
│       ├── database.js         # PostgreSQL queries
│       ├── modbusPoller.js     # Modbus TCP client
│       ├── modbusConfig.js     # Register mapping
│       │
│       └── routes/             # API endpoints
│           ├── locations.js    # Location data endpoints
│           └── system.js       # System/health endpoints
│
└── frontend/                    # React Frontend
    └── energy/                  # Vite + React app
        ├── package.json        # Dependencies & scripts
        ├── vite.config.js      # Vite configuration
        ├── index.html          # HTML entry point
        ├── .env                # Environment variables
        ├── .gitignore         # Git ignore rules
        │
        ├── public/             # Static assets
        │
        └── src/                # React source code
            ├── main.jsx        # React entry point
            ├── App.jsx         # Main app component
            ├── App.css         # Global styles
            ├── index.css       # Base styles
            │
            ├── components/     # Reusable components
            │   ├── DashboardLayout.jsx
            │   ├── DashboardLayout.css
            │   ├── KpiCard.jsx
            │   ├── KpiCard.css
            │   ├── ChartPanel.jsx
            │   ├── ChartPanel.css
            │   ├── MeasurementTable.jsx
            │   └── MeasurementTable.css
            │
            ├── pages/          # Page components
            │   ├── SalaSportPage.jsx
            │   └── SalaSportPage.css
            │
            └── services/       # API services
                └── api.js      # Axios HTTP client
```

---

## File Descriptions

### Root Directory

| File | Purpose |
|------|---------|
| `README.md` | Main project overview and quick start |
| `SETUP_GUIDE.md` | Step-by-step installation guide |
| `QUICK_REFERENCE.md` | Command reference and troubleshooting |
| `setup.ps1` | Automated PowerShell installation script |
| `start-all.ps1` | Start both backend and frontend |
| `start-backend.ps1` | Start backend server only |
| `start-frontend.ps1` | Start frontend dev server only |

### Backend Files

| File | Purpose |
|------|---------|
| `backend/package.json` | npm dependencies and scripts |
| `backend/schema.sql` | PostgreSQL database schema |
| `backend/.env.example` | Environment variable template |
| `backend/.gitignore` | Git ignore rules |
| `backend/README.md` | Backend API documentation |

#### Backend Source Code

| File | Purpose |
|------|---------|
| `src/index.js` | Express server setup and routing |
| `src/database.js` | PostgreSQL connection and queries |
| `src/modbusPoller.js` | Modbus TCP client and polling logic |
| `src/modbusConfig.js` | PXR25 register definitions |
| `src/routes/locations.js` | Location data API endpoints |
| `src/routes/system.js` | System health API endpoints |

### Frontend Files

| File | Purpose |
|------|---------|
| `frontend/energy/package.json` | npm dependencies and scripts |
| `frontend/energy/vite.config.js` | Vite build configuration |
| `frontend/energy/index.html` | HTML entry point |
| `frontend/energy/.env` | Environment variables |

#### Frontend Source Code

| File | Purpose |
|------|---------|
| `src/main.jsx` | React application entry point |
| `src/App.jsx` | Root React component |
| `src/services/api.js` | Axios API client configuration |

#### React Components

| Component | Purpose |
|-----------|---------|
| `DashboardLayout` | Page layout with header and footer |
| `KpiCard` | Metric display card (voltage, power, etc.) |
| `ChartPanel` | Chart visualization with Recharts |
| `MeasurementTable` | Data table display |

#### React Pages

| Page | Purpose |
|------|---------|
| `SalaSportPage` | Main dashboard for SALA SPORT location |

---

## Dependencies

### Backend (Node.js)

```json
{
  "express": "^4.18.2",        // Web framework
  "cors": "^2.8.5",            // CORS middleware
  "dotenv": "^16.3.1",         // Environment variables
  "pg": "^8.11.3",             // PostgreSQL client
  "jsmodbus": "^4.0.6",        // Modbus TCP library
  "node-schedule": "^2.1.1"    // Job scheduler
}
```

### Frontend (React)

```json
{
  "react": "^19.1.1",          // React library
  "react-dom": "^19.1.1",      // React DOM renderer
  "bootstrap": "^5.3.2",       // CSS framework
  "react-bootstrap": "^2.9.1", // Bootstrap components
  "recharts": "^2.10.3",       // Charting library
  "axios": "^1.6.2",           // HTTP client
  "react-router-dom": "^6.20.0" // Routing (future use)
}
```

---

## Configuration Files

### Backend `.env`

```env
# Server
PORT=3000
NODE_ENV=development

# Modbus
MODBUS_HOST=192.168.1.100
MODBUS_PORT=502
MODBUS_UNIT_ID=1
POLL_INTERVAL_SECONDS=5

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=energy_management
DB_USER=postgres
DB_PASSWORD=postgres
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_POLL_INTERVAL=5000
```

---

## Database Schema

### Tables

**measurements**
- Stores all time-series measurement data
- Indexed by location, metric, and timestamp

**locations**
- Stores location configurations
- Maps to Modbus devices

**View: latest_measurements**
- Pre-computed view of most recent data per metric

---

## Key Features Implemented

### Backend
- ✅ Modbus TCP client with auto-reconnect
- ✅ Scheduled polling (configurable interval)
- ✅ PostgreSQL persistence
- ✅ RESTful API with CORS
- ✅ Health monitoring endpoints
- ✅ Error handling and logging

### Frontend
- ✅ Real-time dashboard
- ✅ KPI cards for all metrics
- ✅ Historical charts (modal view)
- ✅ Bootstrap responsive design
- ✅ Auto-refresh every 5 seconds
- ✅ Voltage, current, power, energy displays

---

## Metrics Monitored

1. **Voltage** (V)
   - Phase-to-Neutral: L1-N, L2-N, L3-N
   - Phase-to-Phase: L1-L2, L2-L3, L3-L1

2. **Current** (A)
   - Per phase: L1, L2, L3, Neutral

3. **Active Power** (kW)
   - Per phase + Total

4. **Reactive Power** (kVAR)
   - Per phase + Total

5. **Apparent Power** (kVA)
   - Per phase + Total

6. **Power Factor** (cos φ)
   - Per phase + Total

7. **Energy** (kWh, kVARh, kVAh)
   - Import/Export tracking

8. **Frequency** (Hz)

---

## Scripts Available

### Backend

```powershell
npm run dev    # Development mode with nodemon
npm start      # Production mode
```

### Frontend

```powershell
npm run dev      # Development server (port 5173)
npm run build    # Production build
npm run preview  # Preview production build
```

---

## Next Development Steps

### Potential Enhancements

1. **Authentication**
   - Add JWT authentication
   - User roles and permissions

2. **Multiple Locations**
   - Multi-location dashboard
   - Location comparison views

3. **Alerts & Notifications**
   - Threshold-based alerts
   - Email notifications
   - SMS integration

4. **Advanced Analytics**
   - Daily/monthly reports
   - Energy consumption trends
   - Cost calculations

5. **Data Export**
   - CSV export
   - PDF reports
   - Excel integration

6. **Real-time Updates**
   - WebSocket implementation
   - Push notifications

7. **Mobile Support**
   - Progressive Web App (PWA)
   - React Native mobile app

---

## Testing

### Manual Testing

```powershell
# Backend health
curl http://localhost:3000/api/v1/system/health

# Trigger poll
curl -X POST http://localhost:3000/api/v1/system/poll

# Get dashboard
curl http://localhost:3000/api/v1/locations/sala-sport/dashboard
```

### Database Testing

```sql
-- Check data
SELECT * FROM measurements ORDER BY captured_at DESC LIMIT 10;

-- Check locations
SELECT * FROM locations;

-- Latest by metric
SELECT * FROM latest_measurements WHERE location = 'sala-sport';
```

---

## Deployment Checklist

- [ ] Configure production database
- [ ] Set NODE_ENV=production
- [ ] Build frontend: `npm run build`
- [ ] Configure reverse proxy (nginx)
- [ ] Set up SSL/HTTPS
- [ ] Configure PM2 for process management
- [ ] Set up monitoring (logs, uptime)
- [ ] Configure backups
- [ ] Set up firewall rules
- [ ] Test all endpoints

---

## Support & Documentation

- **Main README:** Project overview
- **SETUP_GUIDE:** Detailed installation
- **QUICK_REFERENCE:** Command cheat sheet
- **Backend README:** API documentation

For issues, check:
1. Backend PowerShell logs
2. Frontend browser console (F12)
3. Database: `SELECT * FROM measurements LIMIT 5;`
4. Health endpoint: http://localhost:3000/api/v1/system/health
