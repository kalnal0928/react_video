import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import './MenuBar.css';

const MenuBar: React.FC = () => {
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
    <div className="menu-bar">
      <button className="menu-bar__button" onClick={handleOpenFile}>
        파일 열기
      </button>
      <button className="menu-bar__button" onClick={handleOpenFolder}>
        폴더 열기
      </button>
    </div>
  );
};

export default MenuBar;
