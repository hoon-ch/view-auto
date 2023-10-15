import ElectronVersions from "@/components/ElectronVersions";
import ReactiveCounter from "@/components/ReactiveCounter";
import ReactiveHash from "@/components/ReactiveHash";
import ElectronLogo from "../assets/electronjs.svg";
import ViteLogo from "../assets/logo.svg";
import ReactLogo from "../assets/react.svg";
import TailwindLogo from "../assets/tailwindcss.svg";

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

      <p>
        {/* Example how to inject current app version to UI */}
        App version: {APP_VERSION}
      </p>

      <p>
        For a guide and recipes on how to configure / customize this project,
        <br />
        check out the
        <a
          href="https://github.com/cawa-93/vite-electron-builder"
          target="_blank"
          rel="noreferrer"
        >
          vite-electron-builder documentation
        </a>
        .
      </p>

      <fieldset className="m-8 p-4">
        <legend>Test React Reactivity</legend>
        <ReactiveCounter />
      </fieldset>

      <fieldset className="m-8 p-4">
        <legend>Test Node.js API</legend>
        <ReactiveHash />
      </fieldset>

      <fieldset className="m-8 p-4">
        <legend>Environment</legend>
        <ElectronVersions />
      </fieldset>

      <p>
        Edit
        <code>packages/renderer/src/App.tsx</code> to test hot module replacement.
      </p>
    </div>
  );
};

export default App;
