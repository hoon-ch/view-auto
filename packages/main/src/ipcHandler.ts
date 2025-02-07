import axios from "axios";
import type { IpcMainEvent } from "electron";
import { ipcMain } from "electron";
import Store from "electron-store";
import { setBrowserViewSize } from "./browserView";
import { powerSaveBlocker } from "electron";

const store = new Store();

export function initializeIpcHandlers(
  browserView: Electron.BrowserView,
  mainWindow: Electron.BrowserWindow,
) {
  let childWindow: Electron.BrowserWindow | null = null;
  let intervalId: string | number | NodeJS.Timeout | undefined;
  let injectToPlayerJS: string | undefined;

  const blockerId = powerSaveBlocker.start("prevent-app-suspension");
  console.log("prevent-app-suspension started :", powerSaveBlocker.isStarted(blockerId));

  ipcMain.on("get-current-window-size", (event: IpcMainEvent) => {
    const [width, height] = mainWindow.getSize();
    event.returnValue = { width, height };
  });

  ipcMain.on("electron-store-get", (event: IpcMainEvent, key: string) => {
    event.returnValue = store.get(key);
  });

  ipcMain.on("electron-store-set", (_: IpcMainEvent, key: string, value: unknown) => {
    store.set(key, value);
  });

  ipcMain.on("electron-store-delete", (_: IpcMainEvent, key: string) => {
    store.delete(key);
  });

  ipcMain.on("navigate-to-url", (event, url) => {
    browserView.webContents.loadURL(url);

    browserView.webContents.once("did-finish-load", () => {
      event.sender.send("url-load-complete", true);
    });
  });

  ipcMain.on("timer", (event: IpcMainEvent, durationInMinutes: number) => {
    let timer = durationInMinutes * 60;
    intervalId = setInterval(() => {
      timer -= 1;
      if (timer <= 0) {
        clearInterval(intervalId);
        event.sender.send("timer-end");
      }
      // 남은 시간을 분과 초로 출력
      console.log(`Remaining time: ${Math.floor(timer / 60)}m ${timer % 60}s`);
      mainWindow.webContents.send(
        "console-log",
        `Remaining time: ${Math.floor(timer / 60)}m ${timer % 60}s`,
      );
    }, 1000);
  });

  ipcMain.on("execute-js-in-browserview", (event: IpcMainEvent, idx: string, js: string) => {
    if (browserView) {
      browserView.webContents
        .executeJavaScript(js)
        .then((result: unknown) => {
          console.log(
            "🚀 ~ file: ipcHandler.ts:43 ~ .execute-js-in-browserview ~ idx, result:",
            idx,
            result,
          );
          event.reply(idx, result);
        })
        .catch((error: Error) => {
          console.error("Error executing JavaScript:", error);
          event.reply("js-executed", { error: error.message });
        });
    }
  });

  ipcMain.on(
    "inject-to-player",
    (event: IpcMainEvent, idx: string, funcName: string, js: string) => {
      if (idx === "auto-playing" || idx === "one-time-play") injectToPlayerJS = js;
      if (childWindow) {
        childWindow.webContents
          .executeJavaScript(js)
          .then((result: unknown) => {
            event.reply(idx, result);
          })
          .catch((error: Error) => {
            console.error("Error executing JavaScript to Player:", error);
            event.reply("js-executed-to-player", { error: error.message });
          });
      }
    },
  );

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
          return result;
        });
    }
  });

  let isBrowserViewHidden = false;
  ipcMain.on("toggle-browser-view", () => {
    if (isBrowserViewHidden) {
      setBrowserViewSize(mainWindow, browserView);
    } else {
      browserView?.setBounds({ x: 0, y: 0, width: 0, height: 0 });
    }

    isBrowserViewHidden = !isBrowserViewHidden;
  });

  mainWindow.on("resize", () => {
    if (isBrowserViewHidden) return;
    if (!mainWindow) return;
    setBrowserViewSize(mainWindow, browserView);
    const [width, height] = mainWindow.getSize();
    mainWindow?.webContents.send("window-resize", { width, height });
  });

  ipcMain.on("get-login-permission", async (event: IpcMainEvent, account: AccountInfo) => {
    if (!browserView) {
      event.returnValue = false;
      return;
    }

    try {
      const phpsessid = await getPHPSESSIDFromBrowserView(browserView);
      const { cookies, responseBody } = await sendLoginRequest(account, phpsessid);

      // 로그인 실패를 나타내는 응답 본문의 조건을 검사
      if (isLoginFailed(responseBody)) {
        event.returnValue = false;
        return;
      }

      await setCookiesToBrowserView(browserView, cookies);
      event.returnValue = true;
    } catch (error) {
      console.error(error);
      event.returnValue = false;
    }
  });

  browserView.webContents.on("did-create-window", (newWindow, details) => {
    if (newWindow) {
      if (details.options.webPreferences) {
        details.options.webPreferences.backgroundThrottling = false;
        details.options.focusable = false;
      }
      childWindow = newWindow;
      childWindow.webContents.setAudioMuted(true);
      childWindow?.hide();
      if (import.meta.env.DEV) {
        childWindow?.webContents.openDevTools();
      }

      if (childWindow) {
        // URL이 변경될 때마다 이벤트가 발생합니다.
        childWindow.webContents.on("did-navigate", (event, url) => {
          console.log(`The URL of the childWindow has changed: ${url}`);
          // URL 변경에 대한 추가 처리를 여기에 추가할 수 있습니다.
          if (injectToPlayerJS) {
            childWindow?.webContents.executeJavaScript(injectToPlayerJS);
          }
        });

        childWindow.webContents.on("did-navigate-in-page", (event, url) => {
          console.log(`The URL of the childWindow internal page has changed: ${url}`);
          // 내부 페이지 URL 변경에 대한 추가 처리를 여기에 추가할 수 있습니다.
        });
      }

      setTimeout(() => {
        mainWindow.webContents.send("set-player", true);
      }, 2000);
      childWindow?.on("closed", () => {
        clearInterval(intervalId); // childWindow가 닫히면 타이머를 정지
        mainWindow.webContents.send("set-player", false);
        childWindow = null;
      });
    }
  });

  ipcMain.on("stop-auto-play", () => {
    if (childWindow) {
      mainWindow.webContents.send("set-player", false);
      childWindow.close();
      childWindow.destroy();
      childWindow = null;
    } else {
      console.error("childWindow is null");
    }
  });

  ipcMain.on("toggle-child-window", () => {
    if (childWindow && childWindow.isVisible()) {
      childWindow.hide();
    } else if (childWindow) {
      childWindow.show();
    }
  });
}

