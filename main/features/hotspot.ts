import path from 'path';
import fs from 'fs-extra';
import cp from 'child_process';
import { app } from 'electron';

export function createHotspotScript() {
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

export async function runHotspotScript(isDebug = false) {
  const scriptPath = createHotspotScript();

  return new Promise(resolve => {
    let debugLogs = '';

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
      },
    );
    // 标准输出
    ps.stdout.on('data', data => {
      const logInfo = `[startAction] [Hotspot] ${data.toString().trim()}`;
      if (isDebug) {
        debugLogs += logInfo + '\n';
      } else {
        console.info(logInfo);
      }
    });

    // 错误输出
    ps.stderr.on('data', data => {
      const logInfo = `[startAction] [Hotspot] ${data.toString().trim()}`;
      if (isDebug) {
        debugLogs += logInfo + '\n';
      } else {
        console.error(logInfo);
      }
    });

    // 退出代码
    ps.on('close', code => {
      if (code !== 0) {
        const logInfo = `[startAction] [Hotspot] PowerShell exited with code ${code}`;
        if (isDebug) {
          debugLogs += logInfo + '\n';
        } else {
          console.info(logInfo);
        }
      }
      resolve(debugLogs);
    });
  });
}
