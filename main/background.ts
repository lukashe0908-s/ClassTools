import path from 'path';
import fs from 'fs-extra';
import { app, dialog, ipcMain, ipcRenderer, screen } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import { BrowserWindow, Menu } from 'electron';
import Store from 'electron-store';
import AutoLaunch from 'auto-launch';
import systeminformation from 'systeminformation';
import contextMenu from 'electron-context-menu';
import os from 'os';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import dns from 'dns';

const isProd = process.env.NODE_ENV === 'production';
if (isProd) {
  serve({ directory: 'build/app' });
} else {
  // app.setPath('userData', `${app.getPath('userData')} (development)`)
  app.setPath('userData', path.join(process.cwd(), '.data'));
}
let mainWindow_g: BrowserWindow;
let settingsWindow_g: BrowserWindow;
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow_g) {
      if (mainWindow_g.isMinimized()) mainWindow_g.restore();
      mainWindow_g.focus();
    }
  });
}
const store = new Store();
Menu.setApplicationMenu(null);
contextMenu({
  showSearchWithGoogle: false,
  showCopyLink: false,
  showLearnSpelling: false,
  showLookUpSelection: false,
  labels: {
    cut: '剪切',
    copy: '复制',
    paste: '粘贴',
    selectAll: '全选',
    copyImage: '复制图像',
    inspect: '检查',
  },
});
// setupTitlebar();

// autoUpdater Debug
log.transports.file.level = 'info';
autoUpdater.logger = log;
autoUpdater.autoDownload = false;

function getProviderPath(params: string) {
  if (isProd) {
    if (store.get('online')) return `https://dt.mise.run.place${params}`;
    return `app://-${params}`;
  } else {
    const port = process.argv[2];
    return `http://localhost:${port}${params}`;
  }
}

function isWindows11() {
  const platform = os.platform();
  const release = os.release();

  // Windows 11 的版本号通常是 10.0.22000 或更高
  if (platform === 'win32' && parseInt(release.split('.')[2], 10) >= 22000) {
    return true;
  }
  return false;
}
function createRoundedRectShape(width, height, radius) {
  const shape = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const inTopLeft = x < radius && y < radius && (x - radius) ** 2 + (y - radius) ** 2 > radius ** 2;
      const inTopRight = x >= width - radius && y < radius && (x - (width - radius)) ** 2 + (y - radius) ** 2 > radius ** 2;
      const inBottomLeft = x < radius && y >= height - radius && (x - radius) ** 2 + (y - (height - radius)) ** 2 > radius ** 2;
      const inBottomRight =
        x >= width - radius && y >= height - radius && (x - (width - radius)) ** 2 + (y - (height - radius)) ** 2 > radius ** 2;

      if (!(inTopLeft || inTopRight || inBottomLeft || inBottomRight)) {
        shape.push({ x, y, width: 1, height: 1 });
      }
    }
  }
  return shape;
}

(async () => {
  await app.whenReady();
  let winWidth = (() => {
    let base = screen.getPrimaryDisplay().size.width * 0.13;
    if (base < 200) base = 200;
    base = Math.floor(base);
    return base;
  })();
  let winHeight = (() => {
    let base = screen.getPrimaryDisplay().workArea.height * 1;
    base = Math.floor(base);
    return base;
  })();

  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
    },
    backgroundMaterial: isProd ? 'acrylic' : 'none',
    roundedCorners: true,
    // transparent: true,
    frame: false,
    width: winWidth,
    height: winHeight,
    x: screen.getPrimaryDisplay().workArea.width - winWidth,
    y: 0,
    skipTaskbar: true,
    resizable: !isProd,
  });
  mainWindow.webContents.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  );
  mainWindow.on('close', () => {
    mainWindow_g = undefined;
  });
  mainWindow_g = mainWindow;
  resizeWindow();
  ipcMain.on('set-config', async (event, ...arg) => {
    resizeWindow();
  });
  function resizeWindow() {
    const widthP = store.get('display.windowWidth');
    const heightP = store.get('display.windowHeight');
    if (widthP || heightP) {
      winWidth = (() => {
        let base = screen.getPrimaryDisplay().size.width * Number(widthP);
        if (base < 200) base = 200;
        base = Math.floor(base);
        return base;
      })();
      winHeight = (() => {
        let base = screen.getPrimaryDisplay().workArea.height * Number(heightP);
        base = Math.floor(base);
        return base;
      })();
      mainWindow.setResizable(true);
      // autoSetWindowCorner();
      mainWindow.setSize(winWidth, winHeight);
      isProd && mainWindow.setResizable(false);
      mainWindow.setPosition(screen.getPrimaryDisplay().workArea.width - winWidth, 0);
    }
  }

  // Add Window Corner on Windows 10
  function autoSetWindowCorner() {
    if (os.platform() == 'win32' && Number(os.release().split('.')[0]) >= 10 && !os.version().includes('Windows 11')) {
      const shape = createRoundedRectShape(winWidth, winHeight, 12);
      mainWindow.setShape(shape);
    }
  }

  if (isProd) {
    const legacy = store.get('display.useLegacyHome');
    if (legacy) {
      await mainWindow.loadURL(getProviderPath('/float'));
    } else {
      await mainWindow.loadURL(getProviderPath('/home'));
    }
    autoUpdater.checkForUpdates();
  } else {
    await mainWindow.loadURL(getProviderPath('/home'));
    // mainWindow.webContents.openDevTools()
  }
  ipcMain.on('close-window', async (event, arg) => {
    mainWindow.close();
    app.quit();
  });
})();

