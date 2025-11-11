import React from 'react';
import { useAppContext } from './context/AppContext';
import MenuBar from './components/MenuBar';
import MainLayout from './components/MainLayout';
import EmptyState from './components/EmptyState';
import ToastContainer from './components/Toast/ToastContainer';
import './App.css';

const App: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const hasFiles = state.playlist.files.length > 0;

  const handleRemoveToast = (id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  };

  return (
    <div className="app">
      <MenuBar />
      {hasFiles ? <MainLayout /> : <EmptyState />}
      <ToastContainer toasts={state.toasts} onRemove={handleRemoveToast} />
    </div>
  );
};

export default App;
