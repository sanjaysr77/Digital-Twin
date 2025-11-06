import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportData {
  patientId: string;
  name: string;
  age: number;
  gender: string;
  diagnosis: string;
  riskLevel?: string; // Assuming riskLevel might be present
  remarks?: string; // Assuming remarks might be present
  measurements: Array<{ date: string; value: number }>;
  overallSummary?: string;
}

const ReportPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
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
      } catch (e: any) {
        console.error('Fetch error:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchReport();
    }
  }, [patientId]);

  console.log('Component render state:', { loading, error, report });

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl">Loading report...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-xl text-red-500">Error: {error}</div>;
  }

  if (!report) {
    return <div className="flex justify-center items-center h-screen text-xl">No report found for patient ID: {patientId}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Patient Report: {report.name}</h1>

      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Overall Summary</h2>
        {report.overallSummary ? (
          <p className="text-lg">{report.overallSummary}</p>
        ) : (
          <>
            {report.diagnosis && <p className="text-lg"><strong>Diagnosis:</strong> {report.diagnosis}</p>}
            {report.riskLevel && <p className="text-lg"><strong>Risk Level:</strong> {report.riskLevel}</p>}
            {report.remarks && <p className="text-lg"><strong>Remarks:</strong> {report.remarks}</p>}
            {!report.diagnosis && !report.riskLevel && !report.remarks && <p className="text-lg">No summary or raw report details available.</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default ReportPage;
