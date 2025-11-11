import React from 'react';
import './PlaylistHeader.css';

interface PlaylistHeaderProps {
  fileCount: number;
}

const PlaylistHeader: React.FC<PlaylistHeaderProps> = ({ fileCount }) => {
  return (
    <div className="playlist-header">
      <h2 className="playlist-title">재생 목록</h2>
      <span className="playlist-count">{fileCount}개 파일</span>
    </div>
  );
};

export default PlaylistHeader;
