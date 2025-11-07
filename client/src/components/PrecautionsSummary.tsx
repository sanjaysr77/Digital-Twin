import React from 'react';

interface PrecautionsSummaryProps {
  summary: string;
}

const PrecautionsSummary: React.FC<PrecautionsSummaryProps> = ({ summary }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4">Precautions</h2>
      <p className="text-lg">{summary}</p>
    </div>
  );
};

export default PrecautionsSummary;