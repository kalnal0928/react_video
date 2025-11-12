import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { AppState, AppAction, Settings } from '../../types';
import { appReducer, DEFAULT_SETTINGS } from './appReducer';

const VOLUME_STORAGE_KEY = 'videoPlayer_volume';
const SETTINGS_STORAGE_KEY = 'videoPlayer_settings';

const getInitialVolume = (): number => {
  const stored = localStorage.getItem(VOLUME_STORAGE_KEY);
  return stored ? parseFloat(stored) : 0.7;
};

const getInitialSettings = (): Settings => {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate and merge with defaults to ensure all fields exist
      return {
        seekInterval: 
          typeof parsed.seekInterval === 'number' && 
          parsed.seekInterval >= 1 && 
          parsed.seekInterval <= 60
            ? parsed.seekInterval
            : DEFAULT_SETTINGS.seekInterval,
        volumeStep:
          typeof parsed.volumeStep === 'number' &&
          parsed.volumeStep >= 1 &&
          parsed.volumeStep <= 20
            ? parsed.volumeStep
            : DEFAULT_SETTINGS.volumeStep,
      };
    }
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error);
  }
  return { ...DEFAULT_SETTINGS };
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
  settings: getInitialSettings(),
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

  // 설정 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state.settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }, [state.settings]);

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
