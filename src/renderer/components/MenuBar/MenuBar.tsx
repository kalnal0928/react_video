import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import SettingsButton from './SettingsButton';
import SettingsModal from '../Settings/SettingsModal';
import KeyboardShortcuts from '../KeyboardShortcuts/KeyboardShortcuts';
import './MenuBar.css';

const MenuBar: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { showError, showWarning, showSuccess } = useToast();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const handleOpenFile = async () => {
    try {
      const file = await window.electronAPI.openFileDialog();
      if (file) {
        // Check if playlist already has files
        if (state.playlist.files.length > 0) {
          // Add to existing playlist
          dispatch({ type: 'ADD_TO_PLAYLIST', payload: file });
          showSuccess(`재생 목록에 추가되었습니다: ${file.name}`);
        } else {
          // Create new playlist
          dispatch({ type: 'SET_PLAYLIST', payload: [file] });
          showSuccess(`파일이 열렸습니다: ${file.name}`);
        }
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

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
  };

  const handleShortcutsClick = () => {
    setIsShortcutsOpen(true);
  };

  const handleShortcutsClose = () => {
    setIsShortcutsOpen(false);
  };

  return (
    <>
      <div className="menu-bar">
        <div className="menu-bar__left">
          <button className="menu-bar__button" onClick={handleOpenFile}>
            파일 열기
          </button>
          <button className="menu-bar__button" onClick={handleOpenFolder}>
            폴더 열기
          </button>
        </div>
        <div className="menu-bar__right">
          <button 
            className="menu-bar__button menu-bar__button--icon" 
            onClick={handleShortcutsClick}
            title="단축키"
            aria-label="단축키"
          >
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round" 
              strokeLinejoin="round"
              width="20"
              height="20"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10" />
            </svg>
          </button>
          <SettingsButton onClick={handleSettingsClick} />
        </div>
      </div>
      <SettingsModal isOpen={isSettingsOpen} onClose={handleSettingsClose} />
      <KeyboardShortcuts isOpen={isShortcutsOpen} onClose={handleShortcutsClose} />
    </>
  );
};

export default MenuBar;
