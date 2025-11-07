import React from 'react';

interface OverallSummaryProps {
  summary: string;
}

const OverallSummary: React.FC<OverallSummaryProps> = ({ summary }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4">Overall Summary</h2>
      <p className="text-lg">{summary}</p>
    </div>
  );
};

export default OverallSummary;