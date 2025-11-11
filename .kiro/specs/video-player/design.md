# 설계 문서

## 개요

React와 Electron을 사용한 크로스 플랫폼 데스크톱 비디오 플레이어 애플리케이션입니다. HTML5 video 요소를 활용하여 다양한 포맷을 지원하고, Electron의 파일 시스템 API를 통해 로컬 파일 접근을 구현합니다.

## 아키텍처

### 기술 스택

- **Frontend**: React 18+ with TypeScript
- **Desktop Framework**: Electron (latest stable)
- **State Management**: React Context API + useReducer
- **Styling**: CSS Modules 또는 styled-components
- **Build Tool**: Vite (React) + Electron Builder

### 프로세스 구조

```
┌─────────────────────────────────────┐
│     Main Process (Electron)         │
│  - 파일 시스템 접근                    │
│  - 네이티브 대화상자                   │
│  - 윈도우 관리                        │
└──────────────┬──────────────────────┘
               │ IPC
┌──────────────▼──────────────────────┐
│   Renderer Process (React)          │
│  - UI 렌더링                         │
│  - 비디오 재생                        │
│  - 사용자 인터랙션                    │
└─────────────────────────────────────┘
```

## 컴포넌트 및 인터페이스

### React 컴포넌트 구조

```
App
├── MenuBar
│   ├── FileMenu (파일 열기, 폴더 열기)
│   └── ViewMenu (전체화면 토글)
├── MainLayout
│   ├── VideoPlayer
│   │   ├── VideoDisplay (video 요소)
│   │   └── VideoControls
│   │       ├── PlayPauseButton
│   │       ├── ProgressBar
│   │       ├── TimeDisplay
│   │       ├── VolumeControl
│   │       └── FullscreenButton
│   └── Playlist
│       ├── PlaylistHeader (파일 개수)
│       └── PlaylistItem[] (각 비디오 항목)
└── EmptyState (파일이 없을 때)
```

### 주요 인터페이스

```typescript
interface VideoFile {
  id: string;
  name: string;
  path: string;
  duration?: number;
}

interface PlaylistState {
  files: VideoFile[];
  currentIndex: number;
  currentFile: VideoFile | null;
}

interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isFullscreen: boolean;
}

interface AppState {
  playlist: PlaylistState;
  player: PlayerState;
}
```

### IPC 통신 채널

**Main → Renderer:**
- `file-opened`: 단일 파일 선택 결과
- `folder-opened`: 폴더 내 비디오 파일 목록
- `error`: 에러 메시지

**Renderer → Main:**
- `open-file-dialog`: 파일 선택 대화상자 요청
- `open-folder-dialog`: 폴더 선택 대화상자 요청
- `toggle-fullscreen`: 전체화면 토글 요청

## 데이터 모델

### 상태 관리

React Context와 useReducer를 사용하여 전역 상태 관리:

```typescript
// AppContext
const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<AppAction>;
}>(null);

// Actions
type AppAction =
  | { type: 'SET_PLAYLIST'; payload: VideoFile[] }
  | { type: 'SET_CURRENT_FILE'; payload: number }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'TOGGLE_FULLSCREEN' }
  | { type: 'NEXT_VIDEO' }
  | { type: 'PREVIOUS_VIDEO' };
```

### 로컬 스토리지

사용자 설정 영속화:
- `volume`: 마지막 볼륨 설정 (0-1)
- `lastPlayedPath`: 마지막 재생 파일 경로 (선택사항)

## 에러 처리

### 파일 로딩 에러

1. **지원하지 않는 포맷**: 사용자에게 알림 표시, 다음 파일로 건너뛰기
2. **파일 접근 불가**: 권한 에러 메시지 표시
3. **손상된 파일**: 재생 실패 시 에러 표시, 재생 목록에서 건너뛰기

### 재생 에러

```typescript
videoElement.addEventListener('error', (e) => {
  const error = videoElement.error;
  switch (error.code) {
    case MediaError.MEDIA_ERR_ABORTED:
      // 사용자가 중단
      break;
    case MediaError.MEDIA_ERR_NETWORK:
      showError('네트워크 에러가 발생했습니다');
      break;
    case MediaError.MEDIA_ERR_DECODE:
      showError('비디오를 디코딩할 수 없습니다');
      skipToNext();
      break;
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      showError('지원하지 않는 포맷입니다');
      skipToNext();
      break;
  }
});
```

