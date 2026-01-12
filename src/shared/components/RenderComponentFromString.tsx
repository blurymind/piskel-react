import ErrorBoundary from "./ErrorBoundary.tsx";
import StringToReactComponent from "string-to-react-component";
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Pane, SplitPane } from "react-split-pane";
import { useLocalStorage } from "@uidotdev/usehooks";

const babelOptions = {
  filename: "counter.ts",
  presets: ["react", ["typescript", { allExtensions: true, isTSX: true }]],
};

function CustomDivider(props: any) {
  // console.log({ props });
  const isHorizontal = props.direction === "horizontal";
  return (
    <div
      className="absolute h-full"
      style={{
        // [isHorizontal ? "left" : "top"]: props.currentSize - 30,
        zIndex: 999,
        width: props.isDragging ? window.innerWidth : undefined,
        // height: props.isDragging ? window.innerHeight - 50 : 40,
      }}
    >
      <div
        {...props}
        style={{
          ...props.style,
          // background: "b",
          // width: 40,
          [isHorizontal ? "left" : "top"]: props.currentSize,
        }}
        className="place-content-center relative text-center rounded-sm h-full w-1 hover:w-3 hover:bg-blue-500/20 bg-blue-500/10 items-center"
      >
        {isHorizontal ? "|" : "--"}
      </div>
    </div>
  );
}

export const SplitView = ({ direction, children, divider, ...props }: any) => {
  return (
    <SplitPane direction={direction} {...props} divider={divider ?? CustomDivider}>
      {children}
    </SplitPane>
  );
};
import AceEditor from "react-ace";
import { PiskelReact } from "./piskel-react/PiskelReact.tsx";
import { CodeEditor } from "./CodeEditor.tsx";
export const ReusableComponents = { SplitView, View: Pane, AceEditor, PiskelReact, CodeEditor, ErrorBoundary };

const data = {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useLocalStorage,
  import: ReusableComponents,
};

window.useRef = useRef;
window.useCallback = useCallback;
window.useEffect = useEffect;
window.useImperativeHandle = useImperativeHandle;
window.useMemo = useMemo;
const RenderComponentFromString = ({ selectedCode, errorRef }: any) => {
  return (
    <ErrorBoundary ref={errorRef} onError={(error) => console.log("onErr", { error })} fallback={<p>Error:</p>}>
      <StringToReactComponent babelOptions={babelOptions} data={data}>
        {selectedCode}
      </StringToReactComponent>
    </ErrorBoundary>
  );
};

export { Pane as View };
export default RenderComponentFromString;
