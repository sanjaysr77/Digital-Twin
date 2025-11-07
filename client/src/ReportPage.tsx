import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import OverallSummary from './components/OverallSummary';
import PrecautionsSummary from './components/PrecautionsSummary';
import DosAndDontsSummary from './components/DosAndDontsSummary';
import Chatbot from './components/Chatbot';

interface ReportData {
  patientId: string;
  name: string;
  age: number;
  gender: string;
  diagnosis: string;
  riskLevel?: string;
  remarks?: string;
  precautions?: string;
  dosAndDonts?: string;
  measurements: Array<{ date: string; value: number }>;
  overallSummary?: string;
  summarizedPrecautions?: string;
  summarizedDosAndDonts?: string;
}

const ReportPage: React.FC = () => {
  const { patientId: routePatientId } = useParams<{ patientId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const queryPatientId = searchParams.get('patientId') || undefined;
  const patientId = routePatientId || queryPatientId;
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        console.log('Fetching report for patient ID:', patientId);
        setLoading(true);
        const response = await fetch(`http://localhost:3000/api/reports/${patientId}`);
        console.log('Fetch response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: { status: string; reports: ReportData[] } = await response.json();
        console.log('Fetched data:', data);
        const patientReport = data.reports.find(r => r.patientId === patientId);
        setReport(patientReport || null);
        if (patientId) {
          localStorage.setItem('patientId', patientId);
        }
      } catch (e: any) {
        console.error('Fetch error:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchReport();
    } else {
      const stored = localStorage.getItem('patientId');
      if (stored) {
        navigate(`/reports/${encodeURIComponent(stored)}`, { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [patientId]);

  console.log('Component render state:', { loading, error, report });

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl">Loading report...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-xl text-red-500">Error: {error}</div>;
  }

  if (!patientId) {
    return null;
  }

  if (!report) {
    return <div className="flex justify-center items-center h-screen text-xl">No report found for patient ID: {patientId}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Patient Report: {report.name}</h1>

      {report.overallSummary && <OverallSummary summary={report.overallSummary} />}
      {report.summarizedPrecautions && <PrecautionsSummary summary={report.summarizedPrecautions} />}
      {report.summarizedDosAndDonts && <DosAndDontsSummary summary={report.summarizedDosAndDonts} />}

      <Chatbot summary={report.overallSummary || ''} />
    </div>
  );
};

export default ReportPage;
