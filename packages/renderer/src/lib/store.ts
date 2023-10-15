import { atom } from "jotai";

// 로그인 상태, 강의목록 스캔
export const appState = atom({
  isLogin: false,
  isScan: false,
});
