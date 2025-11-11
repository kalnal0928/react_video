import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { AppState, AppAction } from '../../types';
import { appReducer } from './appReducer';

const VOLUME_STORAGE_KEY = 'videoPlayer_volume';

const getInitialVolume = (): number => {
  const stored = localStorage.getItem(VOLUME_STORAGE_KEY);
  return stored ? parseFloat(stored) : 0.7;
};

const initialState: AppState = {
  playlist: {
    files: [],
    currentIndex: -1,
    currentFile: null,
  },
  player: {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: getInitialVolume(),
    isFullscreen: false,
  },
  toasts: [],
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 볼륨 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem(VOLUME_STORAGE_KEY, state.player.volume.toString());
  }, [state.player.volume]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
