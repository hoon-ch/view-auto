import type React from "react";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAtom } from "jotai";
import { appState, lectureState, playing, viewState } from "@/lib/store";
import {
  checkAndClickNext,
  getPriorityIndex,
  playTargetLecture,
  getRemainingLearningTime,
  justOnce,
} from "../logic/control-class";
import { main, view } from "#preload";

interface AutoPlayProps {}

const AutoPlay: React.FC<AutoPlayProps> = () => {
  const [lectures] = useAtom(lectureState);
  const [targetLectureIdx, setTargetLectureIdx] = useState<number>(0);
  const [currentLecture, setCurrentLecture] = useState<string>("");
  const [showView, setShowView] = useAtom(viewState);
  //   const [currentPage, setCurrentPage] = useState(0);
  //   const [totalPage, setTotalPage] = useState(0);
  const [playerWindow, setPlayerWindow] = useState(false);
  const [isPause, setIsPause] = useState(false);
  const [pauseFlag, setPauseFlag] = useState("");
  const [prevViewState, setPrevViewState] = useState<boolean | null>(null);
  const [, setIsPlaying] = useAtom(playing);
  const [, setAppState] = useAtom(appState);

  // 수강할 강의들이 정의되면, 우선순위를 계산하여 수강할 차시를 결정 후 targetIdx를 set
  useEffect(() => {
    const priorityIndex = getPriorityIndex(lectures);
    if (priorityIndex === -1) {
      console.log("모든 강의를 수강하였습니다.");
      setIsPlaying(false);
      setAppState(prev => ({ ...prev, isSelected: false }));
    } else {
      setTargetLectureIdx(priorityIndex);
    }
  }, [lectures, setAppState, setIsPlaying]);

  // targetIdx가 set 되었을 때, 수강 시작
  useEffect(() => {
    console.log(`${targetLectureIdx + 1} 차시를 수강합니다.`);
    console.log(`${lectures[targetLectureIdx].link}`);
    // '수업 듣기' 버튼 클릭
    if (targetLectureIdx !== undefined && targetLectureIdx !== null) {
      playTargetLecture("play-video", lectures, targetLectureIdx);
    }
  }, [targetLectureIdx, lectures]);

  // 수강을 시작하여, 플레이어가 로드 되었을 때
  useEffect(() => {
    main.on("set-player", (value: boolean) => setPlayerWindow(value));
    if (playerWindow) {
      const durationInMinutes = getRemainingLearningTime(lectures[targetLectureIdx].learningTime);
      console.log("🚀 ~ file: AutoPlay.tsx:69 ~ useEffect ~ durationInMinutes:", durationInMinutes);
      if (lectures[targetLectureIdx].progress !== 100 && durationInMinutes <= 0) {
        justOnce("one-time-play");
      } else {
        const varPause = checkAndClickNext("auto-playing", durationInMinutes);
        setPauseFlag(varPause);
        main.timer(durationInMinutes, () => view.stopAutoPlay());
        // 수강이 완료되거나 종료하여 창이 닫혔을때
      }
      main.on("set-player", (value: boolean) => setIsPlaying(value));
    }
  }, [playerWindow, targetLectureIdx, lectures, setIsPlaying]);

  const handleExit = () => {
    view.stopAutoPlay();
    setIsPlaying(false);
    setAppState(prev => ({ ...prev, isSelected: false }));
  };

  const handleView = (isOpen: boolean) => {
    setPrevViewState(showView);

    if (isOpen) {
      if (showView) {
        main.toggleBrowserView();
        setShowView(false);
      }
    } else if (!isOpen) {
      if (prevViewState === false) return;
      if (!showView) {
        main.toggleBrowserView();
        setShowView(true);
        setPrevViewState(null);
      }
    }
  };

  useEffect(() => {
    console.log("🚀 ~ file: AutoPlay.tsx:98 ~ useEffect ~ isPause:", isPause);
    console.log("🚀 ~ file: AutoPlay.tsx:98 ~ useEffect ~ pauseFlag:", pauseFlag);
    if (pauseFlag === "") return;
    if (isPause) {
      // 일시 중지 상태
      view.injectToPlayerPause("play-pause", `${pauseFlag} = true;`);
    } else if (!isPause) {
      // 재생 상태
      view.injectToPlayerPause("play-pause", `${pauseFlag} = false;`);
    }
  }, [isPause, pauseFlag]);

  // 수강할 차시가 변경되면 해당 차시의 제목을 가져옴
  useEffect(() => {
    if (lectures.length > 0) {
      setCurrentLecture(lectures[targetLectureIdx].title);
    }
  }, [targetLectureIdx, lectures]);

  return (
    <AlertDialog onOpenChange={e => handleView(e)}>
      <div className="flex gap-2">
        <p>
          {targetLectureIdx + 1} 차시 : {currentLecture}
        </p>
        {/* <p>
          페이지: {currentPage} / {totalPage}
        </p> */}
      </div>
      <div className="flex gap-1">
        <TooltipProvider>
          {!isPause ? (
            <Tooltip>
              <TooltipTrigger
                className="rounded-lg border bg-neutral-200 p-2 text-primary hover:bg-neutral-100 hover:text-neutral-500"
                onClick={() => setIsPause(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 5.25v13.5m-7.5-13.5v13.5"
                  />
                </svg>
              </TooltipTrigger>
              <TooltipContent>⏸️ : Bot의 작동이 일시중지 되요!</TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger
                className="rounded-lg bg-primary p-2 text-primary-foreground"
                onClick={() => setIsPause(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                  />
                </svg>
              </TooltipTrigger>
              <TooltipContent>▶️ : Bot의 작동이 재개 되요!</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger className="rounded-lg bg-destructive p-2 text-destructive-foreground">
              <AlertDialogTrigger asChild={true}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>정말로 중지하시겠어요?</AlertDialogTitle>
                  <AlertDialogDescription>
                    작동중인 모든 작업을 즉시 중지하고 이전 단계로 돌아가게 되요 😭
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={handleExit}
                  >
                    끝내기
                  </AlertDialogAction>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </TooltipTrigger>
            <TooltipContent>모든 작업을 즉시 중지하고 이전 단계로 돌아가요 😢</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </AlertDialog>
  );
};

export default AutoPlay;
