import { createFileRoute } from "@tanstack/react-router";
import { useLocalStorage } from "@uidotdev/usehooks";
import { initDataEditors } from "../shared/utils/initData.ts";
import RenderComponentFromString from "../shared/components/RenderComponentFromString.tsx";
import { useRef } from "react";

export const Route = createFileRoute("/editors")({
  component: RouteComponent,
});

function RouteComponent() {
  const errorRef = useRef(null);
  const [code] = useLocalStorage<Record<string, string>>("framesCode", initDataEditors);
  console.log({ code });
  const [selected, onSelect] = useLocalStorage<string>("selectedEditorTab", "piskel");
  const selectedCode = code[selected];
  return (
    <div className="flex flex-1 h-full w-full flex-col">
      <div className="flex gap-3 border-b-amber-600 border-b-1 p-2">
        {Object.keys(code).map((key) => (
          <div key={key} onClick={() => onSelect(key)} className={`${key === selected ? "text-amber-600" : ""}`}>
            {key.split(".")[0]}
          </div>
        ))}
      </div>
      <div className="h-full w-full">
        <RenderComponentFromString errorRef={errorRef} selectedCode={selectedCode} />
      </div>
    </div>
  );
}
