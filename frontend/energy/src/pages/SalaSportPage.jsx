import { Row, Col, Button, Modal } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import KpiCard from '../components/KpiCard';
import ChartPanel from '../components/ChartPanel';
import MeasurementTable from '../components/MeasurementTable';
import { locationAPI, pxr10API } from '../services/api';
import './SalaSportPage.css';

function SalaSportPage() {
  const { locationId } = useParams();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', data: [] });
  const [pxrStatus, setPxrStatus] = useState(null);
  const [pxrSnapshot, setPxrSnapshot] = useState(null);

  const LOCATION = locationId || 'sala-sport';

  // Fetch dashboard data
  const fetchData = async () => {
    try {
      const response = await locationAPI.getDashboard(LOCATION);
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Fetch PXR10 status and one-shot snapshot
    const fetchPxr = async () => {
      try {
        const status = await pxr10API.getStatus();
        setPxrStatus(status);
        const snap = await pxr10API.getAllRegisters();
        setPxrSnapshot(snap.data);
      } catch (e) {
        // non-fatal for UI; keep page working from DB
        console.warn('PXR10 not reachable or disabled:', e?.message || e);
      }
    };
    fetchPxr();

    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchData();
      // light-weight: only refresh status; snapshot on demand via button
      pxr10API.getStatus().then(setPxrStatus).catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, [locationId]);

  // Handle card click to show details
  const handleCardClick = async (metric, title) => {
    try {
      const to = new Date();
      const from = new Date(to.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
      
      const response = await locationAPI.getHistory(LOCATION, metric, {
        from: from.toISOString(),
        to: to.toISOString(),
        limit: 100
      });

      setModalContent({ title, data: response.data });
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  const {
    voltage = {},
    current = {},
    activePower = {},
    energy = {},
  } = dashboardData || {};

  return (
    <div className="sala-sport-page">
      {/* Main Dashboard Grid */}
      <Row>
        {/* Left Column - Measurements */}
        <Col lg={8}>
          {/* Voltage Section */}
          <div className="section-header">
            <h4>Tensiune Faze (Voltage)</h4>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => handleCardClick('voltage', 'Voltage History')}
            >
              Open
            </Button>
          </div>
          <Row>
            <Col md={4}>
              <KpiCard 
                title="L1-N" 
                value={voltage?.['L1-N']?.value} 
                unit="V" 
                variant="primary"
              />
            </Col>
            <Col md={4}>
              <KpiCard 
                title="L2-N" 
                value={voltage?.['L2-N']?.value} 
                unit="V" 
                variant="primary"
              />
            </Col>
            <Col md={4}>
              <KpiCard 
                title="L3-N" 
                value={voltage?.['L3-N']?.value} 
                unit="V" 
                variant="primary"
              />
            </Col>
          </Row>

          {/* Current Section */}
          <div className="section-header mt-4">
            <h4>Curent Faze (Current)</h4>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => handleCardClick('current', 'Current History')}
            >
              Open
            </Button>
          </div>
          <Row>
            <Col md={4}>
              <KpiCard 
                title="L1" 
                value={current?.L1?.value} 
                unit="A" 
                variant="info"
              />
            </Col>
            <Col md={4}>
              <KpiCard 
                title="L2" 
                value={current?.L2?.value} 
                unit="A" 
                variant="info"
              />
            </Col>
            <Col md={4}>
              <KpiCard 
                title="L3" 
                value={current?.L3?.value} 
                unit="A" 
                variant="info"
              />
            </Col>
          </Row>

          {/* Active Power (Total only) */}
          <div className="section-header mt-4">
            <h4>Putere Activa Total</h4>
            <Button 
              variant="outline-success" 
              size="sm"
              onClick={() => handleCardClick('active_power', 'Active Power History')}
            >
              Open
            </Button>
          </div>
          <Row>
            <Col md={4}>
              <KpiCard 
                title="Total" 
                value={activePower?.total?.value} 
                unit="kW" 
                variant="success"
              />
            </Col>
          </Row>

          {/* Energy Section */}
          <div className="section-header mt-4">
            <h4>Energie Activa (Import)</h4>
            <Button 
              variant="outline-success" 
              size="sm"
              onClick={() => handleCardClick('energy_active', 'Energy History')}
            >
              Open
            </Button>
          </div>
          <Row>
            <Col md={6}>
              <KpiCard 
                title="Import" 
                value={energy?.energy_active_import?.value} 
                unit="kWh" 
                variant="success"
              />
            </Col>
          </Row>
        </Col>

        {/* Right Column - Summary & Tables */}
        <Col lg={4}>
          <div className="side-panel">
            <h4 className="panel-title">VALORI MARIMI ELECTRICE MASURATE</h4>
            
            <MeasurementTable
              title="Voltage (V)"
              headers={['Phase', 'L1-N', 'L2-N', 'L3-N', 'Unit']}
              data={[
                {
                  phase: 'Voltage',
                  l1: voltage?.['L1-N']?.value || 0,
                  l2: voltage?.['L2-N']?.value || 0,
                  l3: voltage?.['L3-N']?.value || 0,
                  unit: 'V'
                }
              ]}
            />

            <MeasurementTable
              title="Current (A)"
              headers={['Phase', 'L1', 'L2', 'L3', 'Unit']}
              data={[
                {
                  phase: 'Current',
                  l1: current?.L1?.value || 0,
                  l2: current?.L2?.value || 0,
                  l3: current?.L3?.value || 0,
                  unit: 'A'
                }
              ]}
            />

            <div className="consumption-summary">
              <h5>Energy Consumption</h5>
              <div className="consumption-item">
                <span className="consumption-label">Sala Sport:</span>
                <span className="consumption-value">
                  {energy?.energy_active_import?.value?.toFixed(2) || 0} kWh
                </span>
              </div>
              <div className="consumption-item">
                <span className="consumption-label">Active Power Total:</span>
                <span className="consumption-value">
                  {activePower?.total?.value?.toFixed?.(3) ?? '—'} kW
                </span>
              </div>
            </div>

            {/* Live PXR10 Snapshot */}
            <div className="consumption-summary mt-3">
              <h5>PXR10 Live</h5>
              <div className="consumption-item">
                <span className="consumption-label">Status:</span>
                <span className="consumption-value">
                  {pxrStatus ? `${pxrStatus.connected ? 'Connected' : 'Disconnected'} (${pxrStatus.mode})` : '—'}
                </span>
              </div>
              <div className="d-flex gap-2 mb-2">
                <Button size="sm" variant="outline-secondary" onClick={async () => {
                  try {
                    const snap = await pxr10API.getAllRegisters();
                    setPxrSnapshot(snap.data);
                  } catch (e) {
                    console.error('Snapshot failed', e);
                  }
                }}>Refresh Snapshot</Button>
              </div>
              {pxrSnapshot && (
                <div className="small">
                  <div className="consumption-item">
                    <span className="consumption-label">U L1-N:</span>
                    <span className="consumption-value">{pxrSnapshot.VOLTAGE_L1N?.value ?? '—'} V</span>
                  </div>
                  <div className="consumption-item">
                    <span className="consumption-label">U L2-N:</span>
                    <span className="consumption-value">{pxrSnapshot.VOLTAGE_L2N?.value ?? '—'} V</span>
                  </div>
                  <div className="consumption-item">
                    <span className="consumption-label">U L3-N:</span>
                    <span className="consumption-value">{pxrSnapshot.VOLTAGE_L3N?.value ?? '—'} V</span>
                  </div>
                  <div className="consumption-item">
                    <span className="consumption-label">I L1:</span>
                    <span className="consumption-value">{pxrSnapshot.CURRENT_L1?.value ?? '—'} A</span>
                  </div>
                  <div className="consumption-item">
                    <span className="consumption-label">I L2:</span>
                    <span className="consumption-value">{pxrSnapshot.CURRENT_L2?.value ?? '—'} A</span>
                  </div>
                  <div className="consumption-item">
                    <span className="consumption-label">I L3:</span>
                    <span className="consumption-value">{pxrSnapshot.CURRENT_L3?.value ?? '—'} A</span>
                  </div>
                  <div className="consumption-item">
                    <span className="consumption-label">P Total:</span>
                    <span className="consumption-value">{pxrSnapshot.ACTIVE_POWER_TOTAL?.value ?? '—'} kW</span>
                  </div>
                  <div className="consumption-item">
                    <span className="consumption-label">Energy Import:</span>
                    <span className="consumption-value">{pxrSnapshot.ENERGY_ACTIVE_IMPORT?.value ?? '—'} kWh</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Modal for History Charts */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modalContent.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ChartPanel
            title={modalContent.title}
            data={modalContent.data}
            dataKey="value"
            xAxisKey="timestamp"
            type="area"
            color="#007bff"
          />
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default SalaSportPage;
