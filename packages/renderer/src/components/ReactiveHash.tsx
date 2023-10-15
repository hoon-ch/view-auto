import { sha256sum } from "#preload";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const ReactiveHash = () => {
  const [rawString, setRawString] = useState("Hello World");
  const hashedString = sha256sum(rawString);

  return (
    <>
      <Table className="m-auto">
        <TableBody>
          <TableRow>
            <TableHead className="text-right">
              <Label htmlFor="reactive-hash-raw-value">Raw value :</Label>
            </TableHead>
            <TableCell className="text-left">
              <Input
                data-testid="reactive-hash-raw-value"
                id="reactive-hash-raw-value"
                value={rawString}
                onChange={e => setRawString(e.target.value)}
                type="text"
              />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableHead className="text-right">
              <Label htmlFor="reactive-hash-hashed-value">Hashed by node:crypto :</Label>
            </TableHead>
            <TableCell className="text-left">
              <Input
                data-testid="reactive-hash-hashed-value"
                id="reactive-hash-hashed-value"
                value={hashedString}
                readOnly
                type="text"
              />
            </TableCell>
          </TableRow>
        </TableBody>
        <TableCaption>
          <code>packages/renderer/src/components/ReactiveHash.tsx</code>
        </TableCaption>
      </Table>
    </>
  );
};
export default ReactiveHash;
