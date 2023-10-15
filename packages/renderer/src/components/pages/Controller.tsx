import type React from "react";
import Login from "./Login";
import { useAtom } from "jotai";
import { appState } from "@/lib/store";
import ListView from "./ListView";

const Controller: React.FC = () => {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const [state, setAppState] = useAtom(appState);
  // TODO: Implement control and view logic based on appState
  if (state.isLogin && !state.isScan) return <ListView />;
  else {
    return <Login />;
  }
};

export default Controller;
