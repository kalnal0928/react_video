import React, { useEffect, useRef } from 'react';
import './AboutModal.css';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="about-modal__backdrop" onClick={handleBackdropClick}>
      <div className="about-modal" ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="about-title">
        <div className="about-modal__header">
          <h2 id="about-title" className="about-modal__title">Video Player 정보</h2>
          <button
            className="about-modal__close"
            onClick={onClose}
            aria-label="닫기"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="about-modal__content">
          <div className="about-modal__logo">
            <div className="about-modal__icon">🎬</div>
            <h3 className="about-modal__app-name">Video Player</h3>
            <p className="about-modal__version">버전 1.0.0</p>
          </div>

          <div className="about-modal__section">
            <h4 className="about-modal__section-title">제작자</h4>
            <p className="about-modal__text">코드깎는 국어쌤</p>
          </div>

          <div className="about-modal__section">
            <h4 className="about-modal__section-title">지원 포맷</h4>
            <p className="about-modal__text">
              MP4, MKV, AVI, MOV, WMV, WebM, FLV, TS, M2TS, MPG, 3GP, OGV
            </p>
          </div>

          <div className="about-modal__footer-info">
            <p className="about-modal__copyright">
              © 2024 코드깎는 국어쌤. All rights reserved.
            </p>
          </div>
        </div>

        <div className="about-modal__footer">
          <button
            className="about-modal__button"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
