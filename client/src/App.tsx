import { Routes, Route, Navigate } from 'react-router-dom';
import ReportPage from './ReportPage';
import LoginPage from './LoginPage';
import { ToastProvider } from './components/ToastProvider';

function App() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reports/:patientId" element={<ReportPage />} />
          <Route path="/reports" element={<ReportPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </ToastProvider>
  );
}

export default App;
