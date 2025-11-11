import React from 'react';
import { useAppContext } from '../../context/AppContext';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import Playlist from '../Playlist/Playlist';
import './MainLayout.css';

const MainLayout: React.FC = () => {
  const { state } = useAppContext();
  const hasFiles = state.playlist.files.length > 0;

  return (
    <div className="main-layout">
      <div className="main-layout__video-section">
        <VideoPlayer />
      </div>
      {hasFiles && (
        <div className="main-layout__playlist-section">
          <Playlist />
        </div>
      )}
    </div>
  );
};

export default MainLayout;
