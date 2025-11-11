import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import './EmptyState.css';

const EmptyState: React.FC = () => {
  const { dispatch } = useAppContext();
  const { showError, showWarning, showSuccess } = useToast();

  const handleOpenFile = async () => {
    try {
      const file = await window.electronAPI.openFileDialog();
      if (file) {
        dispatch({ type: 'SET_PLAYLIST', payload: [file] });
        dispatch({ type: 'SET_CURRENT_FILE', payload: 0 });
        showSuccess(`파일이 열렸습니다: ${file.name}`);
      }
    } catch (error) {
      console.error('파일 열기 실패:', error);
      showError('파일을 열 수 없습니다. 다시 시도해주세요.');
    }
  };

  const handleOpenFolder = async () => {
    try {
      const files = await window.electronAPI.openFolderDialog();
      if (files && files.length > 0) {
        dispatch({ type: 'SET_PLAYLIST', payload: files });
        dispatch({ type: 'SET_CURRENT_FILE', payload: 0 });
        showSuccess(`${files.length}개의 비디오 파일을 찾았습니다.`);
      } else if (files && files.length === 0) {
        showWarning('선택한 폴더에 비디오 파일이 없습니다.');
      }
    } catch (error) {
      console.error('폴더 열기 실패:', error);
      showError('폴더를 열 수 없습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="empty-state">
      <div className="empty-state__content">
        <div className="empty-state__icon">🎬</div>
        <h2 className="empty-state__title">비디오 파일이 없습니다</h2>
        <p className="empty-state__description">
          시작하려면 비디오 파일 또는 폴더를 열어주세요
        </p>
        <div className="empty-state__actions">
          <button className="empty-state__button" onClick={handleOpenFile}>
            파일 열기
          </button>
          <button className="empty-state__button" onClick={handleOpenFolder}>
            폴더 열기
          </button>
        </div>
        <div className="empty-state__hint">
          <p>지원 포맷: MP4, AVI, MKV, MOV, WMV, WebM</p>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
