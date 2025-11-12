import React, { useEffect, useState, useRef } from 'react';
import './Toast.css';

export type ToastType = 'info' | 'success' | 'error' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  const [isExiting, setIsExiting] = useState(false);
  const onCloseRef = useRef(onClose);

  // Keep the ref updated
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (duration <= 0) return;
    
    // Start exit animation before removing
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 300); // Start exit animation 300ms before removal

    // Remove toast after animation completes
    const removeTimer = setTimeout(() => {
      onCloseRef.current();
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [duration]);

  return (
    <div className={`toast toast--${type} ${isExiting ? 'toast--exiting' : ''}`} role="alert">
      <div className="toast__icon">
        {type === 'error' && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        )}
        {type === 'success' && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        )}
        {type === 'warning' && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
        )}
        {type === 'info' && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
        )}
      </div>
      <div className="toast__message">{message}</div>
      <button className="toast__close" onClick={onClose} aria-label="닫기">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
