import ErrorBoundary from "./ErrorBoundary.tsx";
import StringToReactComponent from "string-to-react-component";
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

const babelOptions = {
  filename: "counter.ts",
  presets: ["react", ["typescript", { allExtensions: true, isTSX: true }]],
};
const data = { useCallback, useEffect, useImperativeHandle, useRef, useState };
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

export default RenderComponentFromString;
