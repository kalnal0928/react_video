import React, { useRef, useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../LoadingSpinner';
import CodecErrorModal from '../CodecErrorModal/CodecErrorModal';
import './VideoDisplay.css';

const VideoDisplay: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { state, dispatch } = useAppContext();
  const { showError } = useToast();
  const { currentFile } = state.playlist;
  const { isPlaying, volume, currentTime } = state.player;
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingFile, setIsChangingFile] = useState(false);
  const [codecError, setCodecError] = useState<{ fileName: string; filePath: string; codecInfo: string } | null>(null);

  // 파일 확장자로 필요한 코덱 정보 가져오기
  const getCodecInfo = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const codecInfo: { [key: string]: string } = {
      'mp4': 'H.264 (AVC) 또는 H.265 (HEVC) 코덱',
      'm4v': 'H.264 (AVC) 코덱',
      'mkv': 'H.264, H.265 (HEVC), VP9, 또는 AV1 코덱',
      'webm': 'VP8, VP9, 또는 AV1 코덱',
      'avi': 'MPEG-4, DivX, 또는 Xvid 코덱',
      'mov': 'H.264 (AVC) 또는 ProRes 코덱',
      'wmv': 'Windows Media Video 코덱',
      'flv': 'H.264 또는 VP6 코덱',
      'ts': 'MPEG-2 또는 H.264 코덱',
      'mts': 'MPEG-2 또는 H.264 코덱 (AVCHD)',
      'm2ts': 'H.264 또는 H.265 코덱 (Blu-ray)',
      'mpg': 'MPEG-1 또는 MPEG-2 코덱',
      'mpeg': 'MPEG-1 또는 MPEG-2 코덱',
      '3gp': 'H.263 또는 H.264 코덱',
      'ogv': 'Theora 코덱'
    };
    return codecInfo[ext || ''] || '알 수 없는 코덱';
  };

  // 현재 파일 변경 시 src 업데이트
  useEffect(() => {
    if (currentFile && videoRef.current) {
      setIsChangingFile(true);
      setIsLoading(true);
      const video = videoRef.current;
      
      // 이전 비디오 정리
      video.pause();
      video.currentTime = 0;
      
      // Windows 경로를 URL 형식으로 변환 (백슬래시 -> 슬래시)
      const normalizedPath = currentFile.path.replace(/\\/g, '/');
      // file:/// 프로토콜로 로컬 파일 로드 (슬래시 3개)
      video.src = `file:///${normalizedPath}`;
      video.load();
    }
  }, [currentFile]);

  // 재생/일시정지 상태 동기화
  useEffect(() => {
    // 파일 변경 중에는 재생 상태 동기화 건너뛰기
    if (isChangingFile || !videoRef.current || !videoRef.current.src) {
      return;
    }

    if (isPlaying) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // 파일 변경 중 발생하는 에러는 무시
          if (error.name === 'AbortError') {
            return;
          }
          console.error('재생 실패:', error);
          // NotAllowedError는 사용자 상호작용 없이 재생 시도할 때 발생 (무시 가능)
          if (error.name !== 'NotAllowedError') {
            showError('비디오 재생에 실패했습니다.');
            dispatch({ type: 'PAUSE' });
          }
        });
      }
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, isChangingFile, dispatch, showError]);

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

  // 비디오 데이터 로드 완료
  const handleCanPlay = () => {
    setIsLoading(false);
    setIsChangingFile(false);
    
    // 파일 로드 완료 후 재생 상태에 따라 자동 재생
    if (isPlaying && videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error('자동 재생 실패:', error);
      });
    }
  };

  // 비디오 로딩 시작
  const handleLoadStart = () => {
    setIsLoading(true);
  };

  // 비디오 대기 중
  const handleWaiting = () => {
    setIsLoading(true);
  };

  // 비디오 재생 중
  const handlePlaying = () => {
    setIsLoading(false);
  };

  // 에러 처리 (MediaError 타입별 처리)
  const handleError = () => {
    if (videoRef.current?.error && currentFile) {
      const error = videoRef.current.error;
      let errorMessage = '알 수 없는 에러가 발생했습니다';
      let shouldSkip = false;

      switch (error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = '비디오 로드가 중단되었습니다';
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = '네트워크 에러가 발생했습니다. 파일 경로를 확인해주세요.';
          break;
        case MediaError.MEDIA_ERR_DECODE:
          const codecInfo = getCodecInfo(currentFile.name);
          errorMessage = `비디오를 디코딩할 수 없습니다. 외부 플레이어 사용을 권장합니다.`;
          setCodecError({ fileName: currentFile.name, filePath: currentFile.path, codecInfo });
          shouldSkip = true;
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          const requiredCodec = getCodecInfo(currentFile.name);
          errorMessage = `지원하지 않는 포맷입니다. 외부 플레이어 사용을 권장합니다.`;
          setCodecError({ fileName: currentFile.name, filePath: currentFile.path, codecInfo: requiredCodec });
          shouldSkip = true;
          break;
      }

      console.error('비디오 에러:', errorMessage, error);
      console.error('파일 정보:', {
        name: currentFile.name,
        path: currentFile.path,
        errorCode: error.code,
        errorMessage: error.message
      });
      
      showError(errorMessage);

      // 디코딩 실패 또는 지원하지 않는 포맷일 경우 다음 파일로 건너뛰기
      if (shouldSkip) {
        setTimeout(() => {
          dispatch({ type: 'NEXT_VIDEO' });
        }, 2000); // 2초로 증가하여 사용자가 메시지를 읽을 시간 제공
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
        onCanPlay={handleCanPlay}
        onLoadStart={handleLoadStart}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        preload="auto"
        playsInline
      />
      {isLoading && (
        <div className="video-display__loading">
          <LoadingSpinner size="large" message="비디오 로딩 중..." />
        </div>
      )}
      <CodecErrorModal
        isOpen={codecError !== null}
        onClose={() => setCodecError(null)}
        fileName={codecError?.fileName || ''}
        filePath={codecError?.filePath || ''}
        codecInfo={codecError?.codecInfo || ''}
      />
    </div>
  );
};

export default VideoDisplay;
