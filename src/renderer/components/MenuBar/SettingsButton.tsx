import React from 'react';
import './SettingsButton.css';

interface SettingsButtonProps {
  onClick: () => void;
}

const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick }) => {
  return (
    <button 
      className="settings-button menu-bar__button" 
      onClick={onClick}
      title="설정"
      aria-label="설정"
    >
      <svg 
        className="settings-button__icon" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m-2 2l-4.2 4.2M23 12h-6m-6 0H1m18.2 5.2l-4.2-4.2m-2-2l-4.2-4.2" />
      </svg>
    </button>
  );
};

export default SettingsButton;
