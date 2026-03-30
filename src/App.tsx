import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import DashboardPage from './pages/DashboardPage';
import PatientOverviewPage from './pages/PatientOverviewPage';
import PatientJourneyPage from './pages/PatientJourneyPage';
import ProtocolListPage from './pages/ProtocolListPage';
import ProtocolDetailPage from './pages/ProtocolDetailPage';

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/patients/:patientId" element={<PatientOverviewPage />} />
          <Route path="/patients/:patientId/protocols/:protocolInstanceId" element={<PatientJourneyPage />} />
          <Route path="/protocols" element={<ProtocolListPage />} />
          <Route path="/protocols/:protocolId" element={<ProtocolDetailPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
