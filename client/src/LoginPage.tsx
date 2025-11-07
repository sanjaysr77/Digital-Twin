import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [patientId, setPatientId] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If a patientId is present in the URL query (?patientId=...), prefill
    const params = new URLSearchParams(location.search);
    const q = params.get('patientId');
    if (q) setPatientId(q);
    // If user already has a patientId stored, let them continue quickly
    const saved = localStorage.getItem('patientId');
    if (!q && saved) {
      setPatientId(saved);
    }
  }, [location.search]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = patientId.trim();
    if (!id) return;
    localStorage.setItem('patientId', id);
    navigate(`/reports/${encodeURIComponent(id)}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white shadow rounded p-6">
        <h1 className="text-2xl font-semibold mb-2 text-center">Patient Login</h1>
        <p className="text-sm text-gray-600 mb-6 text-center">Enter your Patient ID to view your reports.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Patient ID</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. 12345"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              autoFocus
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 rounded text-white ${patientId.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'}`}
            disabled={!patientId.trim()}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
