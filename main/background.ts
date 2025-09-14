import path from 'path';
import fs from 'fs-extra';
import cp from 'child_process';
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
  app.exit();
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
  showInspectElement: true,
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
    if (store.get('online')) return `https://class-tools.mise.run.place${params}`;
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

(async () => {
  await app.whenReady();
  const mainWindowDefaultWidthPercent = 0.13;
  const mainWindowDefaultHeightPercent = 1;
  let mainWindowWidth = (() => {
    let base = screen.getPrimaryDisplay().size.width * mainWindowDefaultWidthPercent;
    if (base < 200) base = 200;
    base = Math.floor(base);
    return base;
  })();
  let mainWindowHeight = (() => {
    let base = screen.getPrimaryDisplay().workArea.height * mainWindowDefaultHeightPercent;
    base = Math.floor(base);
    return base;
  })();

  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
    },
    backgroundMaterial: isProd ? 'acrylic' : 'acrylic',
    roundedCorners: true,
    // transparent: true,
    frame: false,
    width: mainWindowWidth,
    height: mainWindowHeight,
    x: screen.getPrimaryDisplay().workArea.width - mainWindowWidth,
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
      try {
        mainWindowWidth = (() => {
          let base = screen.getPrimaryDisplay().size.width * Number(widthP || mainWindowDefaultWidthPercent);
          if (base < 200) base = 200;
          base = Math.floor(base);
          return base;
        })();
        mainWindowHeight = (() => {
          let base = screen.getPrimaryDisplay().workArea.height * Number(heightP || mainWindowDefaultHeightPercent);
          base = Math.floor(base);
          return base;
        })();
        mainWindow.setResizable(true);
        mainWindow.setSize(mainWindowWidth, mainWindowHeight);
        isProd && mainWindow.setResizable(false);
        mainWindow.setPosition(screen.getPrimaryDisplay().workArea.width - mainWindowWidth, 0);
      } catch (error) {
        console.error(error);
      }
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
    // mainWindow.close();
    app.exit();
  });

  // App Custom Start Action
  try {
    if (store.get('main.startAction.openHotspot')) {
      if (os.platform() === 'win32' && parseInt(os.release().split('.')[0]) >= 10) {
        runHotspotScript();
      }

      function createHotspotScript() {
        const cacheDir = path.join(app.getPath('userData'), 'Cache');
        const scriptPath = path.join(cacheDir, 'hotspot.ps1');

        // 确保目录存在
        fs.ensureDirSync(cacheDir);

        // PowerShell 脚本内容
        // From: https://learn.microsoft.com/zh-cn/answers/questions/4373369/question-4373369
        const scriptContent = `Add-Type -AssemblyName System.Runtime.WindowsRuntime
$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | ? { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation\`1' })[0]
Function Await($WinRtTask, $ResultType) {
$asTask = $asTaskGeneric.MakeGenericMethod($ResultType)
$netTask = $asTask.Invoke($null, @($WinRtTask))
$netTask.Wait(-1) | Out-Null
$netTask.Result
}
Function AwaitAction($WinRtAction) {
$asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | ? { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and !$_.IsGenericMethod })[0]
$netTask = $asTask.Invoke($null, @($WinRtAction))
$netTask.Wait(-1) | Out-Null
}
$connectionProfile = [Windows.Networking.Connectivity.NetworkInformation,Windows.Networking.Connectivity,ContentType=WindowsRuntime]::GetInternetConnectionProfile()
$tetheringManager = [Windows.Networking.NetworkOperators.NetworkOperatorTetheringManager,Windows.Networking.NetworkOperators,ContentType=WindowsRuntime]::CreateFromConnectionProfile($connectionProfile)
if ($tetheringManager.TetheringOperationalState -eq 1) {
""
}
else{
Await ($tetheringManager.StartTetheringAsync()) ([Windows.Networking.NetworkOperators.NetworkOperatorTetheringOperationResult])
}`;

        // 写入文件
        fs.writeFileSync(scriptPath, scriptContent, { encoding: 'utf-8' });
        return scriptPath;
      }

      function runHotspotScript() {
        const scriptPath = createHotspotScript();

        // 调用 PowerShell 执行
        const ps = cp.spawn(
          'powershell.exe',
          [
            '-NoLogo',
            '-NoProfile',
            '-ExecutionPolicy',
            'Bypass',
            '-Command',
            `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; & '${scriptPath}'`,
          ],
          {
            windowsHide: true,
          }
        );
        // 标准输出
        ps.stdout.on('data', data => {
          console.info(`[startAction] [Hotspot] ${data.toString().trim()}`);
        });

        // 错误输出
        ps.stderr.on('data', data => {
          log.error(`[startAction] [Hotspot] ${data.toString().trim()}`);
        });

        // 退出代码
        ps.on('close', code => {
          if (code !== 0) {
            log.info(`[startAction] [Hotspot] PowerShell exited with code ${code}`);
          }
        });
      }
    }
  } catch (error) {
    log.error(error);
  }
})();

app.on('window-all-closed', () => {
  app.exit();
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
ipcMain.handle('get-config', async (event, name: string) => {
  return store.get(name);
});
ipcMain.on('set-config', async (event, name: string, value: any) => {
  store.set(name, value);
  mainWindow_g.webContents.send('sync-config');
});
ipcMain.handle('get-version', async event => {
  return app.getVersion();
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
ipcMain.handle('autoLaunch', async (event, actionName: 'get' | 'set', value?: boolean) => {
  return new Promise(resolve => {
    var AutoLauncher = new AutoLaunch({
      name: app.getName(),
    });
    if (actionName === 'get') {
      AutoLauncher.isEnabled().then(isEnabled => {
        resolve(isEnabled);
      });
    } else if (actionName === 'set') {
      if (value) {
        AutoLauncher.enable();
      } else {
        AutoLauncher.disable();
      }
      resolve(undefined);
    }
  });
});

// Define a type for the possible DNS record types
type DnsRecordType = 'A' | 'AAAA' | 'MX' | 'TXT' | 'CNAME' | 'NS' | 'PTR' | 'SOA';

// Add an IPC handler for resolving DNS records with a specified record type
ipcMain.handle('resolveDns', async (event, domain: string, recordType: DnsRecordType): Promise<any> => {
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

ipcMain.handle('systeminformation', async (event, action: any) => {
  return new Promise(resolve => {
    systeminformation.get(action).then(data => {
      resolve(data);
    });
  });
});

ipcMain.on('sys-shutdown', async (event, arg) => {
  if (isProd) return;
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
