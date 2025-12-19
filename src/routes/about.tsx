import { createFileRoute } from "@tanstack/react-router";
import StringToReactComponent from "string-to-react-component";

import ErrorBoundary from "../shared/components/ErrorBoundary";
import { ResizablePane } from "../shared/components/Resizable";

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

import react, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

window.useRef = useRef;
window.useCallback = useCallback;
window.useEffect = useEffect;
window.useImperativeHandle = useImperativeHandle;
window.useMemo = useMemo;
// https://dev-javascript.github.io/string-to-react-component/#/Using%20Unknown%20Elements
// https://github.com/blurymind/YarnClassic/blob/ce8052b977da6dcb02936c6d52d9edcb2003bc3c/src/public/plugins/plugin-editor.js#L259
//https://codesandbox.io/p/sandbox/acediff-react-570dc?file=%2Fsrc%2FAceEditor.js
const initCode = `({
  piskelAppPath = "piskel/dest/prod/index.html",
  ref,
  piskelFile = {
    modelVersion: 2,
    piskel: {
      name: "Imported piskel",
      description: "",
      fps: 12,
      height: 50,
      width: 50,
      layers: [
        '{"name":"Layer 1","frameCount":25,"base64PNG":"data:image/png;base64,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"}',
      ],
    },
  },
  hideHeader = false,
}) => {
    
  const piskelRef = useRef(null);

  const getPiskel = () => piskelRef.current?.contentWindow?.pskl;
  const loadSprite = useCallback((sprite) => {
    const pskl = getPiskel();
    if (!pskl || !sprite) return;
    const app = pskl.app;
    const fps = sprite.piskel.fps;
    const piskel = sprite.piskel;
    const descriptor = new pskl.model.piskel.Descriptor(piskel.name, piskel.description, true);
    pskl.utils.serialization.Deserializer.deserialize(sprite, function (piskel) {
      piskel.setDescriptor(descriptor);
      app.piskelController.setPiskel(piskel);
      // app.previewController.previewActionsController.piskelController.setFPS(fps);
    });
    console.log({ app, fps });
  }, []);

  useEffect(() => {
    console.log("load prop changed", { piskelFile });
    if (piskelFile) {
      loadSprite(piskelFile);
    }
  }, [piskelFile]);

  useImperativeHandle(ref, () => {
    return {
      loadSprite,
      getPiskel,
    };
  }, []);

  const onLoadPiskelApp = () => {
    const innerDoc = piskelRef.current?.contentDocument || piskelRef.current?.contentWindow.document;
    innerDoc?.getElementById("dialog-container-wrapper")?.remove();

    innerDoc?.querySelector(".new-piskel-desktop")?.remove();
    if (hideHeader) {
      const wrapper = innerDoc.getElementById("main-wrapper");
      if (wrapper) {
        wrapper.style.top = "0px";
        wrapper.style.marginTop = "0px";
      }
      innerDoc?.querySelector(".fake-piskelapp-header")?.remove();
    }
    loadSprite(piskelFile);
  };

  // todo onSave callback
  // todo changes indicator
  // todo trigger save via ref, expose piskel's api to parent
  // todo move piskel zoom to state and persist it?
  // todo onSave callback is needed to get the data out and use it elsewhere
  return (
    <div style={{ height: "100%" }}>
      <iframe
        width="100%"
        height="100%"
        ref={piskelRef}
        className="editor-frame"
        src={piskelAppPath}
        onLoad={onLoadPiskelApp}
      />
    </div>
  );
}`;

const data = { useCallback, useEffect, useImperativeHandle, useRef, useState };
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
    <div className="flex flex-1 h-full w-full">
      <ResizablePane minSize={20} initialSize={50} maxSize={80} isVertical={false}>
        <AceEditor
          mode="typescript"
          theme="dracula"
          value={code}
          onChange={onChange}
          name="UNIQUE_ID_OF_DIV"
          editorProps={{ $blockScrolling: true }}
          style={{ width: "100%" }}
        />
      </ResizablePane>
      <ResizablePane minSize={20} initialSize={50} grow>
        <ErrorBoundary ref={errorRef} onError={(error) => console.log("onErr", { error })} fallback={<p>Error:</p>}>
          <StringToReactComponent babelOptions={babelOptions} data={data}>
            {code}
          </StringToReactComponent>
        </ErrorBoundary>
      </ResizablePane>
    </div>
  );
}
