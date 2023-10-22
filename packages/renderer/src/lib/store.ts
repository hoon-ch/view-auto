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

export interface Lecture {
  idx: number;
  title: string;
  progress: number;
  learningTime: string;
  recent: string;
  status: "pending" | "processing" | "done";
  link: string;
}

export const lectureState = atom<Lecture[]>([]);

export const playing = atom(false);

export const viewState = atom(true);
