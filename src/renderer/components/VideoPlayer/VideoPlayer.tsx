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
          // 오른쪽 화살표로 5초 앞으로
          e.preventDefault();
          dispatch({ type: 'SET_TIME', payload: currentTime + 5 });
          break;

        case 'ArrowLeft':
          // 왼쪽 화살표로 5초 뒤로
          e.preventDefault();
          dispatch({ type: 'SET_TIME', payload: Math.max(0, currentTime - 5) });
          break;

        case 'f':
        case 'F':
          // f 키로 전체화면 토글
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

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, currentTime, dispatch, showError]);

  return (
    <div className="video-player">
      <VideoDisplay />
      <VideoControls />
    </div>
  );
};

export default VideoPlayer;
