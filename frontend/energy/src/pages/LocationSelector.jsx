import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './LocationSelector.css';

function LocationSelector() {
  const navigate = useNavigate();

  const locations = [
    {
      id: 'sala-sport',
      name: 'SALA SPORT',
      description: 'Sports Hall',
      icon: '🏃',
      color: '#007bff'
    },
    {
      id: 'corp-a',
      name: 'CORP A',
      description: 'Building A',
      icon: '🏢',
      color: '#28a745'
    },
    {
      id: 'corp-b',
      name: 'CORP B',
      description: 'Building B',
      icon: '🏢',
      color: '#17a2b8'
    },
    {
      id: 'aula-1',
      name: 'AULA 1',
      description: 'Classroom 1',
      icon: '📚',
      color: '#ffc107'
    },
    {
      id: 'aula-2',
      name: 'AULA 2',
      description: 'Classroom 2',
      icon: '📚',
      color: '#fd7e14'
    }
  ];

  const handleLocationClick = (locationId) => {
    navigate(`/location/${locationId}`);
  };

  return (
    <div className="location-selector">
      <Container fluid className="location-container">
        <div className="selector-header">
          <h1>Energy Management System</h1>
          <p className="subtitle">Select a location to view energy monitoring dashboard</p>
        </div>

        <Row className="g-4 location-grid">
          {locations.map((location) => (
            <Col key={location.id} xs={12} sm={6} md={4} lg={4} xl={3}>
              <Card 
                className="location-card"
                onClick={() => handleLocationClick(location.id)}
                style={{ borderColor: location.color }}
              >
                <Card.Body className="text-center">
                  <div className="location-icon" style={{ color: location.color }}>
                    {location.icon}
                  </div>
                  <Card.Title className="location-name">
                    {location.name}
                  </Card.Title>
                  <Card.Text className="location-description">
                    {location.description}
                  </Card.Text>
                  <div className="open-button" style={{ backgroundColor: location.color }}>
                    Open
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Row className="mt-5">
          <Col md={12}>
            <Card className="info-card">
              <Card.Body>
                <Row>
                  <Col md={3} className="text-center consumption-box">
                    <h6>Total Consumption</h6>
                    <div className="consumption-value">15,897.67 kWh</div>
                  </Col>
                  <Col md={3} className="text-center consumption-box">
                    <h6>Active Locations</h6>
                    <div className="consumption-value">5</div>
                  </Col>
                  <Col md={3} className="text-center consumption-box">
                    <h6>Temperature</h6>
                    <div className="consumption-value">33.5 °C</div>
                  </Col>
                  <Col md={3} className="text-center consumption-box">
                    <h6>Humidity</h6>
                    <div className="consumption-value">42.08 %</div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default LocationSelector;
