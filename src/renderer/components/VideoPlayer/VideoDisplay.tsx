import React, { useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import './VideoDisplay.css';

const VideoDisplay: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { state, dispatch } = useAppContext();
  const { showError } = useToast();
  const { currentFile } = state.playlist;
  const { isPlaying, volume, currentTime } = state.player;

  // 현재 파일 변경 시 src 업데이트
  useEffect(() => {
    if (currentFile && videoRef.current) {
      // file:// 프로토콜로 로컬 파일 로드
      videoRef.current.src = `file://${currentFile.path}`;
      videoRef.current.load();
    }
  }, [currentFile]);

  // 재생/일시정지 상태 동기화
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch((error) => {
          console.error('재생 실패:', error);
          showError('비디오 재생에 실패했습니다.');
          dispatch({ type: 'PAUSE' });
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, dispatch, showError]);

  // 볼륨 동기화
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  // 시간 탐색 동기화
  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  // 비디오 종료 시 다음 비디오로 이동
  const handleEnded = () => {
    dispatch({ type: 'NEXT_VIDEO' });
  };

  // 재생 시간 업데이트
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    dispatch({
      type: 'SET_TIME',
      payload: e.currentTarget.currentTime,
    });
  };

  // 비디오 메타데이터 로드 시 duration 설정
  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    dispatch({
      type: 'SET_DURATION',
      payload: e.currentTarget.duration,
    });
  };

  // 에러 처리 (MediaError 타입별 처리)
  const handleError = () => {
    if (videoRef.current?.error) {
      const error = videoRef.current.error;
      let errorMessage = '알 수 없는 에러가 발생했습니다';
      let shouldSkip = false;

      switch (error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = '비디오 로드가 중단되었습니다';
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = '네트워크 에러가 발생했습니다';
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorMessage = '비디오를 디코딩할 수 없습니다. 다음 파일로 건너뜁니다.';
          shouldSkip = true;
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = '지원하지 않는 포맷입니다. 다음 파일로 건너뜁니다.';
          shouldSkip = true;
          break;
      }

      console.error('비디오 에러:', errorMessage, error);
      showError(errorMessage);

      // 디코딩 실패 또는 지원하지 않는 포맷일 경우 다음 파일로 건너뛰기
      if (shouldSkip) {
        setTimeout(() => {
          dispatch({ type: 'NEXT_VIDEO' });
        }, 1000);
      }
    }
  };

  if (!currentFile) {
    return (
      <div className="video-display-empty">
        <p>재생할 비디오를 선택하세요</p>
      </div>
    );
  }

  return (
    <div className="video-display">
      <video
        ref={videoRef}
        className="video-element"
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleError}
      />
    </div>
  );
};

export default VideoDisplay;