app.on('window-all-closed', () => {
  app.quit();
});

// IPC Updater
ipcMain.on('autoUpdater/checkForUpdates', () => {
  autoUpdater.checkForUpdates();
});
autoUpdater.on('update-available', info => {
  mainWindow_g.webContents.send('autoUpdater/update-available', info);
});
ipcMain.on('autoUpdater/downloadUpdate', () => {
  autoUpdater.downloadUpdate();
});
autoUpdater.on('download-progress', progress => {
  mainWindow_g.webContents.send('autoUpdater/download-progress', progress);
});
autoUpdater.on('update-downloaded', () => {
  mainWindow_g.webContents.send('autoUpdater/update-downloaded');
});
ipcMain.on('autoUpdater/quitAndInstall', () => {
  autoUpdater.quitAndInstall(true, true);
});

// IPC Config
ipcMain.on('get-config', async (event, signal, name: string) => {
  event.reply('get-config/' + signal, store.get(name));
});
ipcMain.on('set-config', async (event, name: string, value: any) => {
  store.set(name, value);
  mainWindow_g.webContents.send('sync-config');
});
ipcMain.on('get-version', async event => {
  event.reply('get-version', app.getVersion());
});

ipcMain.on('showContextMenu_listTime', (event, splitChecked: boolean = false) => {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: `在下方插入分隔符`,
      type: 'checkbox',
      checked: splitChecked,
      click: menuItem => {
        event.sender.send('showContextMenu_listTime', 'divide', menuItem.checked);
      },
    },
    { type: 'separator' },
    {
      label: '清空',
      click: () => {
        event.sender.send('showContextMenu_listTime', 'clear');
      },
    },
  ]);
  contextMenu.popup({ window: BrowserWindow.fromWebContents(event.sender) });
});

// IPC Auto Launch
ipcMain.on('autoLaunch', async (event, actionName: 'get' | 'set', value?: boolean) => {
  var AutoLauncher = new AutoLaunch({
    name: app.getName(),
  });
  if (actionName === 'get') {
    AutoLauncher.isEnabled().then(isEnabled => {
      event.reply('autoLaunch', isEnabled);
    });
  } else if (actionName === 'set') {
    if (value) {
      AutoLauncher.enable();
    } else {
      AutoLauncher.disable();
    }
  }
});


// Define a type for the possible DNS record types
type DnsRecordType = 'A' | 'AAAA' | 'MX' | 'TXT' | 'CNAME' | 'NS' | 'PTR' | 'SOA';

// Add an IPC handler for resolving DNS records with a specified record type
ipcMain.handle('resolveDns', async (event, domain: string, recordType: DnsRecordType): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    dns.resolve(domain, recordType, (err, addresses) => {
      if (err) {
        reject(`Error resolving DNS for ${domain} with record type ${recordType}: ${err.message}`);
      } else {
        resolve(addresses); // Resolves to an array of DNS records (strings)
      }
    });
  });
});

ipcMain.on('systeminformation', async (event, signal, action: any) => {
  systeminformation.get(action).then(data => {
    event.reply('systeminformation/' + signal, data);
  });
});

ipcMain.on('sys-shutdown', async (event, arg) => {
  const cp = require('child_process');
  cp.execSync('shutdown -s -t 0');
});

ipcMain.on('settings-window', async (event, arg) => {
  if (settingsWindow_g) {
    settingsWindow_g.show();
    return;
  }
  const settingsWindow = createWindow('settingsWindow', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
    },
    maximizable: true,
    resizable: true,
  });
  settingsWindow.on('close', () => {
    settingsWindow_g = undefined;
  });
  settingsWindow_g = settingsWindow;

  arg && arg[0] && settingsWindow.webContents.openDevTools();

  await settingsWindow.loadURL(getProviderPath('/settings'));
});
ipcMain.on('ai-window', async (event, arg) => {
  const window = createWindow('aiWindow', {
    backgroundMaterial: 'acrylic',
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    maximizable: true,
    resizable: true,
  });
  await window.loadURL(getProviderPath('/ai'));
});
