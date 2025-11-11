import React from 'react';
import { VideoFile } from '../../../types';
import './PlaylistItem.css';

interface PlaylistItemProps {
  file: VideoFile;
  isActive: boolean;
  onClick: () => void;
}

const PlaylistItem: React.FC<PlaylistItemProps> = ({ file, isActive, onClick }) => {
  return (
    <div 
      className={`playlist-item ${isActive ? 'playlist-item--active' : ''}`}
      onClick={onClick}
    >
      <span className="playlist-item__name">{file.name}</span>
    </div>
  );
};

export default PlaylistItem;
