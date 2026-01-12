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
  console.log({ props });
  return (
    <div
      className="absolute"
      style={{ [props.direction === "horizontal" ? "left" : "top"]: props.currentSize - 30, zIndex: 999 }}
    >
      <div
        {...props}
        style={{ ...props.style, background: "blue", width: 40 }}
        className="relative text-center rounded-sm"
      >
        ||
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

export const ReusableComponents = { SplitView, View: Pane, AceEditor, PiskelReact };

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
