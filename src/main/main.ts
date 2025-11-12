import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

// 하드웨어 가속 활성화 (4K 비디오 재생 최적화)
app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#000000',
    show: false,
    webPreferences: {
      preload: process.env.VITE_DEV_SERVER_URL 
        ? path.join(process.cwd(), 'src/main/preload.cjs')
        : path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // 로컬 파일 접근을 위해 sandbox 비활성화
      webSecurity: false, // 로컬 파일 재생을 위해 webSecurity 비활성화
      // 하드웨어 가속 활성화
      webgl: true,
      // 고성능 비디오 디코딩
      enableWebSQL: false
    }
  });

  // Set Content Security Policy (개발 모드에서만 적용)
  if (!process.env.VITE_DEV_SERVER_URL) {
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "media-src 'self' file: data: blob:; " +
            "img-src 'self' data: file:; " +
            "connect-src 'self'"
          ]
        }
      });
    });
  }

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    // 개발자 도구는 필요할 때만 F12로 열 수 있습니다
    // mainWindow.webContents.openDevTools();
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
  // Remove the default menu
  Menu.setApplicationMenu(null);
  
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
          extensions: [
            'mp4', 'm4v', 'mkv', 'avi', 'mov', 'wmv', 'webm',
            'flv', 'ts', 'mts', 'm2ts', 'mpg', 'mpeg', '3gp', 'ogv'
          ]
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
      // 4K 및 고화질 비디오 포맷 지원
      const videoExtensions = [
        '.mp4', '.m4v',  // H.264, H.265/HEVC
        '.mkv',          // Matroska (4K 지원)
        '.avi',          // AVI
        '.mov',          // QuickTime
        '.wmv',          // Windows Media
        '.webm',         // WebM (VP9, AV1)
        '.flv',          // Flash Video
        '.ts', '.mts',   // MPEG Transport Stream
        '.m2ts',         // Blu-ray BDAV
        '.mpg', '.mpeg', // MPEG
        '.3gp',          // 3GPP
        '.ogv'           // Ogg Video
      ];

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
