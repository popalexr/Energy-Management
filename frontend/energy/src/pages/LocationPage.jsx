import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import SalaSportPage from './SalaSportPage';

function LocationPage() {
  const { locationId } = useParams();
  
  // Map location IDs to display names
  const locationNames = {
    'sala-sport': 'SALA SPORT',
    'corp-a': 'CORP A',
    'corp-b': 'CORP B',
    'aula-1': 'AULA 1',
    'aula-2': 'AULA 2'
  };
  
  const displayName = locationNames[locationId] || locationId.toUpperCase();

  return (
    <DashboardLayout location={displayName} showBackButton={true}>
      <SalaSportPage />
    </DashboardLayout>
  );
}

export default LocationPage;
