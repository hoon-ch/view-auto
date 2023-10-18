import type React from "react";
import Login from "./Login";
import { useAtom } from "jotai";
import { appState, classState } from "@/lib/store";
import ListView from "./ListView";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { view } from "#preload";

const Controller: React.FC = () => {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const [state, setAppState] = useAtom(appState);
  const [classItem] = useAtom(classState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.isLogin === "success") {
      toast({
        variant: "success",
        title: "로그인 성공",
        description: "성공적으로 로그인 되었습니다.",
      });
      setTimeout(() => {
        view.go("https://www.lcampus.co.kr/_StyleBox4/My_Campus/index.php");
      }, 500);
    } else if (state.isLogin === "failed") {
      toast({
        variant: "destructive",
        title: "로그인 실패",
        description: "아이디, 비밀번호 확인 후 다시 시도해주세요.",
      });
    }
  }, [state.isLogin, toast]);

  useEffect(() => {
    if (state.isSelected) {
      toast({
        title: "수강을 시작합니다",
        description: classItem.title,
      });
    }
  }, [state.isSelected, classItem, toast]);

  // TODO: Implement control and view logic based on appState
  if (state.isLogin === "failed" || state.isLogin === "none") return <Login />;
  if (state.isLogin === "success" && !state.isSelected) return <ListView />;
  if (state.isLogin === "success" && state.isSelected) return <></>;
};

export default Controller;
