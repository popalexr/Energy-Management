import { Container, Row, Col, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardLayout.css';

function DashboardLayout({ children, location = 'SALA SPORT', onLocationChange, showBackButton = false }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="dashboard-header">
        <Container fluid>
          <Row className="align-items-center">
            <Col xs={12} md={3} className="logo-col">
              <div className="logo-section">
                {showBackButton && (
                  <Button 
                    variant="light" 
                    size="sm" 
                    className="back-button"
                    onClick={handleBackClick}
                  >
                    ← Back
                  </Button>
                )}
                <div className="logo-placeholder">
                  <h4>⚡</h4>
                </div>
                <div className="university-name d-none d-md-block">
                  <strong>TECHNICAL UNIVERSITY</strong>
                  <br />
                  <small>of CLUJ-NAPOCA</small>
                </div>
              </div>
            </Col>
            <Col xs={12} md={6} className="text-center location-col">
              <h2 className="location-title">{location}</h2>
            </Col>
            <Col xs={12} md={3} className="text-end time-col">
              <div className="time-display">
                <div className="date d-none d-md-block">{currentTime.toLocaleDateString('ro-RO')}</div>
                <div className="time">{currentTime.toLocaleTimeString('ro-RO')}</div>
              </div>
            </Col>
          </Row>
        </Container>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        <Container fluid>
          {children}
        </Container>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <Container fluid>
          <Row>
            <Col className="text-center">
              <small>Energy Management System © 2025</small>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
}

export default DashboardLayout;
