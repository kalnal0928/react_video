import { AppState, AppAction, Settings } from '../../types';

export const DEFAULT_SETTINGS: Settings = {
  seekInterval: 5,
  volumeStep: 5, // 5% 단위로 볼륨 조절
};

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_PLAYLIST':
      const shouldAutoPlay = action.autoPlay !== false; // 기본값은 true
      return {
        ...state,
        playlist: {
          files: action.payload,
          currentIndex: action.payload.length > 0 ? 0 : -1,
          currentFile: action.payload.length > 0 ? action.payload[0] : null,
        },
        player: {
          ...state.player,
          isPlaying: shouldAutoPlay && action.payload.length > 0,
          currentTime: 0,
          duration: 0,
        },
      };

    case 'ADD_TO_PLAYLIST':
      // Check if file already exists in playlist
      const fileExists = state.playlist.files.some(
        (file) => file.path === action.payload.path
      );
      
      if (fileExists) {
        // If file exists, just switch to it
        const existingIndex = state.playlist.files.findIndex(
          (file) => file.path === action.payload.path
        );
        return {
          ...state,
          playlist: {
            ...state.playlist,
            currentIndex: existingIndex,
            currentFile: state.playlist.files[existingIndex],
          },
          player: {
            ...state.player,
            isPlaying: true,
            currentTime: 0,
            duration: 0,
          },
        };
      }
      
      // Add new file to playlist
      const updatedFiles = [...state.playlist.files, action.payload];
      const newFileIndex = updatedFiles.length - 1;
      
      return {
        ...state,
        playlist: {
          files: updatedFiles,
          currentIndex: newFileIndex,
          currentFile: action.payload,
        },
        player: {
          ...state.player,
          isPlaying: true,
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

    case 'SET_SETTINGS':
      return {
        ...state,
        settings: action.payload,
      };

    case 'UPDATE_SETTING':
      const { key, value } = action.payload;
      
      // Validate seekInterval range (1-60 seconds)
      if (key === 'seekInterval') {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue < 1 || numValue > 60) {
          return state; // Invalid value, don't update
        }
        return {
          ...state,
          settings: {
            ...state.settings,
            [key]: numValue,
          },
        };
      }
      
      // Validate volumeStep range (1-20%)
      if (key === 'volumeStep') {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue < 1 || numValue > 20) {
          return state; // Invalid value, don't update
        }
        return {
          ...state,
          settings: {
            ...state.settings,
            [key]: numValue,
          },
        };
      }
      
      return {
        ...state,
        settings: {
          ...state.settings,
          [key]: value,
        },
      };

    case 'RESET_SETTINGS':
      return {
        ...state,
        settings: { ...DEFAULT_SETTINGS },
      };

    default:
      return state;
  }
};
