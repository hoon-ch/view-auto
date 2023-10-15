import { contextBridge, ipcRenderer } from "electron";

// browserWindow에서 사용할 모듈
type MessageCallback = (event: Electron.IpcRendererEvent, ...args: unknown[]) => void;

const windowAPI = {
  send: (channel: string, data?: unknown) => {
    ipcRenderer.send(channel, data);
  },
  on: (channel: string, func: MessageCallback) => {
    ipcRenderer.on(channel, func);
  },
  off: (channel: string, func: MessageCallback) => {
    ipcRenderer.off(channel, func);
  },
  getWindowSize: () => {
    ipcRenderer.sendSync("get-current-window-size");
  },
  store: {
    get: (key: string) => {
      ipcRenderer.sendSync("electron-store-get", key);
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
const viewAPI = {
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

export const window = contextBridge.exposeInMainWorld("main", windowAPI);
export const view = contextBridge.exposeInMainWorld("view", viewAPI);
