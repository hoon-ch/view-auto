import { versions } from "#preload";

const ElectronVersions = () => {
  return (
    <>
      <table
        className="m-auto"
        id="process-versions"
        data-testid="process-versions"
      >
        <tbody>
          {Object.entries(versions).map(({ "0": lib, "1": version }) => {
            return (
              <tr key={lib}>
                <th className="text-right">{lib} :</th>
                <td className="text-left">v{version}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <code>packages/renderer/src/components/ElectronVersions.tsx</code>
    </>
  );
};
export default ElectronVersions;
