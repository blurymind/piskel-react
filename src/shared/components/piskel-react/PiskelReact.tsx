import { memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import "./index.css";
import { useLocalStorage } from "@uidotdev/usehooks";
import { Popover } from "react-tiny-popover";
import { ToastContainer, toast } from "react-toastify";
import Menu from "../Menu";
import FileImport from "./file-import";

import { createImagesFromSheet, downloadZip, sprites, usePiskel } from "./utils";
// copy of src/shared/components/piskel-react/piskel/dest/prod/index.html
export const PiskelReact = ({ piskelAppPath = "piskel/dest/prod/index.html", ref, piskelFile, hideHeader = true }) => {
  const [currentName, setCurrentName] = useLocalStorage("currentPiskelName", "");
  const [piskels, setPiskels] = useLocalStorage("piskels", {
    mario: { label: sprites.mario.piskel.name, src: sprites.mario },
  });
  const currentPiskel = piskels[currentName];
  const [isImporterOpen, setIsImporterOpen] = useState(false);

  const piskelRef = useRef(null);
  const {
    getPiskel,
    loadPSprite,
    savePiskel,
    createNewPiskel,
    openSettings,
    initPiskelApp,
    getPiskelData,
    getLayersAsImages,
    loadImageFramesIntoPiskel,
  } = usePiskel({ piskelRef });

  const loadSprite = useCallback(
    (sprite) => {
      loadPSprite(sprite);
      setCurrentName(sprite.piskel.name);
    },
    [setCurrentName],
  );

  // todo https://github.com/4ian/GDevelop/blob/94b980313b7ac851610e12a55f767dcfc3316d4c/newIDE/app/public/external/piskel/piskel-main.js#L122
  const onSavePiskel = () => {
    const { src, name } = savePiskel();
    console.log({ src, name });
    setPiskels((prev) => ({
      ...prev,
      [name]: {
        label: name,
        src,
      },
    }));
  };
  console.log({ piskels });

  useEffect(() => {
    console.log("load prop changed", { piskelFile });
    if (piskelFile) {
      loadSprite(piskelFile);
    } else {
      // loadSprite(editedPiskel);
    }
    const onPointerUp = (e) => {
      console.log(e);
    };
    window.addEventListener("mouseup", onPointerUp);
    return () => {
      window.removeEventListener("mouseup", onPointerUp);
    };
  }, []);

  useImperativeHandle(ref, () => {
    return {
      loadSprite,
      getPiskel,
    };
  }, []);

  const onLoadPiskelApp = () => {
    initPiskelApp(hideHeader);
    loadSprite(currentPiskel?.src ?? piskelFile ?? sprites.mario);
  };

  const createEmptyAnimation = () => {
    const name = prompt("Create new file? ", "newPiskel");
    if (!name) return;
    if (name === currentName) {
      alert("Cant have two " + name);
      return;
    }
    createNewPiskel(name);
    openSettings();
    setCurrentName(name);
  };

  const onSelectFile = (item) => {
    onSavePiskel();
    loadSprite(item.src);
  };

  const onCloseFile = (sprite) => {
    const confirmation = confirm("This will close " + sprite.label);
    if (!confirmation) return;
    if (!(sprite.label in piskels)) return;

    const nextPiskels = { ...piskels };
    delete nextPiskels[sprite.label];

    const piskelsVals = Object.values(nextPiskels);

    if (piskelsVals.length === 0) {
      createEmptyAnimation();
      return;
    }
    const next = piskelsVals[0];
    if (!next) return;
    loadSprite(next.src);
    setTimeout(() => {
      setPiskels(nextPiskels);
    }, 100);
  };

  const onCopyToClip = () => {
    navigator.clipboard.writeText(JSON.stringify(getPiskelData())).then(
      () => {
        console.log(getPiskelData());
      },
      () => {
        alert("failed to copy");
      },
    );
  };

  const onPasteClip = () => {
    navigator.clipboard.readText().then((clipText) => {
      try {
        const data = JSON.parse(clipText);
        console.log({ data });
        // todo remove, it pauses the window
        const promptName = prompt("What should we call the pasted sprite? ", data.piskel.name);
        if (promptName) {
          if (promptName in piskels) {
            alert("name is already taken");
            return;
          }
          data.piskel.name = promptName;
          setPiskels((prev) => ({
            ...prev,
            [promptName]: {
              label: promptName,
              src: data,
            },
          }));
        }
        // alert("todo")
      } catch (e) {
        console.error(e);
      }
    });
  };

  const onConfirmImportedFile = (importData, fileName, cutSprite) => {
    if (importData.imageFrames.length === 1) {
      console.log({ importData });
      const newImportData = createImagesFromSheet(importData.imageFrames[0], cutSprite);
      console.log({ newImportData });
      importData = newImportData;
      // return;
    }
    console.log({ importData });
    const piskelFile = loadImageFramesIntoPiskel(importData, fileName);
    setCurrentName(fileName);
    setIsImporterOpen(false);
    setPiskels((prev) => ({
      ...prev,
      [fileName]: {
        label: fileName,
        src: piskelFile,
      },
    }));
  };

  const onExportZippedLayers = () => {
    onSavePiskel();
    getLayersAsImages().then(({ imageLayers, piskel, rows, columns }) => {
      console.log({ imageLayers });
      downloadZip(imageLayers, currentPiskel.label, {
        piskel,
        rows,
        columns,
        kaplay: { [piskel.name]: { from: 0, to: columns, speed: piskel.fps } },
      });
    });
  };

  return (
    <div style={{ height: "100%", width: "100%" }} onPointerCancel={() => console.log("missed")}>
      <div className="absolute top-10 rounded-sm w-20 overflow-hidden h-50 bg-gray-600/20">
        <div className="flex flex-1 gap-3 m-2 flex-col">
          <button title="Save piskel" className="hover:bg-gray-500" onClick={onSavePiskel}>
            Save
          </button>
          <button className="hover:bg-gray-500" onClick={createEmptyAnimation}>
            New
          </button>

          <button title="Paste piskel data from clipboard" className="hover:bg-gray-500" onClick={onPasteClip}>
            Paste
          </button>
        </div>
      </div>

      <div className="z-50 gap-1 flex flex-col absolute bottom-10 rounded-sm w-24 overflow-hidden h-50">
        <div className="pl-2">File:</div>
        <div className=" pl-2 bg-gray-700 w-50 overflow-hidden" style={{ whiteSpace: "nowrap" }} title={currentName}>
          {currentName}
        </div>
        <button title="Copy piskel data to cliboard" className="  hover:bg-gray-500" onClick={onCopyToClip}>
          Copy
        </button>
        {/* <Menu
          // selected={currentName}
          // onClose={onCloseFile}
          onSelect={onSelectFile}
          label="Export"
          items={[{ label: "Zipped layer spritesheets" }]}
        /> */}
        <button title="Export zipped layers" className="  hover:bg-gray-500" onClick={onExportZippedLayers}>
          Export layers
        </button>
      </div>

      <div className="absolute left-0 top-46 bg-gray-900 overflow-hidden">
        <Popover
          isOpen={isImporterOpen}
          onClickOutside={() => setIsImporterOpen(false)}
          clickOutsideCapture
          transform={{ top: 20, left: 1 }}
          transformMode="relative"
          positions={["top", "left", "bottom", "right"]} // preferred positions by priority
          content={
            <div>
              <FileImport onCancel={() => setIsImporterOpen(false)} onImport={onConfirmImportedFile} />
            </div>
          }
        >
          <div
            className="p-2"
            // onPointerEnter={() => setIsImporterOpen(true)}
            onClick={() => setIsImporterOpen(!isImporterOpen)}
            onDragEnter={() => setIsImporterOpen(true)}
            title="Drag and drop files here"
          >
            [Import]
          </div>
        </Popover>
      </div>
      <div className="absolute top-0 m-2">
        <Menu
          selected={currentName}
          onClose={onCloseFile}
          onSelect={onSelectFile}
          label={`Open (${Object.values(piskels).length})`}
          items={Object.values(piskels)}
        />
      </div>

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
};
export default memo(PiskelReact);
