import { useState, useCallback } from 'react';

export const useToast = (duration = 3500) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  }, [duration]);

  const clearToast = useCallback(() => setToast(null), []);

  return { toast, showToast, clearToast };
};

export const Toast = ({ toast }) => {
  if (!toast) return null;

  const colours = {
    error: 'bg-red-500',
    success: 'bg-green-500',
    info: 'bg-blue-500',
  };

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-white text-sm font-medium shadow-lg ${
        colours[toast.type] || colours.info
      }`}
    >
      {toast.message}
    </div>
  );
};

