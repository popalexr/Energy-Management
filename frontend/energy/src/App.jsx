import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LocationSelector from './pages/LocationSelector';
import LocationPage from './pages/LocationPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LocationSelector />} />
        <Route path="/location/:locationId" element={<LocationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
