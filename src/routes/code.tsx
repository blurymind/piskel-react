import { createFileRoute } from "@tanstack/react-router";
import { useLocalStorage } from "@uidotdev/usehooks";

import RenderComponentFromString, { SplitView, View } from "../shared/components/RenderComponentFromString";

export const Route = createFileRoute("/code")({
  component: RouteComponent,
});

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/ext-searchbox";
import "ace-builds/src-noconflict/ext-language_tools";
// import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-tsx";
import "ace-builds/src-noconflict/mode-jsx";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/theme-monokai";

import Beautify from "ace-builds/src-noconflict/ext-beautify";

import { useEffect, useRef } from "react";
import { initDataEditors, newTemplate } from "../shared/utils/initData.ts";

function RouteComponent() {
  const [selected, setSelected] = useLocalStorage("selFrameCode", "piskel");
  const [code, setCode] = useLocalStorage<Record<string, string>>("framesCode", initDataEditors);
  const [tabSize, setTabSize] = useLocalStorage<number>("tabSize", 2);
  const errorRef = useRef(null);
  const editorRef = useRef(null);
  function onChange(newValue: string) {
    setCode((prev) => ({ ...prev, [selected]: newValue }));
    errorRef.current?.resetErrorBoundary();
  }

  const onPrettier = () => {
    if (editorRef.current?.editor) {
      // editorRef.current?.editor.getSession().setMode("ace/mode/tsx");
      console.log("Prettier", editorRef.current.editor, Beautify);
      Beautify.beautify(editorRef.current?.editor.getSession());
    }
  };

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
  console.log({ tabSize });
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
            <div className="flex-auto flex">
              <button
                title="Format (Ctrl+Shift+B)"
                className="mx-4 px-3  border-1 border-orange-500"
                onClick={onPrettier}
              >
                --format
              </button>
              <div>indent:</div>
              <input
                value={tabSize}
                onChange={(ev) => setTabSize(parseInt(ev.target.value))}
                type="number"
                min={1}
                max={16}
                className="min-w-5 ml-3"
              />
            </div>
          </div>

          <AceEditor
            mode="tsx"
            // id="my-ace"
            theme="monokai"
            value={selectedCode}
            onChange={onChange}
            // name="UNIQUE_ID_OF_DIV"
            editorProps={{ $blockScrolling: true }}
            tabSize={tabSize}
            style={{ width: "100%", height: "calc(100% - 25px)" }}
            ref={editorRef}
            commands={Beautify.commands}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: true,
              showLineNumbers: true,
              tabSize: 2,
              enableAutoIndent: true,
              enableEmmet: true,
            }}
          />
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
