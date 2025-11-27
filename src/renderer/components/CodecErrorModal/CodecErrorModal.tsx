import React, { useEffect, useRef } from 'react';
import './CodecErrorModal.css';

interface CodecErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  codecInfo: string;
}

const CodecErrorModal: React.FC<CodecErrorModalProps> = ({ isOpen, onClose, fileName, codecInfo }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleOpenHandBrake = () => {
    // HandBrake 다운로드 페이지 열기
    window.open('https://handbrake.fr/', '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="codec-error-modal__backdrop" onClick={handleBackdropClick}>
      <div className="codec-error-modal" ref={modalRef} role="dialog" aria-modal="true">
        <div className="codec-error-modal__header">
          <div className="codec-error-modal__icon">⚠️</div>
          <h2 className="codec-error-modal__title">코덱 오류</h2>
        </div>

        <div className="codec-error-modal__content">
          <div className="codec-error-modal__file-info">
            <p className="codec-error-modal__label">파일명:</p>
            <p className="codec-error-modal__value">{fileName}</p>
          </div>

          <div className="codec-error-modal__file-info">
            <p className="codec-error-modal__label">필요한 코덱:</p>
            <p className="codec-error-modal__value">{codecInfo}</p>
          </div>

          <div className="codec-error-modal__message">
            <p>이 파일은 특수한 코덱을 사용하여 재생할 수 없습니다.</p>
            <p className="codec-error-modal__message-sub">일반적인 MP4, WebM, MKV(H.264) 파일은 정상 재생됩니다.</p>
          </div>

          <div className="codec-error-modal__solution">
            <h3 className="codec-error-modal__solution-title">해결 방법</h3>
            <div className="codec-error-modal__options">
              <div className="codec-error-modal__option">
                <h4>파일 변환 (권장)</h4>
                <p>HandBrake나 FFmpeg로 MP4(H.264) 형식으로 변환하면 재생 가능합니다.</p>
                <ul>
                  <li>HandBrake 다운로드 및 설치</li>
                  <li>파일을 MP4(H.264) 형식으로 변환</li>
                  <li>변환된 파일을 이 플레이어로 재생</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="codec-error-modal__note">
            <p><strong>참고:</strong> 이 플레이어는 웹 표준 코덱(H.264, VP8, VP9)을 지원합니다. 오래된 AVI 코덱이나 특수 코덱은 지원하지 않습니다.</p>
          </div>
        </div>

        <div className="codec-error-modal__footer">
          <button
            className="codec-error-modal__button codec-error-modal__button--secondary"
            onClick={onClose}
          >
            닫기
          </button>
          <button
            className="codec-error-modal__button codec-error-modal__button--primary"
            onClick={handleOpenHandBrake}
          >
            HandBrake 다운로드
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodecErrorModal;
