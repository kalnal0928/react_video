import React, { useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import './VideoControls.css';

interface VideoControlsProps {
  isVisible: boolean;
}

const VideoControls: React.FC<VideoControlsProps> = ({ isVisible }) => {
  const { state, dispatch } = useAppContext();
  const { showError } = useToast();
  const { isPlaying, currentTime, duration, volume, isFullscreen } = state.player;
  const { currentFile } = state.playlist;
  const progressBarRef = useRef<HTMLDivElement>(null);

  // 시간을 MM:SS 형식으로 포맷
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 재생/일시정지 토글
  const handlePlayPause = () => {
    if (isPlaying) {
      dispatch({ type: 'PAUSE' });
    } else {
      dispatch({ type: 'PLAY' });
    }
  };

  // 프로그레스 바 클릭으로 탐색
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && duration > 0) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      dispatch({ type: 'SET_TIME', payload: newTime });
    }
  };

  // 볼륨 변경
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    dispatch({ type: 'SET_VOLUME', payload: newVolume });
  };

  // 전체화면 토글
  const handleFullscreen = async () => {
    try {
      await window.electronAPI.toggleFullscreen();
      dispatch({ type: 'TOGGLE_FULLSCREEN' });
    } catch (error) {
      console.error('전체화면 토글 실패:', error);
      showError('전체화면 전환에 실패했습니다.');
    }
  };

  // 진행률 계산
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentFile) {
    return null;
  }

  return (
    <div className={`video-controls ${isVisible ? 'visible' : 'hidden'}`}>
      {/* 프로그레스 바 */}
      <div
        ref={progressBarRef}
        className="progress-bar-container"
        onClick={handleProgressClick}
      >
        <div className="progress-bar-background">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 컨트롤 버튼들 */}
      <div className="controls-row">
        {/* 재생/일시정지 버튼 */}
        <button
          className="control-button play-pause-button"
          onClick={handlePlayPause}
          aria-label={isPlaying ? '일시정지' : '재생'}
        >
          {isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* 시간 표시 */}
        <div className="time-display">
          <span className="current-time">{formatTime(currentTime)}</span>
          <span className="time-separator"> / </span>
          <span className="total-time">{formatTime(duration)}</span>
        </div>

        <div className="controls-right">
          {/* 볼륨 컨트롤 */}
          <div className="volume-control">
            <button
              className="control-button volume-button"
              aria-label="볼륨"
            >
              {volume === 0 ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : volume < 0.5 ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 9v6h4l5 5V4l-5 5H7z" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider"
              aria-label="볼륨 조절"
            />
            <span className="volume-percentage">{Math.round(volume * 100)}%</span>
          </div>

          {/* 전체화면 버튼 */}
          <button
            className="control-button fullscreen-button"
            onClick={handleFullscreen}
            aria-label={isFullscreen ? '전체화면 종료' : '전체화면'}
          >
            {isFullscreen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoControls;
