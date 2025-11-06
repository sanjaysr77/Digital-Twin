import { Routes, Route } from 'react-router-dom';
import ReportPage from './ReportPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/reports/:patientId" element={<ReportPage />} />
        <Route path="/" element={<h1 className="text-4xl font-bold text-center py-10">Welcome to the Patient Report System</h1>} />
      </Routes>
    </div>
  );
}

export default App;
