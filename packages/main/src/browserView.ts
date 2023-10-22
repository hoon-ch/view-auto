import { BrowserView } from "electron";
import { join } from "path";

function createBrowserView(mainWindow: Electron.BrowserWindow) {
  const browserView = new BrowserView({
    webPreferences: {
      backgroundThrottling: false,
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, "preload.js"),
    },
  });
  browserView.setBackgroundColor("#FFFFFF");
  mainWindow?.setBrowserView(browserView);

  browserView.webContents.loadURL("https://www.lcampus.co.kr/");
  // DEV 일때만 개발자 도구를 열어준다.
  if (import.meta.env.DEV) browserView.webContents.openDevTools();
  return browserView;
}

async function setCookieBeforeLoading(browserView: BrowserView): Promise<void> {
  if (!browserView) return;

  const cookies = [
    { url: "https://www.lcampus.co.kr/", name: "thePopup124", value: "done" },
    { url: "https://www.lcampus.co.kr/", name: "thePopup160", value: "done" },
    {
      url: "https://www.lcampus.co.kr/",
      name: "popupGuide7Day",
      value: "true",
      path: "/",
      expries: new Date().setDate(new Date().getDate() + 7),
    },
  ];

  for (const c of cookies) {
    await browserView.webContents.session.cookies.set(c);
  }
}

function setBrowserViewSize(
  mainWindow: Electron.BrowserWindow | null,
  browserView: BrowserView | null,
) {
  if (!mainWindow || !browserView) return;

  const [windowWidth, windowHeight] = mainWindow.getSize();

  // 전체 높이의 30% 계산
  const yOffset = Math.round(windowHeight * 0.4);

  // 남은 높이 중 90% 계산
  const viewHeight = Math.round((windowHeight - yOffset) * 0.75);

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

export { createBrowserView, setCookieBeforeLoading, setBrowserViewSize };
