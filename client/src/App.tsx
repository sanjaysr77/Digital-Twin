import { Routes, Route, Navigate } from 'react-router-dom';
import ReportPage from './ReportPage';
import LoginPage from './LoginPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reports/:patientId" element={<ReportPage />} />
        <Route path="/reports" element={<ReportPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
