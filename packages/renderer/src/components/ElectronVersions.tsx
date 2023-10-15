import { versions } from "#preload";
import { Table, TableBody, TableRow, TableHead, TableCell, TableCaption } from "./ui/table";

const ElectronVersions = () => {
  return (
    <>
      <Table
        className="m-auto"
        id="process-versions"
        data-testid="process-versions"
      >
        <TableBody>
          {Object.entries(versions).map(({ "0": lib, "1": version }) => {
            return (
              <TableRow key={lib}>
                <TableHead className="text-right">{lib} :</TableHead>
                <TableCell className="text-left">v{version}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableCaption>
          <code>packages/renderer/src/components/ElectronVersions.tsx</code>
        </TableCaption>
      </Table>
    </>
  );
};
export default ElectronVersions;
