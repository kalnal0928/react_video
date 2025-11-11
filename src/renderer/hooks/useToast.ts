import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { ToastMessage } from '../../types';

export const useToast = () => {
  const { dispatch } = useAppContext();

  const showToast = useCallback(
    (message: string, type: ToastMessage['type'] = 'info') => {
      dispatch({
        type: 'ADD_TOAST',
        payload: { message, type },
      });
    },
    [dispatch]
  );

  const showError = useCallback(
    (message: string) => {
      showToast(message, 'error');
    },
    [showToast]
  );

  const showSuccess = useCallback(
    (message: string) => {
      showToast(message, 'success');
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string) => {
      showToast(message, 'warning');
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string) => {
      showToast(message, 'info');
    },
    [showToast]
  );

  return {
    showToast,
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };
};
