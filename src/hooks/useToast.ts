import { useState, useCallback } from 'react';

export interface ToastState {
  title: string;
  message: string;
  isAlert?: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback(
    (title: string, message: string, isAlert = false, duration = 4500) => {
      setToast({ title, message, isAlert });
      const timer = setTimeout(() => {
        setToast((current) => (current?.title === title ? null : current));
      }, duration);
      return () => clearTimeout(timer);
    },
    []
  );

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    setToast,
    showToast,
    closeToast,
  };
}
