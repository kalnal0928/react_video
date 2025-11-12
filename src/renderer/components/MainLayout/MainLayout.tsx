import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import Playlist from '../Playlist/Playlist';
import './MainLayout.css';

const MainLayout: React.FC = () => {
  const { state } = useAppContext();
  const hasFiles = state.playlist.files.length > 0;
  const [isPlaylistVisible, setIsPlaylistVisible] = useState(true);
  const [playlistWidth, setPlaylistWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const [wasPlaylistVisibleBeforeFullscreen, setWasPlaylistVisibleBeforeFullscreen] = useState(true);
  const layoutRef = useRef<HTMLDivElement>(null);

  // 전체화면 상태 변경 감지
  useEffect(() => {
    if (state.player.isFullscreen) {
      // 전체화면 진입 시: 현재 상태 저장하고 재생 목록 숨김
      setWasPlaylistVisibleBeforeFullscreen(isPlaylistVisible);
      setIsPlaylistVisible(false);
    } else {
      // 전체화면 해제 시: 이전 상태로 복원
      setIsPlaylistVisible(wasPlaylistVisibleBeforeFullscreen);
    }
  }, [state.player.isFullscreen]);

  const handleTogglePlaylist = () => {
    setIsPlaylistVisible(!isPlaylistVisible);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !layoutRef.current) return;

      const layoutRect = layoutRef.current.getBoundingClientRect();
      const newWidth = layoutRect.right - e.clientX;
      
      // 최소 200px, 최대 600px로 제한
      const clampedWidth = Math.max(200, Math.min(600, newWidth));
      setPlaylistWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  return (
    <div 
      className={`main-layout ${state.player.isFullscreen ? 'main-layout--fullscreen' : ''}`} 
      ref={layoutRef}
    >
      <div className="main-layout__video-section">
        <VideoPlayer />
      </div>
      {hasFiles && !state.player.isFullscreen && (
        <>
          {isPlaylistVisible && (
            <>
              <div 
                className="main-layout__resizer"
                onMouseDown={handleMouseDown}
              >
                <div className="main-layout__resizer-line" />
              </div>
              <div 
                className="main-layout__playlist-section"
                style={{ width: `${playlistWidth}px` }}
              >
                <Playlist />
              </div>
            </>
          )}
          {!isPlaylistVisible && (
            <div className="main-layout__hover-trigger" />
          )}
          <button
            className={`main-layout__toggle-button ${!isPlaylistVisible ? 'main-layout__toggle-button--collapsed' : ''}`}
            onClick={handleTogglePlaylist}
            title={isPlaylistVisible ? '재생 목록 숨기기' : '재생 목록 보기'}
            aria-label={isPlaylistVisible ? '재생 목록 숨기기' : '재생 목록 보기'}
          >
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              {isPlaylistVisible ? (
                <path d="M9 18l6-6-6-6" />
              ) : (
                <path d="M15 18l-6-6 6-6" />
              )}
            </svg>
          </button>
        </>
      )}
    </div>
  );
};

export default MainLayout;
