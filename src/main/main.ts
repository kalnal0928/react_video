import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#000000',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  // Set Content Security Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline'; " +
          "style-src 'self' 'unsafe-inline'; " +
          "media-src 'self' file:; " +
          "img-src 'self' data:; " +
          "connect-src 'self'"
        ]
      }
    });
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('open-file-dialog', async () => {
  try {
    if (!mainWindow) {
      throw new Error('Main window is not available');
    }

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      title: 'Open Video File',
      filters: [
        {
          name: 'Videos',
          extensions: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'webm']
        },
        {
          name: 'All Files',
          extensions: ['*']
        }
      ]
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      
      // 파일 존재 여부 확인
      try {
        await fs.access(filePath);
      } catch {
        throw new Error('Selected file does not exist or is not accessible');
      }

      return {
        id: Date.now().toString(),
        name: path.basename(filePath),
        path: filePath
      };
    }
    return null;
  } catch (error) {
    console.error('Error opening file dialog:', error);
    throw error;
  }
});

ipcMain.handle('open-folder-dialog', async () => {
  try {
    if (!mainWindow) {
      throw new Error('Main window is not available');
    }

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Open Folder'
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const folderPath = result.filePaths[0];
      
      // 폴더 접근 권한 확인
      try {
        await fs.access(folderPath);
      } catch {
        throw new Error('Selected folder is not accessible');
      }

      const files = await fs.readdir(folderPath);
      const videoExtensions = ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.webm'];

      const videoFiles = files
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return videoExtensions.includes(ext);
        })
        .map((file, index) => ({
          id: `${Date.now()}-${index}`,
          name: file,
          path: path.join(folderPath, file)
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      return videoFiles;
    }
    return [];
  } catch (error) {
    console.error('Error opening folder dialog:', error);
    throw error;
  }
});

ipcMain.handle('toggle-fullscreen', async () => {
  try {
    if (!mainWindow) {
      throw new Error('Main window is not available');
    }
    
    const isFullScreen = mainWindow.isFullScreen();
    mainWindow.setFullScreen(!isFullScreen);
    return !isFullScreen;
  } catch (error) {
    console.error('Error toggling fullscreen:', error);
    throw error;
  }
});
