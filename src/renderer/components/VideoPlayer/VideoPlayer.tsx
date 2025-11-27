import React, { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import VideoDisplay from './VideoDisplay';
import VideoControls from './VideoControls';
import './VideoPlayer.css';

const VideoPlayer: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { showError } = useToast();
  const { isPlaying, currentTime } = state.player;
  const { seekInterval, volumeStep } = state.settings;
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

        case 'ArrowUp':
          // 위쪽 화살표로 볼륨 증가 (설정된 간격)
          e.preventDefault();
          dispatch({ type: 'SET_VOLUME', payload: Math.min(1, state.player.volume + volumeStep / 100) });
          break;

        case 'ArrowDown':
          // 아래쪽 화살표로 볼륨 감소 (설정된 간격)
          e.preventDefault();
          dispatch({ type: 'SET_VOLUME', payload: Math.max(0, state.player.volume - volumeStep / 100) });
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
  }, [isPlaying, currentTime, seekInterval, volumeStep, state.player.isFullscreen, state.player.volume, dispatch, showError]);

  // 마우스 움직임 감지 및 컨트롤 자동 숨김
  useEffect(() => {
    const handleMouseMove = () => {
      // 컨트롤 표시
      setShowControls(true);

      // 기존 타이머 취소
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }

      // 재생 중일 때만 3초 후 자동 숨김
      if (isPlaying) {
        hideControlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    const handleMouseLeave = () => {
      // 마우스가 플레이어 영역을 벗어나면 즉시 숨김 (재생 중일 때만)
      if (isPlaying) {
        if (hideControlsTimeoutRef.current) {
          clearTimeout(hideControlsTimeoutRef.current);
        }
        setShowControls(false);
      }
    };

    // 일시정지 상태에서는 항상 컨트롤 표시
    if (!isPlaying) {
      setShowControls(true);
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    }

    window.addEventListener('mousemove', handleMouseMove);
    const playerElement = document.querySelector('.video-player');
    if (playerElement) {
      playerElement.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (playerElement) {
        playerElement.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className={`video-player ${!showControls ? 'hide-cursor' : ''}`}>
      <VideoDisplay />
      <VideoControls isVisible={showControls} />
    </div>
  );
};

export default VideoPlayer;
