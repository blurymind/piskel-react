import { createFileRoute } from "@tanstack/react-router";
import StringToReactComponent from "string-to-react-component";

import ErrorBoundary from "../shared/components/ErrorBoundary";
import {ResizablePane} from "../shared/components/Resizable";

export const Route = createFileRoute("/about")({
  component: RouteComponent,
});

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/ext-beautify";

import react, { useRef, useState } from "react";

// https://dev-javascript.github.io/string-to-react-component/#/Using%20Unknown%20Elements
// https://github.com/blurymind/YarnClassic/blob/ce8052b977da6dcb02936c6d52d9edcb2003bc3c/src/public/plugins/plugin-editor.js#L259
//https://codesandbox.io/p/sandbox/acediff-react-570dc?file=%2Fsrc%2FAceEditor.js
const initCode = `(props)=>{
         const [counter,setCounter]=React.useState(0);
         const increase=()=>{
           setCounter(counter+1);
         };
         return (<>
           <button onClick={increase}>+</button>
           <span style={{padding:'0px 10px'}}>{'count : '+ counter}</span>
           </>);
       }`;

const babelOptions = {
  filename: "counter.ts",
  presets: ["react", ["typescript", { allExtensions: true, isTSX: true }]],
};
function RouteComponent() {
  const [code, setCode] = useState<string>(initCode);
  const errorRef = useRef(null);
  function onChange(newValue: string) {
    setCode(newValue);
    errorRef.current?.resetErrorBoundary();
  }


  // todo https://blog.openreplay.com/resizable-split-panes-from-scratch/
  console.log(errorRef?.current);
  return (
    <div>
      <ResizablePane
        minSize={20}
        initialSize={50}
        maxSize={80}
        isVertical={false}
      >

      <AceEditor
        mode="typescript"
        theme="dracula"
        value={code}
        onChange={onChange}
        name="UNIQUE_ID_OF_DIV"
        editorProps={{ $blockScrolling: true }}
        style={{width: "100%"}}
      />
      </ResizablePane>

      <ErrorBoundary
        ref={errorRef}
        onError={(error) => console.log("onErr", { error })}
        fallback={<p>Error:</p>}
      >
        <StringToReactComponent babelOptions={babelOptions}>{code}</StringToReactComponent>
      </ErrorBoundary>
    </div>
  );
}
