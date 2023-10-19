import { useState, useEffect } from "react";
import { main } from "#preload";
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

interface Lecture {
  status: "pending" | "processing" | "done";
  idx: number;
  title: string;
  progress: number;
  learningTime: string;
  recent: string;
}

const Classroom = () => {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [studyState, setStudyState] = useState(false);
  const [windowVisible, setWindowVisible] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      parseLectures("parse-lectures");
    }, 1000);
    main.on("parse-lectures", (event: Lecture[]) => {
      setLectures(event);
    });
  }, []);

  main.on("start-study", (value: unknown) => setStudyState(value as boolean));

  const handleToggleCurrentWindow = () => {
    setWindowVisible(!windowVisible);
    main.send("toggle-child-window");
  };

  useEffect(() => {
    console.log(lectures);
  }, [lectures]);

  const table = useReactTable({
    data: lectures,
    columns: lectureColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full p-4">
      {studyState && (
        <div className="flex items-center space-x-2">
          <Switch
            id="child-window-toggle"
            checked={windowVisible}
            onClick={handleToggleCurrentWindow}
          />
          <Label htmlFor="child-window-toggle">수업창</Label>
        </div>
      )}
      <Progress
        value={calculateAverageProgress(lectures)}
        className="my-2"
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
