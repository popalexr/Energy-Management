import { Card } from 'react-bootstrap';
import './KpiCard.css';

function KpiCard({ title, value, unit, phase, variant = 'primary', onClick }) {
  const displayValue = typeof value === 'number' ? value.toFixed(2) : '--';
  
  return (
    <Card 
      className={`kpi-card kpi-card-${variant} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <Card.Body>
        <Card.Title className="kpi-title">{title}</Card.Title>
        {phase && <Card.Subtitle className="kpi-phase mb-2">{phase}</Card.Subtitle>}
        <div className="kpi-value-container">
          <span className="kpi-value">{displayValue}</span>
          {unit && <span className="kpi-unit">{unit}</span>}
        </div>
      </Card.Body>
    </Card>
  );
}

export default KpiCard;
