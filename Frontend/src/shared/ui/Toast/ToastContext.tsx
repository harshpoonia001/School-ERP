import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const { addToast } = context;

  return React.useMemo(
    () => ({
      success: (msg: string) => addToast('success', msg),
      error: (msg: string) => addToast('error', msg),
      info: (msg: string) => addToast('info', msg),
    }),
    [addToast]
  );
};

const ToastContainer: React.FC<{ toasts: ToastMessage[]; onRemove: (id: string) => void }> = ({
  toasts,
  onRemove,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '380px',
        width: '100%',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        const bg = isSuccess ? '#E1ECE5' : isError ? '#FBE6E5' : '#EAF2EC';
        const border = isSuccess ? '1px solid #C4DCC8' : isError ? '1px solid #F7C0BD' : '1px solid #D0E3D3';
        const color = isSuccess ? '#2F593E' : isError ? '#BA1A1A' : '#3E6B4C';

        return (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              background: bg,
              border,
              color,
              padding: '0.85rem 1.25rem',
              borderRadius: '12px',
              boxShadow: '6px 6px 14px rgba(188, 182, 168, 0.4), -4px -4px 10px rgba(255, 255, 255, 0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              animation: 'fadeIn 0.22s ease-out forwards',
            }}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => onRemove(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color,
                cursor: 'pointer',
                fontSize: '1.2rem',
                lineHeight: 1,
                padding: '0 0.25rem',
              }}
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
};
