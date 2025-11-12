import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useAppContext();
  const { showError, showSuccess } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLInputElement>(null);
  const [seekIntervalInput, setSeekIntervalInput] = useState(state.settings.seekInterval.toString());
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Update local input state when settings change
  useEffect(() => {
    setSeekIntervalInput(state.settings.seekInterval.toString());
  }, [state.settings.seekInterval]);

  // Focus trap implementation
  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (showResetConfirm) {
          setShowResetConfirm(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, showResetConfirm, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle seek interval change
  const handleSeekIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSeekIntervalInput(value);

    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 60) {
      dispatch({
        type: 'UPDATE_SETTING',
        payload: { key: 'seekInterval', value: numValue },
      });
    } else if (value !== '' && value !== '-') {
      showError('탐색 간격은 1초에서 60초 사이여야 합니다');
    }
  };

  // Handle blur to validate and correct input
  const handleSeekIntervalBlur = () => {
    const numValue = parseInt(seekIntervalInput, 10);
    if (isNaN(numValue) || numValue < 1 || numValue > 60) {
      // Reset to current valid value
      setSeekIntervalInput(state.settings.seekInterval.toString());
      if (seekIntervalInput !== '') {
        showError('잘못된 값입니다. 탐색 간격은 1초에서 60초 사이여야 합니다');
      }
    }
  };

  // Handle reset to defaults
  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  const handleResetConfirm = () => {
    dispatch({ type: 'RESET_SETTINGS' });
    setShowResetConfirm(false);
    showSuccess('설정이 기본값으로 재설정되었습니다');
  };

  const handleResetCancel = () => {
    setShowResetConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal__backdrop" onClick={handleBackdropClick}>
      <div className="settings-modal" ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className="settings-modal__header">
          <h2 id="settings-title" className="settings-modal__title">설정</h2>
          <button
            className="settings-modal__close"
            onClick={onClose}
            aria-label="설정 닫기"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="settings-modal__content">
          <div className="settings-modal__section">
            <label htmlFor="seek-interval" className="settings-modal__label">
              탐색 간격 (초)
            </label>
            <input
              ref={firstFocusableRef}
              id="seek-interval"
              type="number"
              min="1"
              max="60"
              value={seekIntervalInput}
              onChange={handleSeekIntervalChange}
              onBlur={handleSeekIntervalBlur}
              className="settings-modal__input"
              aria-describedby="seek-interval-description"
            />
            <p id="seek-interval-description" className="settings-modal__description">
              방향키를 사용할 때 건너뛸 초 단위 (1-60)
            </p>
          </div>
        </div>

        <div className="settings-modal__footer">
          <button
            className="settings-modal__button settings-modal__button--secondary"
            onClick={handleResetClick}
          >
            기본값으로 재설정
          </button>
        </div>

        {showResetConfirm && (
          <div className="settings-modal__confirm-backdrop" onClick={handleResetCancel}>
            <div className="settings-modal__confirm" onClick={(e) => e.stopPropagation()}>
              <h3 className="settings-modal__confirm-title">설정을 재설정하시겠습니까?</h3>
              <p className="settings-modal__confirm-message">
                모든 설정이 기본값으로 재설정됩니다. 이 작업은 취소할 수 없습니다.
              </p>
              <div className="settings-modal__confirm-actions">
                <button
                  className="settings-modal__button settings-modal__button--secondary"
                  onClick={handleResetCancel}
                >
                  취소
                </button>
                <button
                  className="settings-modal__button settings-modal__button--danger"
                  onClick={handleResetConfirm}
                >
                  재설정
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsModal;
