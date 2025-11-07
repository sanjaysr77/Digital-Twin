import React from 'react';

interface DosAndDontsSummaryProps {
  summary: string;
}

const DosAndDontsSummary: React.FC<DosAndDontsSummaryProps> = ({ summary }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4">Do's and Don'ts</h2>
      <p className="text-lg">{summary}</p>
    </div>
  );
};

export default DosAndDontsSummary;