/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Sample from "@/components/sample/Sample";
import type React from "react";
import { useEffect, useState } from "react";
import Controller from "@/components/pages/Controller";
import { DevTools } from "jotai-devtools";
import { Button } from "./components/ui/button";
import { main } from "#preload";
import { Toaster } from "@/components/ui/toaster";
import { useAtom } from "jotai";
import { viewState } from "./lib/store";

const App = () => {
  const [windowSize, setWindowSize] = useState<{ width: string; height: string }>({
    width: "100px",
    height: "100px",
  });
  const [showView, setShowView] = useAtom(viewState);

  useEffect(() => {
    const handleResize = (event: { width: string; height: string }) => {
      setWindowSize(prevSize => ({ ...prevSize, ...event }));
    };

    const initialSize = main.getWindowSize();
    setWindowSize(initialSize);

    main.on<{ width: string; height: string }>("window-resize", handleResize);
    main.on("console-log", (event): void => {
      console.log("From main: ", event);
    });

    return () => {
      main.off("window-resize", handleResize);
    };
  }, []);

  const handleToggleView = () => {
    setShowView(!showView);
    main.toggleBrowserView();
  };

  const appStyle: React.CSSProperties = {
    height: `${Number(windowSize.height) * 0.35}px`,
    width: `${Number(windowSize.width)}px`,
  };
  return (
    <>
      <DevTools />
      <div
        className="flex w-full flex-col"
        style={appStyle}
      >
        <div className="h-full w-full flex-auto">
          <div className="flex h-full w-full flex-col items-center justify-center space-y-4 overflow-x-auto bg-slate-50">
            <Controller />
          </div>
        </div>
      </div>
      <Button
        variant={"secondary"}
        className="fixed top-[36.5%]"
        onClick={handleToggleView}
      >
        view
      </Button>
      <Toaster />
      {/* <Sample /> */}
    </>
  );
};

export default App;
