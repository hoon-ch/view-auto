/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Sample from "@/components/sample/Sample";
import type React from "react";
import { useEffect, useState } from "react";
import Controller from "@/components/pages/Controller";
import { DevTools } from "jotai-devtools";
import { Button } from "./components/ui/button";
import { main } from "#preload";

const App = () => {
  const [windowSize, setWindowSize] = useState<{ width: string; height: string }>({
    width: "100px",
    height: "100px",
  });

  useEffect(() => {
    const handleResize = (event: { width: string; height: string }) => {
      setWindowSize(prevSize => ({ ...prevSize, ...event }));
    };

    const initialSize = main.getWindowSize();
    setWindowSize(initialSize);

    main.on<{ width: string; height: string }>("window-resize", handleResize);

    return () => {
      main.off("window-resize", handleResize);
    };
  }, []);

  const handleToggleView = () => {
    main.toggleBrowserView();
  };

  const appStyle: React.CSSProperties = {
    height: `${Number(windowSize.height) * 0.2}px`,
    width: `${Number(windowSize.width)}px`,
  };
  return (
    <>
      <DevTools isInitialOpen />
      <div
        className="flex w-full flex-col"
        style={appStyle}
      >
        <div className="flex-auto">
          <div className="flex h-full w-full flex-col items-center justify-center space-y-4 overflow-x-auto bg-slate-100">
            <Controller />
          </div>
        </div>
      </div>
      <Button
        className=" fixed left-2 top-[25%]"
        onClick={handleToggleView}
      >
        view
      </Button>
      <Sample />
    </>
  );
};

export default App;