### Electron 프로세스 에러

- IPC 통신 실패: 재시도 로직 구현
- 파일 시스템 에러: 사용자에게 명확한 에러 메시지 제공

## 주요 기능 구현

### 1. 파일/폴더 열기

**Main Process (main.js):**
```typescript
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { 
        name: 'Videos', 
        extensions: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'webm'] 
      }
    ]
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return {
      name: path.basename(result.filePaths[0]),
      path: result.filePaths[0]
    };
  }
  return null;
});

ipcMain.handle('open-folder-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    const folderPath = result.filePaths[0];
    const files = await fs.readdir(folderPath);
    const videoExtensions = ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.webm'];
    
    const videoFiles = files
      .filter(file => videoExtensions.includes(path.extname(file).toLowerCase()))
      .map(file => ({
        id: uuidv4(),
        name: file,
        path: path.join(folderPath, file)
      }));
    
    return videoFiles;
  }
  return [];
});
```

### 2. 비디오 재생

**VideoPlayer Component:**
```typescript
const VideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { state, dispatch } = useContext(AppContext);
  
  useEffect(() => {
    if (state.playlist.currentFile && videoRef.current) {
      // file:// 프로토콜로 로컬 파일 로드
      videoRef.current.src = `file://${state.playlist.currentFile.path}`;
      videoRef.current.load();
      
      if (state.player.isPlaying) {
        videoRef.current.play();
      }
    }
  }, [state.playlist.currentFile]);
  
  const handleEnded = () => {
    dispatch({ type: 'NEXT_VIDEO' });
  };
  
  return (
    <video
      ref={videoRef}
      onEnded={handleEnded}
      onTimeUpdate={(e) => dispatch({ 
        type: 'SET_TIME', 
        payload: e.currentTarget.currentTime 
      })}
      onLoadedMetadata={(e) => dispatch({ 
        type: 'SET_DURATION', 
        payload: e.currentTarget.duration 
      })}
    />
  );
};
```

### 3. 키보드 단축키

```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    switch (e.key) {
      case ' ':
        e.preventDefault();
        dispatch({ type: state.player.isPlaying ? 'PAUSE' : 'PLAY' });
        break;
      case 'ArrowRight':
        // 5초 앞으로
        dispatch({ type: 'SET_TIME', payload: state.player.currentTime + 5 });
        break;
      case 'ArrowLeft':
        // 5초 뒤로
        dispatch({ type: 'SET_TIME', payload: state.player.currentTime - 5 });
        break;
      case 'f':
        dispatch({ type: 'TOGGLE_FULLSCREEN' });
        break;
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [state.player]);
```

## 테스트 전략

### 단위 테스트

- **Reducer 로직**: 상태 변경 액션 테스트
- **유틸리티 함수**: 파일 필터링, 시간 포맷팅 등
- **컴포넌트**: React Testing Library로 UI 컴포넌트 테스트

### 통합 테스트

- **IPC 통신**: Main과 Renderer 프로세스 간 통신 테스트
- **파일 시스템**: 파일/폴더 열기 기능 테스트
- **재생 흐름**: 파일 로드 → 재생 → 다음 파일 자동 재생

### E2E 테스트

- Spectron 또는 Playwright를 사용한 전체 사용자 시나리오 테스트
- 파일 열기부터 재생, 재생 목록 탐색까지 전체 플로우

## 성능 고려사항

1. **대용량 폴더**: 수천 개의 파일이 있는 폴더의 경우 가상 스크롤링 구현
2. **메모리 관리**: 비디오 요소의 src를 변경할 때 이전 리소스 해제
3. **썸네일**: 초기 버전에서는 제외, 향후 추가 고려

## 보안 고려사항

1. **파일 경로 검증**: 사용자가 선택한 파일만 접근
2. **Content Security Policy**: Electron에서 적절한 CSP 설정
3. **Node Integration**: Renderer 프로세스에서 최소화, preload 스크립트 사용
