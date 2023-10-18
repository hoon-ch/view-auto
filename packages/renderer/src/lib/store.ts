import { atom } from "jotai";

type AppState = {
  isLogin: "success" | "none" | "failed";
  isScan: boolean;
};
// 로그인 상태, 강의목록 스캔
export const appState = atom<AppState>({
  isLogin: "none",
  isScan: false,
});
