import React, { useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import VideoDisplay from './VideoDisplay';
import VideoControls from './VideoControls';
import './VideoPlayer.css';

const VideoPlayer: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { showError } = useToast();
  const { isPlaying, currentTime } = state.player;
  const { seekInterval } = state.settings;

  // 키보드 단축키 구현
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // input이나 textarea에서는 단축키 비활성화
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case ' ':
          // 스페이스바로 재생/일시정지
          e.preventDefault();
          if (isPlaying) {
            dispatch({ type: 'PAUSE' });
          } else {
            dispatch({ type: 'PLAY' });
          }
          break;

        case 'ArrowRight':
          // 오른쪽 화살표로 설정된 간격만큼 앞으로
          e.preventDefault();
          dispatch({ type: 'SET_TIME', payload: currentTime + seekInterval });
          break;

        case 'ArrowLeft':
          // 왼쪽 화살표로 설정된 간격만큼 뒤로
          e.preventDefault();
          dispatch({ type: 'SET_TIME', payload: Math.max(0, currentTime - seekInterval) });
          break;

        case 'f':
        case 'F':
        case 'Enter':
          // f 키 또는 엔터 키로 전체화면 토글
          e.preventDefault();
          window.electronAPI.toggleFullscreen()
            .then(() => {
              dispatch({ type: 'TOGGLE_FULLSCREEN' });
            })
            .catch((error) => {
              console.error('전체화면 토글 실패:', error);
              showError('전체화면 전환에 실패했습니다.');
            });
          break;

        case 'Escape':
          // ESC 키로 전체화면 해제
          e.preventDefault();
          if (state.player.isFullscreen) {
            window.electronAPI.toggleFullscreen()
              .then(() => {
                dispatch({ type: 'TOGGLE_FULLSCREEN' });
              })
              .catch((error) => {
                console.error('전체화면 해제 실패:', error);
                showError('전체화면 해제에 실패했습니다.');
              });
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, currentTime, seekInterval, state.player.isFullscreen, dispatch, showError]);

  return (
    <div className="video-player">
      <VideoDisplay />
      <VideoControls />
    </div>
  );
};

export default VideoPlayer;
