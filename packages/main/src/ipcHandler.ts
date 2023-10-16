import type { IpcMainEvent } from "electron";
import { ipcMain } from "electron";
import Store from "electron-store";

const store = new Store();

export function initializeIpcHandlers(
  browserView: Electron.BrowserView,
  mainWindow: Electron.BrowserWindow,
) {
  ipcMain.on("get-current-window-size", (event: IpcMainEvent) => {
    const [width, height] = mainWindow.getSize();
    event.returnValue = { width, height };
  });

  ipcMain.on("electron-store-get", (event: IpcMainEvent, key: string) => {
    console.log("🚀 ~ file: ipcHandler.ts:19 ~ ipcMain.on ~ key:", key);
    event.returnValue = store.get(key);
    console.log("🚀 ~ file: ipcHandler.ts:22 ~ ipcMain.on ~ vent.returnValue:", store.get(key));
  });

  ipcMain.on("electron-store-set", (_: IpcMainEvent, key: string, value: unknown) => {
    console.log("🚀 ~ file: ipcHandler.ts:25 ~ ipcMain.on ~ value:", value);
    console.log("🚀 ~ file: ipcHandler.ts:25 ~ ipcMain.on ~ key:", key);
    store.set(key, value);
  });

  ipcMain.on("electron-store-delete", (_: IpcMainEvent, key: string) => {
    store.delete(key);
  });

  ipcMain.on("execute-js-in-browserview", (event: IpcMainEvent, js: string) => {
    if (browserView) {
      browserView.webContents.executeJavaScript(js).then((result: unknown) => {
        event.reply("js-executed", result);
      });
    }
  });

  ipcMain.handle("check-login", async () => {
    if (browserView) {
      // browserView 웹 콘텐츠에서 로그인 체크를 하고 결과를 보내준다. 결과를 send로 renderer에 보내준다.
      browserView.webContents
        .executeJavaScript(
          `
            let loginSuccess = document.querySelector(".welcome_wrap.pull-right");
            let loginFail = document.querySelector(".login_wrap.login_wrap2.pull-left");

            if (loginSuccess) {
            window.ipcRenderer.send("set-login-result", true);
            } else if (loginFail) {
            window.ipcRenderer.send("set-login-result", false);
            }
        `,
        )
        .then((result: unknown) => {
          console.log("🚀 ~ file: ipcHandler.ts:66 ~ ipcMain.on ~ result", result);
          return result;
        });
    }
  });

  let isBrowserViewHidden = false;
  ipcMain.on("toggle-browser-view", () => {
    if (isBrowserViewHidden) {
      setBrowserViewSize(browserView, mainWindow);
    } else {
      browserView?.setBounds({ x: 0, y: 0, width: 0, height: 0 });
    }

    isBrowserViewHidden = !isBrowserViewHidden;
  });

  mainWindow.on("resize", () => {
    if (isBrowserViewHidden) return;
    if (!mainWindow) return;
    setBrowserViewSize(browserView, mainWindow);
    const [width, height] = mainWindow.getSize();
    mainWindow?.webContents.send("window-resize", { width, height });
  });
}

function setBrowserViewSize(browserView: Electron.BrowserView, mainWindow: Electron.BrowserWindow) {
  const [windowWidth, windowHeight] = mainWindow.getSize();

  // 전체 높이의 20% 계산
  const yOffset = Math.round(windowHeight * 0.3);

  // 남은 높이 중 90% 계산
  const viewHeight = Math.round((windowHeight - yOffset) * 0.9);

  // 너비는 전체 창의 너비의 90%를 사용
  const viewWidth = Math.round(windowWidth * 0.9);

  // x 좌표는 (전체 창 너비 - BrowserView의 너비) / 2 로 설정
  const xOffset = Math.round((windowWidth - viewWidth) / 2);

  browserView.setBounds({
    x: xOffset,
    y: yOffset,
    width: viewWidth,
    height: viewHeight,
  });
}
