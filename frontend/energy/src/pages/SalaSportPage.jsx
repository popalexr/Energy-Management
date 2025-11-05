import { Row, Col, Button, Modal } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import KpiCard from '../components/KpiCard';
import ChartPanel from '../components/ChartPanel';
import MeasurementTable from '../components/MeasurementTable';
import { locationAPI, pxr10API } from '../services/api';
import './SalaSportPage.css';

function SalaSportPage() {
  const { locationId } = useParams();
  const navigate = useNavigate();
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

  const { voltage, current, activePower, reactivePower, apparentPower, powerFactor, energy, frequency } = dashboardData || {};

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

          <Row className="mt-2">
            <Col md={4}>
              <KpiCard 
                title="L1-L2" 
                value={voltage?.['L1-L2']?.value} 
                unit="V" 
                variant="info"
              />
            </Col>
            <Col md={4}>
              <KpiCard 
                title="L2-L3" 
                value={voltage?.['L2-L3']?.value} 
                unit="V" 
                variant="info"
              />
            </Col>
            <Col md={4}>
              <KpiCard 
                title="L3-L1" 
                value={voltage?.['L3-L1']?.value} 
                unit="V" 
                variant="info"
              />
            </Col>
          </Row>

          {/* Power Section */}
          <div className="section-header mt-4">
            <h4>Putere Activa (Active Power)</h4>
            <Button 
              variant="outline-success" 
              size="sm"
              onClick={() => handleCardClick('active_power', 'Active Power History')}
            >
              Open
            </Button>
          </div>
          <Row>
            <Col md={3}>
              <KpiCard 
                title="L1" 
                value={activePower?.L1?.value} 
                unit="kW" 
                variant="success"
              />
            </Col>
            <Col md={3}>
              <KpiCard 
                title="L2" 
                value={activePower?.L2?.value} 
                unit="kW" 
                variant="success"
              />
            </Col>
            <Col md={3}>
              <KpiCard 
                title="L3" 
                value={activePower?.L3?.value} 
                unit="kW" 
                variant="success"
              />
            </Col>
            <Col md={3}>
              <KpiCard 
                title="Total" 
                value={activePower?.total?.value} 
                unit="kW" 
                variant="success"
              />
            </Col>
          </Row>

          {/* Reactive Power */}
          <div className="section-header mt-4">
            <h4>Putere Reactiva (Reactive Power)</h4>
            <Button 
              variant="outline-warning" 
              size="sm"
              onClick={() => handleCardClick('reactive_power', 'Reactive Power History')}
            >
              Open
            </Button>
          </div>
          <Row>
            <Col md={3}>
              <KpiCard 
                title="L1" 
                value={reactivePower?.L1?.value} 
                unit="kVAR" 
                variant="warning"
              />
            </Col>
            <Col md={3}>
              <KpiCard 
                title="L2" 
                value={reactivePower?.L2?.value} 
                unit="kVAR" 
                variant="warning"
              />
            </Col>
            <Col md={3}>
              <KpiCard 
                title="L3" 
                value={reactivePower?.L3?.value} 
                unit="kVAR" 
                variant="warning"
              />
            </Col>
            <Col md={3}>
              <KpiCard 
                title="Total" 
                value={reactivePower?.total?.value} 
                unit="kVAR" 
                variant="warning"
              />
            </Col>
          </Row>

          {/* Apparent Power */}
          <div className="section-header mt-4">
            <h4>Putere Aparenta (Apparent Power)</h4>
            <Button 
              variant="outline-info" 
              size="sm"
              onClick={() => handleCardClick('apparent_power', 'Apparent Power History')}
            >
              Open
            </Button>
          </div>
          <Row>
            <Col md={3}>
              <KpiCard 
                title="L1" 
                value={apparentPower?.L1?.value} 
                unit="kVA" 
                variant="info"
              />
            </Col>
            <Col md={3}>
              <KpiCard 
                title="L2" 
                value={apparentPower?.L2?.value} 
                unit="kVA" 
                variant="info"
              />
            </Col>
            <Col md={3}>
              <KpiCard 
                title="L3" 
                value={apparentPower?.L3?.value} 
                unit="kVA" 
                variant="info"
              />
            </Col>
            <Col md={3}>
              <KpiCard 
                title="Total" 
                value={apparentPower?.total?.value} 
                unit="kVA" 
                variant="info"
              />
            </Col>
          </Row>

          {/* Energy Section */}
          <div className="section-header mt-4">
            <h4>Energie Activa (Active Energy)</h4>
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
            <Col md={6}>
              <KpiCard 
                title="Export" 
                value={energy?.energy_active_export?.value} 
                unit="kWh" 
                variant="success"
              />
            </Col>
          </Row>

          {/* Power Factor */}
          <div className="section-header mt-4">
            <h4>cos φ (Power Factor)</h4>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => handleCardClick('power_factor', 'Power Factor History')}
            >
              Open
            </Button>
          </div>
          <Row>
            <Col md={3}>
              <KpiCard 
                title="L1" 
                value={powerFactor?.L1?.value} 
                variant="primary"
              />
            </Col>
            <Col md={3}>
              <KpiCard 
                title="L2" 
                value={powerFactor?.L2?.value} 
                variant="primary"
              />
            </Col>
            <Col md={3}>
              <KpiCard 
                title="L3" 
                value={powerFactor?.L3?.value} 
                variant="primary"
              />
            </Col>
            <Col md={3}>
              <KpiCard 
                title="Total" 
                value={powerFactor?.total?.value} 
                variant="primary"
              />
            </Col>
          </Row>
        </Col>

        {/* Right Column - Summary & Tables */}
        <Col lg={4}>
          <div className="side-panel">
            <h4 className="panel-title">VALORI MARIMI ELECTRICE MASURATE</h4>
            
            <MeasurementTable
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
              headers={['Phase', 'L1-L2', 'L2-L3', 'L3-N', 'Unit']}
              data={[
                {
                  phase: 'Voltage',
                  l1l2: voltage?.['L1-L2']?.value || 0,
                  l2l3: voltage?.['L2-L3']?.value || 0,
                  l3n: voltage?.['L3-L1']?.value || 0,
                  unit: 'V'
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
              {frequency && (
                <div className="consumption-item">
                  <span className="consumption-label">Frequency:</span>
                  <span className="consumption-value">
                    {frequency.value?.toFixed(2)} Hz
                  </span>
                </div>
              )}
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
                    <span className="consumption-label">I L1:</span>
                    <span className="consumption-value">{pxrSnapshot.CURRENT_L1?.value ?? '—'} A</span>
                  </div>
                  <div className="consumption-item">
                    <span className="consumption-label">P Total:</span>
                    <span className="consumption-value">{pxrSnapshot.ACTIVE_POWER_TOTAL?.value ?? '—'} kW</span>
                  </div>
                  <div className="consumption-item">
                    <span className="consumption-label">cos φ Total:</span>
                    <span className="consumption-value">{pxrSnapshot.POWER_FACTOR_TOTAL?.value ?? '—'}</span>
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
