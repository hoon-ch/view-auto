import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "../ui/label";

const ReactiveCounter = () => {
  const [count, setCount] = useState(0);

  return (
    <>
      <Button
        data-testid="button"
        onClick={() => setCount(c => c + 1)}
      >
        {" "}
        count is: {count}
      </Button>
      <br />
      <br />
      <Label>
        <code>packages/renderer/src/components/ReactiveCounter.tsx</code>
      </Label>
    </>
  );
};
export default ReactiveCounter;
