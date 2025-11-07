import React, { useMemo, useState } from 'react';
import { useToast } from './ToastProvider';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotProps {
  summary: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ summary }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const disabled = useMemo(() => !summary || loading, [summary, loading]);
  const { show } = useToast();

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    const nextMessages = [...messages, { role: 'user', content: text } as ChatMessage];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary, messages: nextMessages }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { reply: string } = await res.json();
      setMessages([...nextMessages, { role: 'assistant', content: data.reply }]);

      // Fire and forget: request a short insight for toast
      fetch('http://localhost:3000/api/chat/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary, question: text }),
      })
        .then(async (r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((j: { insight?: string }) => {
          const msg = (j?.insight || '').trim();
          if (msg) show({ title: 'Insight', description: msg, duration: 6000 });
        })
        .catch(() => {
          // No-op: avoid breaking chat if insight fails
        });
    } catch (e: any) {
      setMessages([...nextMessages, { role: 'assistant', content: 'Sorry, I could not process that request.' }]);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4">Chat about your report</h2>
      {!summary ? (
        <p className="text-gray-600">Overall summary not available.</p>
      ) : (
        <>
          <div className="h-64 overflow-y-auto border rounded p-3 mb-4 bg-gray-50">
            {messages.length === 0 && (
              <p className="text-gray-600 text-sm">Ask any question about your diagnosis or next steps. The assistant uses the overall summary as context.</p>
            )}
            {messages.map((m, idx) => (
              <div key={idx} className={`mb-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block px-3 py-2 rounded ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                  {m.content}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 border rounded px-3 py-2"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={disabled}
            />
            <button
              className={`px-4 py-2 rounded text-white ${disabled ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
              onClick={sendMessage}
              disabled={disabled}
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Chatbot;
