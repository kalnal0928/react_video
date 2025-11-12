export interface VideoFile {
  id: string;
  name: string;
  path: string;
  duration?: number;
}

export interface PlaylistState {
  files: VideoFile[];
  currentIndex: number;
  currentFile: VideoFile | null;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isFullscreen: boolean;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export interface Settings {
  seekInterval: number;
  volumeStep: number;
}

export interface AppState {
  playlist: PlaylistState;
  player: PlayerState;
  toasts: ToastMessage[];
  settings: Settings;
}

export type AppAction =
  | { type: 'SET_PLAYLIST'; payload: VideoFile[] }
  | { type: 'ADD_TO_PLAYLIST'; payload: VideoFile }
  | { type: 'SET_CURRENT_FILE'; payload: number }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'TOGGLE_FULLSCREEN' }
  | { type: 'NEXT_VIDEO' }
  | { type: 'PREVIOUS_VIDEO' }
  | { type: 'ADD_TOAST'; payload: Omit<ToastMessage, 'id'> }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'SET_SETTINGS'; payload: Settings }
  | { type: 'UPDATE_SETTING'; payload: { key: keyof Settings; value: any } }
  | { type: 'RESET_SETTINGS' };

export interface ElectronAPI {
  openFileDialog: () => Promise<VideoFile | null>;
  openFolderDialog: () => Promise<VideoFile[]>;
  toggleFullscreen: () => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
