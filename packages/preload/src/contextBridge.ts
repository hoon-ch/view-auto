import { ipcRenderer } from "electron";

// browserWindow에서 사용할 모듈

export const main = {
  send: (channel: string, data?: unknown) => {
    ipcRenderer.send(channel, data);
  },
  on: <T = unknown>(channel: string, callback: (data: T) => void) =>
    ipcRenderer.on(channel, (_, data) => callback(data as T)),
  off: <T = unknown>(channel: string, callback: (data: T) => void) =>
    ipcRenderer.removeListener(channel, (_, data) => callback(data)),
  getWindowSize: () => {
    return ipcRenderer.sendSync("get-current-window-size");
  },

  store: {
    get: (key: string) => {
      return ipcRenderer.sendSync("electron-store-get", key);
    },
    set: (key: string, value: unknown) => {
      ipcRenderer.send("electron-store-set", key, value);
    },
    delete: (key: string) => {
      ipcRenderer.send("electron-store-delete", key);
    },
  },
  toggleBrowserView: () => {
    ipcRenderer.send("toggle-browser-view");
  },
  timer: (durationInMinutes: number, callback: () => void) => {
    ipcRenderer.send("timer", durationInMinutes);
    ipcRenderer.on("timer-end", callback);
  },
};

// browserView에서 사용할 모듈
export const view = {
  go: async (url: string): Promise<boolean> => {
    return new Promise(resolve => {
      // URL로 이동
      ipcRenderer.send("navigate-to-url", url);

      // 로딩 완료 이벤트 핸들러
      const handler = (_: Electron.IpcRendererEvent, data: boolean) => {
        if (data === true) {
          resolve(true);
          ipcRenderer.removeListener("url-load-complete", handler);
        }
      };

      // 로딩 완료 이벤트를 듣기
      ipcRenderer.on("url-load-complete", handler);
    });
  },
  injectJS: (idx: string, js: string) => {
    return ipcRenderer.send("execute-js-in-browserview", idx, js);
  },
  checkLoading: () => {
    ipcRenderer.send("check-loading");
  },
  getPHPSESSID: () => {
    return ipcRenderer.sendSync("get-phpsessid");
  },
  getLoginPermission: (account: unknown) => {
    return ipcRenderer.sendSync("get-login-permission", account);
  },
  injectToPlayer: (idx: string, funcName: string, js: string) => {
    return ipcRenderer.send("inject-to-player", idx, funcName, js);
  },
  injectToPlayerPause: (idx: string, js: string) => {
    return ipcRenderer.send("inject-to-player", idx, js);
  },
  stopAutoPlay: () => {
    return ipcRenderer.send("stop-auto-play");
  },
};
