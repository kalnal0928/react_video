import React from 'react';
import { useAppContext } from '../../context/AppContext';
import PlaylistHeader from './PlaylistHeader';
import PlaylistItem from './PlaylistItem';
import './Playlist.css';

const Playlist: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { files, currentIndex } = state.playlist;

  const handleFileClick = (index: number) => {
    dispatch({ type: 'SET_CURRENT_FILE', payload: index });
  };

  return (
    <div className="playlist">
      <PlaylistHeader fileCount={files.length} />
      <div className="playlist__items">
        {files.map((file, index) => (
          <PlaylistItem
            key={file.id}
            file={file}
            isActive={index === currentIndex}
            onClick={() => handleFileClick(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Playlist;
