import { useState, useEffect } from 'react';

interface ToastMessage {
  id: number;
  message: string;
}

export function OfflineToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleOfflineAction = (event: CustomEvent<{ message: string }>) => {
      const id = Date.now();
      const message = event.detail.message;
      
      setToasts(prev => [...prev, { id, message }]);
      
      // Auto-remove after 4 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4000);
    };

    window.addEventListener('offline-action', handleOfflineAction as EventListener);

    return () => {
      window.removeEventListener('offline-action', handleOfflineAction as EventListener);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-50 flex flex-col gap-2 max-w-md mx-auto">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="bg-red-500/90 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-top duration-300"
        >
          <span className="material-symbols-outlined text-xl">cloud_off</span>
          <p className="text-sm font-medium flex-1">{toast.message}</p>
          <button
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            className="text-white/70 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      ))}
    </div>
  );
}
