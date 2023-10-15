import ElectronVersions from "@/components/ElectronVersions";
import ReactiveCounter from "@/components/ReactiveCounter";
import ReactiveHash from "@/components/ReactiveHash";
import ElectronLogo from "../assets/electronjs.svg";
import ViteLogo from "../assets/logo.svg";
import ReactLogo from "../assets/react.svg";
import TailwindLogo from "../assets/tailwindcss.svg";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const APP_VERSION = import.meta.env.VITE_APP_VERSION;

const App = () => {
  return (
    <div className="mx-auto my-16 max-w-xl text-center font-sans text-[#2c3e50]">
      <div className="mx-auto flex justify-evenly">
        <img
          alt="Electron logo"
          src={ElectronLogo}
          width="170"
        />
        <img
          alt="Vite logo"
          src={ViteLogo}
          width="150"
        />
        <img
          alt="React logo"
          src={ReactLogo}
          width="150"
        />
        <img
          alt="Tailwind logo"
          src={TailwindLogo}
          width="150"
        />
      </div>

      <h2 className="mb-4 text-3xl font-bold tracking-tight">
        {/* Example how to inject current app version to UI */}
        App version: {APP_VERSION}
      </h2>

      <Label>
        For a guide and recipes on how to configure / customize this project,
        <br />
        check out the &nbsp;
        <a
          href="https://github.com/cawa-93/vite-electron-builder"
          target="_blank"
          rel="noreferrer"
        >
          vite-electron-builder documentation
        </a>
        .
      </Label>

      <div className="my-4 flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Test React Reactivity</CardTitle>
            <CardDescription>Counter</CardDescription>
          </CardHeader>
          <CardContent>
            <ReactiveCounter />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Node.js API</CardTitle>
            <CardDescription>Hash</CardDescription>
          </CardHeader>
          <CardContent>
            <ReactiveHash />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment</CardTitle>
          </CardHeader>
          <CardContent>
            <ElectronVersions />
          </CardContent>
        </Card>
      </div>

      <Label>
        Edit &nbsp;
        <code className=" bg-slate-100 px-1">packages/renderer/src/App.tsx</code> to test hot module
        replacement.
      </Label>
    </div>
  );
};

export default App;
