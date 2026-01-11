export async function getVersionSync(timeout: number = 0, notReject: boolean = true): Promise<string | undefined> {
  return new Promise(async (resolve, reject) => {
    try {
      let timer =
        timeout <= 0
          ? null
          : setTimeout(() => {
              reject(`timeout (${timeout} ms)`);
            }, timeout);
      const data = await window.ipc.invoke('get-version', name);
      clearTimeout(timer);
      resolve(data);
    } catch (error) {
      if (notReject) {
        resolve(undefined);
      } else {
        reject(error);
      }
    }
  });
}

export async function getAutoLaunchSync(timeout: number = 0): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      let timer =
        timeout <= 0
          ? null
          : setTimeout(() => {
              reject(`timeout (${timeout} ms)`);
            }, timeout);
      const data = await window.ipc.invoke('autoLaunch', 'get');
      clearTimeout(timer);
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
}

export async function getSysInfoSync(action: any, timeout: number = 30 * 1000): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      let timer =
        timeout <= 0
          ? null
          : setTimeout(() => {
              reject(`timeout (${timeout} ms)`);
            }, timeout);

      const data = await window.ipc.invoke('systeminformation', action);
      clearTimeout(timer);
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
}
