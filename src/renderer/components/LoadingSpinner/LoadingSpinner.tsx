import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  message 
}) => {
  return (
    <div className={`loading-spinner loading-spinner--${size}`}>
      <div className="loading-spinner__circle">
        <div className="loading-spinner__inner"></div>
      </div>
      {message && <p className="loading-spinner__message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
