const { contextBridge, ipcRenderer } = require('electron');

const electronAPI = {
  openFileDialog: async () => {
    try {
      const result = await ipcRenderer.invoke('open-file-dialog');
      return result;
    } catch (error) {
      console.error('IPC Error - openFileDialog:', error);
      throw new Error('파일 대화상자를 열 수 없습니다.');
    }
  },

  openFolderDialog: async () => {
    try {
      const result = await ipcRenderer.invoke('open-folder-dialog');
      return result;
    } catch (error) {
      console.error('IPC Error - openFolderDialog:', error);
      throw new Error('폴더 대화상자를 열 수 없습니다.');
    }
  },

  toggleFullscreen: async () => {
    try {
      const result = await ipcRenderer.invoke('toggle-fullscreen');
      return result;
    } catch (error) {
      console.error('IPC Error - toggleFullscreen:', error);
      throw new Error('전체화면 전환에 실패했습니다.');
    }
  }
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