type AccountInfo = {
  id: string;
  password: string;
};

async function getPHPSESSIDFromBrowserView(browserView: Electron.BrowserView): Promise<string> {
  const cookieMatchScript = `
    document.cookie.match(/PHPSESSID=[^;]+/) ? document.cookie.match(/PHPSESSID=[^;]+/)[0].split("=")[1] : null;
  `;

  return browserView.webContents.executeJavaScript(cookieMatchScript) as Promise<string>;
}

async function sendLoginRequest(
  account: AccountInfo,
  phpsessid: string,
): Promise<{ cookies: string[]; responseBody: unknown }> {
  const formData = new FormData();
  formData.append("url", "https://www.lcampus.co.kr/");
  formData.append("Login_ID", account.id);
  formData.append("Login_PASS", account.password);
  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://www.lcampus.co.kr/Member/Login.Check2.php",
    headers: {
      Cookie: phpsessid,
      "Content-Type": "multipart/form-data",
    },
    data: formData,
  };

  const response = await axios.request(config);
  const responseBody = response.data; // 응답 본문
  const cookies = response.headers?.["set-cookie"] || [];

  return { cookies, responseBody };
}

// 로그인 실패를 판단하는 함수
function isLoginFailed(responseBody: unknown): boolean {
  if (typeof responseBody === "string" && responseBody.includes("history.go(-1)")) {
    return true; // 임시 코드
  }
  return false;
}

async function setCookiesToBrowserView(browserView: Electron.BrowserView, cookies: string[]) {
  for (const cookieStr of cookies) {
    const cookieObject = parseCookie(cookieStr);
    const transformedCookie = transformCookieObject(cookieObject);

    await browserView.webContents.session.cookies.set(
      transformedCookie as Electron.CookiesSetDetails,
    );
  }
}

function parseCookie(cookieString: string): { [key: string]: string } {
  return cookieString.split("; ").reduce(
    (acc, pair) => {
      const [key, value] = pair.split("=");
      acc[key] = value;
      return acc;
    },
    {} as { [key: string]: string },
  );
}

function transformCookieObject(cookieObject: { [s: string]: unknown }): Electron.CookiesSetDetails {
  const { domain, path, expires } = cookieObject as {
    domain: string;
    path: string;
    expires: string;
  };
  return {
    url: "https://www.lcampus.co.kr",
    name: Object.keys(cookieObject)[0],
    value: String(Object.values(cookieObject)[0]),
    domain: domain.startsWith(".") ? domain.substring(1) : domain,
    path,
    expirationDate: new Date(expires).getTime() / 1000,
  };
}
