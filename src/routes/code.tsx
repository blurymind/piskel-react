import { createFileRoute } from "@tanstack/react-router";
import { useLocalStorage } from "@uidotdev/usehooks";

import RenderComponentFromString, { SplitView, View } from "../shared/components/RenderComponentFromString";

export const Route = createFileRoute("/code")({
  component: RouteComponent,
});

import { useRef } from "react";
import { initDataEditors, newTemplate } from "../shared/utils/initData.ts";
import { CodeEditor } from "../shared/components/CodeEditor.tsx";

function RouteComponent() {
  const [selected, setSelected] = useLocalStorage("selFrameCode", "piskel");
  const [code, setCode] = useLocalStorage<Record<string, string>>("framesCode", initDataEditors);
  const errorRef = useRef(null);
  function onChange(newValue: string) {
    setCode((prev) => ({ ...prev, [selected]: newValue }));
    errorRef.current?.resetErrorBoundary();
  }

  // todo https://blog.openreplay.com/resizable-split-panes-from-scratch/
  console.log(errorRef?.current);
  const onChangeSelected = (ev) => {
    setSelected(ev.target.value);
  };
  const onAddNew = () => {
    const ask = window.prompt("Add new code?", "NewFrame.tsx");
    if (ask) {
      if (ask in code) {
        alert(`${ask} already exists!`);
        return;
      }
      setCode((prev) => ({ ...prev, [ask]: newTemplate }));
      setTimeout(() => {
        setSelected(ask);
      }, 600);
    }
  };
  const onRemoveSelected = () => {
    const confirm = window.confirm(`Are you sure you want to remove ${selected}?`);
    if (confirm) {
      setCode((prev) => {
        const next = { ...prev };
        delete next[selected];
        setSelected(Object.keys(next)[0]);
        return next;
      });
    }
  };

  const selectedCode = code[selected];
  return (
    <div className="flex flex-1 h-full">
      {/*<ResizablePane minSize={20} initialSize={50} maxSize={80} isVertical={false}>*/}
      <SplitView direction="horizontal">
        <View minSize="200px" defaultSize="50%">
          <div className="flex flex-1 gap-3">
            <div className="flex flex-1 gap-3">
              <select onChange={onChangeSelected} defaultValue={selected}>
                {Object.keys(code).map((key) => (
                  <option value={key} key={key}>
                    {key}
                  </option>
                ))}
              </select>

              <button title="Add" onClick={onAddNew}>
                +
              </button>
              <button title="Remove" onClick={onRemoveSelected}>
                -
              </button>
              <button title="Rename" onClick={() => alert("todo")}>
                r
              </button>
            </div>
          </div>

          <CodeEditor selectedCode={selectedCode} onChange={onChange} />
        </View>
        {/*</ResizablePane>*/}
        {/*<ResizablePane minSize={20} initialSize={50} grow>*/}
        <View>
          <RenderComponentFromString errorRef={errorRef} selectedCode={selectedCode} />
        </View>
      </SplitView>
    </div>
  );
}
