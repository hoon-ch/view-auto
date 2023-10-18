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
  go: (url: string) => {
    return ipcRenderer.send("go", url);
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
};
