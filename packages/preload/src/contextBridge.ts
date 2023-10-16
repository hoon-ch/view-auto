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
};

// browserView에서 사용할 모듈
export const view = {
  injectJS: (js: string) => {
    ipcRenderer.send("execute-js-in-browserview", js);
  },
  checkLoading: () => {
    ipcRenderer.send("check-loading");
  },
  checkLogin: () => {
    ipcRenderer.invoke("check-login").then((result: unknown) => {
      console.log("🚀 ~ file: contextBridge.ts:96 ~ ipcRenderer.invoke ~ result", result);
      return result;
    });
  },
};
