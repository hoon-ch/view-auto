import { atom } from "jotai";

type AppState = {
  isLogin: "success" | "none" | "failed";
  isSelected: boolean;
};
// 로그인 상태, 강의목록 스캔
export const appState = atom<AppState>({
  isLogin: "none",
  isSelected: false,
});

export const classState = atom({
  title: "",
  url: "",
  progress: "",
  overallDate: "",
  recentDate: "",
  theDayBefore: "",
  totalEvaluations: "",
  takenEvaluations: "",
});
