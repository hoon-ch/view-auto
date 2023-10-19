import type { CellContext, ColumnDef } from "@tanstack/react-table";

export type Lecture = {
  status: "pending" | "processing" | "done";
  idx: number;
  title: string;
  progress: number;
  learningTime: string;
  recent: string;
};

export const lectureColumns: ColumnDef<Lecture>[] = [
  {
    accessorKey: "status",
    header: "상태",
    cell: (props: CellContext<Lecture, unknown>) => {
      if (props.row.original.status === "pending") {
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 text-gray-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      } else if (props.row.original.status === "processing") {
        return (
          <div
            className=" inline-block h-5 w-5 animate-spin rounded-full border-4 border-solid border-yellow-400 border-r-transparent align-[-0.125em] text-yellow-600 motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              processing...
            </span>
          </div>
        );
      } else if (props.row.original.status === "done") {
        return (
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
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      }
      return null;
    },
  },

  {
    accessorKey: "idx",
    header: "No",
  },
  {
    accessorKey: "title",
    header: "강의명",
  },
  {
    accessorKey: "progress",
    header: "진도율",
  },
  {
    accessorKey: "learningTime",
    header: "학습시간",
  },
  {
    accessorKey: "recent",
    header: "최근학습일",
  },
];
