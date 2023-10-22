import { useState, useEffect } from "react";
import { main, view } from "#preload";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { parseLectures } from "../logic/control-class";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { lectureColumns } from "@/lib/columns";
import { nanoid } from "nanoid";
import { Progress } from "../ui/progress";
import AutoPlay from "./AutoPlay";
import { Separator } from "../ui/separator";
import { useAtom } from "jotai";
import { classState, lectureState, playing } from "@/lib/store";
import type { Lecture } from "@/lib/store";

const Classroom = () => {
  const [lectures, setLectures] = useAtom(lectureState);
  const [isPlaying, setIsPlaying] = useAtom(playing);
  const [getClass] = useAtom(classState);
  const [windowVisible, setWindowVisible] = useState(false);

  useEffect(() => {
    const handleSetPlayer = (value: boolean) => setIsPlaying(value);
    main.on("set-player", handleSetPlayer);

    return () => {
      main.off("set-player", handleSetPlayer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadURL = async () => {
      const loaded = await view.go(getClass.url);
      console.log("🚀 ~ file: Classroom.tsx:33 ~ loadURL ~ loaded:", loaded);
      if (loaded) {
        if (!isPlaying) {
          setWindowVisible(false);
          setTimeout(() => {
            parseLectures("parse-lectures");
          }, 3000);
          main.on("parse-lectures", (event: Lecture[]) => {
            setLectures(event);
          });
        }
      }
    };
    loadURL();

    const handleParseLectures = (event: Lecture[]) => {
      setLectures(event);
    };
    main.on("parse-lectures", handleParseLectures);

    // 컴포넌트가 언마운트되거나 의존성 배열의 값이 변경될 때 실행될 클린업 함수
    return () => {
      main.off("parse-lectures", handleParseLectures);
    };
  }, [getClass.url, isPlaying, setLectures]);

  const handleToggleCurrentWindow = () => {
    setWindowVisible(!windowVisible);
    main.send("toggle-child-window");
  };

  const table = useReactTable({
    data: lectures,
    columns: lectureColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="h-full w-full p-4">
      <div className="mb-2 flex items-center justify-between">
        {isPlaying ? (
          <div className="flex items-center space-x-2">
            <Switch
              id="child-window-toggle"
              checked={windowVisible}
              onClick={handleToggleCurrentWindow}
            />
            <Label htmlFor="child-window-toggle">수업창</Label>
          </div>
        ) : (
          <div></div>
        )}
        {lectures.length > 1 && <AutoPlay />}
      </div>
      <Separator className="mb-2" />
      <Progress
        value={calculateAverageProgress(lectures)}
        className="mb-2"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={nanoid()}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={nanoid()}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={nanoid()}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={lectureColumns.length}
                  className="h-24 text-center"
                >
                  조회 결과가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Classroom;

function calculateAverageProgress(progressArray: Lecture[]) {
  const totalProgress = progressArray.reduce((sum, item) => sum + item.progress, 0);
  return totalProgress / progressArray.length;
}
