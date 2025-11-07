import React from 'react';

interface DosAndDontsSummaryProps {
  summary: string;
}

const DosAndDontsSummary: React.FC<DosAndDontsSummaryProps> = ({ summary }) => {
  const normalize = (s: string) => (s || '').replace(/\s+/g, ' ').trim();
  const text = normalize(summary);

  const trySplitByHeadings = (s: string) => {
    const lower = s.toLowerCase();
    const doMatch = lower.match(/\bdo(?:'|’)?s?\s*[:\-]/i);
    const dontMatch = lower.match(/\bdon(?:'|’)?t(?:'|’)?s?\s*[:\-]/i);
    if (!doMatch && !dontMatch) return null;

    // Find start indices based on headings
    const doIndex = doMatch ? lower.indexOf(doMatch[0]) : -1;
    const dontIndex = dontMatch ? lower.indexOf(dontMatch[0]) : -1;

    if (doIndex === -1 && dontIndex === -1) return null;

    const firstIsDo = doIndex !== -1 && (dontIndex === -1 || doIndex < dontIndex);
    let doText = '';
    let dontText = '';

    if (firstIsDo) {
      doText = s.substring(doIndex + (doMatch ? doMatch[0].length : 0), dontIndex !== -1 ? dontIndex : s.length);
      if (dontIndex !== -1) {
        dontText = s.substring(dontIndex + (dontMatch ? dontMatch[0].length : 0));
      }
    } else {
      dontText = s.substring(dontIndex + (dontMatch ? dontMatch[0].length : 0), doIndex !== -1 ? doIndex : s.length);
      if (doIndex !== -1) {
        doText = s.substring(doIndex + (doMatch ? doMatch[0].length : 0));
      }
    }

    return { doText: normalize(doText), dontText: normalize(dontText) };
  };

  const splitIntoItems = (s: string) => {
    return s
      .split(/\n|[•\-–]\s+|;|\.|,\s(?=[A-Z])/)
      .map((x) => x.replace(/^[-•–]\s*/, '').trim())
      .filter((x) => x.length > 0);
  };

  const classifyHeuristic = (items: string[]) => {
    const dos: string[] = [];
    const donts: string[] = [];
    for (const it of items) {
      if (/\b(don'?t|avoid|never|no\s|refrain|stop)\b/i.test(it)) {
        donts.push(it);
      } else {
        dos.push(it);
      }
    }
    return { dos, donts };
  };

  let dos: string[] = [];
  let donts: string[] = [];

  const headingSplit = trySplitByHeadings(text);
  if (headingSplit) {
    dos = splitIntoItems(headingSplit.doText);
    donts = splitIntoItems(headingSplit.dontText);
  } else {
    const items = splitIntoItems(text);
    const classified = classifyHeuristic(items);
    dos = classified.dos;
    donts = classified.donts;
  }

  const hasStructured = dos.length > 0 || donts.length > 0;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4">Do's and Don'ts</h2>
      {hasStructured ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Do's</h3>
            {dos.length > 0 ? (
              <ul className="list-disc pl-6 space-y-1">
                {dos.map((d, idx) => (
                  <li key={idx}>{d}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No specific Do's extracted.</p>
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Don'ts</h3>
            {donts.length > 0 ? (
              <ul className="list-disc pl-6 space-y-1">
                {donts.map((d, idx) => (
                  <li key={idx}>{d}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No specific Don'ts extracted.</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-lg">{summary}</p>
      )}
    </div>
  );
};

export default DosAndDontsSummary;