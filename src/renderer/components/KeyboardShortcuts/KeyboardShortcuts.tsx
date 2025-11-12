import React from 'react';
import './KeyboardShortcuts.css';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', description: '재생 / 일시정지' },
    { key: 'F 또는 Enter', description: '전체화면 전환' },
    { key: 'ESC', description: '전체화면 해제' },
    { key: '→ (오른쪽 화살표)', description: '앞으로 건너뛰기' },
    { key: '← (왼쪽 화살표)', description: '뒤로 건너뛰기' },
    { key: '↑ (위쪽 화살표)', description: '볼륨 증가' },
    { key: '↓ (아래쪽 화살표)', description: '볼륨 감소' },
  ];

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="shortcuts-modal__backdrop" onClick={handleBackdropClick}>
      <div className="shortcuts-modal" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
        <div className="shortcuts-modal__header">
          <h2 id="shortcuts-title" className="shortcuts-modal__title">키보드 단축키</h2>
          <button
            className="shortcuts-modal__close"
            onClick={onClose}
            aria-label="닫기"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="shortcuts-modal__content">
          <div className="shortcuts-list">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="shortcut-item">
                <kbd className="shortcut-item__key">{shortcut.key}</kbd>
                <span className="shortcut-item__description">{shortcut.description}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="shortcuts-modal__footer">
          <p className="shortcuts-modal__note">
            * 건너뛰기 간격과 볼륨 조절 간격은 설정에서 변경할 수 있습니다
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
