import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

type Toast = {
  id: string;
  title?: string;
  description: string;
  duration?: number; // ms
};

interface ToastContextValue {
  show: (t: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

const ToastItem: React.FC<{ toast: Toast; onClose: (id: string) => void }> = ({ toast, onClose }) => {
  const { id, title, description } = toast;
  return (
    <div className="bg-gray-900 text-white shadow-lg rounded px-4 py-3 w-80 pointer-events-auto">
      {title && <div className="font-semibold mb-1">{title}</div>}
      <div className="text-sm leading-snug">{description}</div>
      <button className="absolute top-1 right-2 text-white/70 hover:text-white" onClick={() => onClose(id)}>×</button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: string) => {
    setToasts((arr) => arr.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((t: Omit<Toast, 'id'>) => {
    const id = String(++idRef.current);
    const item: Toast = { id, duration: 6000, ...t };
    setToasts((arr) => [item, ...arr]);
    const duration = item.duration ?? 6000;
    window.setTimeout(() => remove(id), duration);
  }, [remove]);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 items-end pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="relative pointer-events-auto">
            <ToastItem toast={t} onClose={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
