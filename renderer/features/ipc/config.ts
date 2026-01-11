export async function getConfigSync(name?: string, timeout: number = 0, notReject: boolean = true): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      let timer =
        timeout <= 0
          ? null
          : setTimeout(() => {
              reject(`timeout (${timeout} ms)`);
            }, timeout);
      const data = await window.ipc.invoke('get-config', name);
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

export async function setConfigSync(
  name: string,
  content: any,
  timeout: number = 0,
  notReject: boolean = true
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      let timer =
        timeout <= 0
          ? null
          : setTimeout(() => {
              reject(`timeout (${timeout} ms)`);
            }, timeout);
      const data = await window.ipc.invoke('set-config', name, content);
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
