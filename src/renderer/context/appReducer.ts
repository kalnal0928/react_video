import { AppState, AppAction } from '../../types';

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_PLAYLIST':
      return {
        ...state,
        playlist: {
          files: action.payload,
          currentIndex: action.payload.length > 0 ? 0 : -1,
          currentFile: action.payload.length > 0 ? action.payload[0] : null,
        },
        player: {
          ...state.player,
          isPlaying: action.payload.length > 0,
          currentTime: 0,
          duration: 0,
        },
      };

    case 'SET_CURRENT_FILE':
      const newIndex = action.payload;
      const newFile = state.playlist.files[newIndex] || null;
      return {
        ...state,
        playlist: {
          ...state.playlist,
          currentIndex: newIndex,
          currentFile: newFile,
        },
        player: {
          ...state.player,
          isPlaying: newFile !== null,
          currentTime: 0,
          duration: 0,
        },
      };

    case 'PLAY':
      return {
        ...state,
        player: {
          ...state.player,
          isPlaying: true,
        },
      };

    case 'PAUSE':
      return {
        ...state,
        player: {
          ...state.player,
          isPlaying: false,
        },
      };

    case 'SET_VOLUME':
      return {
        ...state,
        player: {
          ...state.player,
          volume: Math.max(0, Math.min(1, action.payload)),
        },
      };

    case 'SET_TIME':
      return {
        ...state,
        player: {
          ...state.player,
          currentTime: action.payload,
        },
      };

    case 'SET_DURATION':
      return {
        ...state,
        player: {
          ...state.player,
          duration: action.payload,
        },
      };

    case 'TOGGLE_FULLSCREEN':
      return {
        ...state,
        player: {
          ...state.player,
          isFullscreen: !state.player.isFullscreen,
        },
      };

    case 'NEXT_VIDEO':
      const nextIndex = state.playlist.currentIndex + 1;
      if (nextIndex < state.playlist.files.length) {
        const nextFile = state.playlist.files[nextIndex];
        return {
          ...state,
          playlist: {
            ...state.playlist,
            currentIndex: nextIndex,
            currentFile: nextFile,
          },
          player: {
            ...state.player,
            isPlaying: true,
            currentTime: 0,
            duration: 0,
          },
        };
      }
      // 마지막 파일이면 재생 중지
      return {
        ...state,
        player: {
          ...state.player,
          isPlaying: false,
        },
      };

    case 'PREVIOUS_VIDEO':
      const prevIndex = state.playlist.currentIndex - 1;
      if (prevIndex >= 0) {
        const prevFile = state.playlist.files[prevIndex];
        return {
          ...state,
          playlist: {
            ...state.playlist,
            currentIndex: prevIndex,
            currentFile: prevFile,
          },
          player: {
            ...state.player,
            isPlaying: true,
            currentTime: 0,
            duration: 0,
          },
        };
      }
      return state;

    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [
          ...state.toasts,
          {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            ...action.payload,
          },
        ],
      };

    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.payload),
      };

    default:
      return state;
  }
};
