import { createFileRoute } from "@tanstack/react-router";
import StringToReactComponent from "string-to-react-component";
import { useLocalStorage } from "@uidotdev/usehooks";

import ErrorBoundary from "../shared/components/ErrorBoundary";
import RenderComponentFromString from "../shared/components/RenderComponentFromString";
import { ResizablePane } from "../shared/components/Resizable";

export const Route = createFileRoute("/code")({
  component: RouteComponent,
});

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/ext-beautify";

import { useRef } from "react";
import { initDataEditors, newTemplate } from "../shared/utils/initData.ts";

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
    <div className="flex flex-1 h-full w-full">
      <ResizablePane minSize={20} initialSize={50} maxSize={80} isVertical={false}>
        <div className="flex flex-1 gap-3">
          <select onChange={onChangeSelected} defaultValue={selected}>
            {Object.keys(code).map((key) => (
              <option value={key} key={key}>
                {key}
              </option>
            ))}
          </select>
          <button onClick={onAddNew}>+</button>
          <button onClick={onRemoveSelected}>-</button>
        </div>
        <AceEditor
          mode="typescript"
          theme="dracula"
          value={selectedCode}
          onChange={onChange}
          name="UNIQUE_ID_OF_DIV"
          editorProps={{ $blockScrolling: true }}
          style={{ width: "100%", height: "100%" }}
        />
      </ResizablePane>
      <ResizablePane minSize={20} initialSize={50} grow>
        <RenderComponentFromString errorRef={errorRef} selectedCode={selectedCode} />
      </ResizablePane>
    </div>
  );
}
