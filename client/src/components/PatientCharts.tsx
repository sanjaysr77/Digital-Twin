import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface Measurement {
  date: string;
  value: number;
}

interface PatientChartsProps {
  measurements?: Measurement[];
  metricSeries?: Record<string, Array<{ date: string; value: number }>>; // e.g., { Hemoglobin: [...], WBC: [...], ... }
}

const normalizeMeasurements = (m?: Measurement[]) => {
  if (!m || m.length === 0) return [] as { date: string; value: number }[];
  try {
    return m
      .map((x) => ({ date: x.date, value: Number(x.value) }))
      .filter((x) => !Number.isNaN(x.value))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch {
    return [] as { date: string; value: number }[];
  }
};

const PatientCharts: React.FC<PatientChartsProps> = ({ measurements, metricSeries }) => {
  const mData = normalizeMeasurements(measurements);
  const metrics = metricSeries || {};
  const metricEntries = Object.entries(metrics);

  return (
    <div className="grid grid-cols-1 gap-6 mb-8">
      {/* Small-multiple metric charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {metricEntries.length > 0 ? (
          metricEntries.map(([name, series]) => (
            <div key={name} className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">{name} Trend</h2>
              {series.length > 0 ? (
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={series} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} name={name} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-gray-600">No data for {name}.</p>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Trend</h2>
            {mData.length > 0 ? (
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} name="Measurement" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-gray-600">No trend data available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
;

export default PatientCharts;
