import type React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { classList } from "../logic/scrapper";
import { main, view } from "#preload";
import { Button } from "../ui/button";
import { nanoid } from "nanoid";
import { truncateString } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAtom } from "jotai";
import { appState, classState } from "@/lib/store";

type Class = {
  title: string;
  url: string;
  progress: string;
  overallDate: string;
  recentDate: string;
  takenEvaluations: string;
  theDayBefore: string;
  totalEvaluations: string;
};

const ListView: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [, setAppState] = useAtom(appState);
  const [, setClassState] = useAtom(classState);

  useEffect(() => {
    setTimeout(() => {
      classList("class-list");
    }, 1000);
    main.on("class-list", (event: Class[]) => {
      setClasses(event);
    });
  }, []);

  const handleClass = (url: string, classItem: Class) => {
    view.go(url);
    setClassState(classItem);
    setAppState(prev => ({ ...prev, isSelected: true }));
  };

  const isCompleted = (item: Class) => {
    const { url, progress, totalEvaluations, takenEvaluations } = item;
    const total = Number(totalEvaluations);
    const taken = Number(takenEvaluations);
    const result = total - taken;
    if (result === 0 && progress === "100") {
      return (
        <Button
          variant={"secondary"}
          className="cursor-default"
        >
          학습완료
        </Button>
      );
    } else if (item.title.includes("스마트워크")) {
      return (
        <Button
          variant={"destructive"}
          className="cursor-not-allowed"
        >
          미지원
        </Button>
      );
    } else {
      return (
        <Button
          onClick={() => {
            handleClass(url, item);
          }}
        >
          학습하기
        </Button>
      );
    }
  };

  return (
    <TooltipProvider>
      <div className="flex gap-5 whitespace-nowrap p-2">
        {classes.map(item => (
          <Card
            key={nanoid()}
            className=" w-[23rem] max-w-sm"
          >
            <CardHeader>
              <CardTitle className=" whitespace-pre-wrap">
                {item.title.length > 28 ? (
                  <Tooltip>
                    <TooltipTrigger>{truncateString(item.title, 28)}</TooltipTrigger>
                    <TooltipContent>{item.title}</TooltipContent>
                  </Tooltip>
                ) : (
                  item.title
                )}
              </CardTitle>
              <CardDescription>수강기간: {item.overallDate}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm">
              <div>
                <p>진도율: {item.progress}%</p>
                <p>최근학습일: {item.recentDate}</p>
                <p>마감기한: D-{item.theDayBefore}</p>
              </div>
              {isCompleted(item)}
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default ListView;
