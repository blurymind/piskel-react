import { useLocalStorage } from "@uidotdev/usehooks";
import emmet from "emmet-core";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/ext-searchbox";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-tsx";
import "ace-builds/src-noconflict/mode-jsx";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-html";

import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/theme-monokai";

import Beautify from "ace-builds/src-noconflict/ext-beautify";
import Emmet from "ace-builds/src-noconflict/ext-emmet";
Emmet.isSupportedMode = () => true;
Emmet.setCore(emmet);

import { useRef, useState } from "react";

const modes = ["tsx", "jsx", "typescript", "javascript", "html", "css"];
const themes = ["default", "monokai", "dracula"];
export const CodeEditor = ({
  options = {
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    enableSnippets: true,
    showLineNumbers: true,
    tabSize: 2,
    enableAutoIndent: true,
    enableEmmet: true,
  },
  selectedCode,
  onChange,
  mode = "tsx",
  theme = "monokai",
}: any) => {
  const [userMode, setUsedMode] = useState(mode);
  const [userTheme, setUserTheme] = useState(theme);
  const [tabSize, setTabSize] = useLocalStorage<number>("tabSize", 2);
  const editorRef = useRef(null);

  const onPrettier = () => {
    if (editorRef.current?.editor) {
      Beautify.beautify(editorRef.current?.editor.getSession());
    }
  };

  return (
    <div className="flex flex-1 h-full flex-col relative" style={{ height: "calc(100% - 25px)" }}>
      <AceEditor
        mode={userMode}
        theme={userTheme}
        value={selectedCode}
        onChange={onChange}
        editorProps={{ $blockScrolling: true }}
        tabSize={tabSize}
        style={{ width: "100%", height: "100%" }}
        ref={editorRef}
        commands={options.enableEmmet ? Emmet.commands : Beautify.commands}
        setOptions={options}
      />
      <div className="flex-auto flex absolute bottom-0 right-0 mb-3 gap-2">
        <select onChange={(ev) => setUsedMode(ev.target.value)} defaultValue={userMode}>
          {modes.map((mode) => (
            <option value={mode} key={mode}>
              {mode}
            </option>
          ))}
        </select>
        <select onChange={(ev) => setUserTheme(ev.target.value)} defaultValue={userTheme}>
          {themes.map((theme) => (
            <option value={theme} key={theme}>
              {theme}
            </option>
          ))}
        </select>
        <button
          title="Format (Ctrl+Shift+B)"
          className="mx-4 px-3 border-1 border-orange-500 hover:border-orange-300 rounded-md"
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
          className="min-w-5 border-1 border-orange-500 hover:border-orange-300 rounded-md px-2 mx-1"
        />
      </div>
    </div>
  );
};
