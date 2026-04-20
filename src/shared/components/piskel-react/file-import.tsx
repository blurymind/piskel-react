import { useLocalStorage } from "@uidotdev/usehooks";
import Jszip from "jszip";
// import { Image as WebpImage } from "node-webpmux";
import { memo, useCallback, useRef, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { SpriteAnimator } from "react-sprite-animator";
// import { toast } from "react-toastify";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import { decodeAnimation } from "wasm-webp";

import SpriteCutter from "./sprite-cutter";
import { createSheetFromImages, getImagesFromFiles, getImagesFromWebPFrames, isSupportedFormat } from "./utils";

console.log({ decodeAnimation });

// console.log({ xMux });
const buttonClass = "border-1 border-gray-400 px-2 rounded-sm opacity-70 hover:opacity-90";
export const FileImport = ({ onCancel, onImport }) => {
  const spritePrevRef = useRef(null);
  const [newFileName, setNewFileName] = useState("");
  const [draggedFiles, setDraggedFiles] = useState(null);
  const [cutSprite, setCutSprite] = useLocalStorage("cutSprite", { col: 1, row: 1 });
  const [zoom, setZoom] = useLocalStorage("zoomLevelImport", 1);
  const [fps, setFps] = useLocalStorage("preferredImportFps", 12);
  const [isPaused, setIsPaused] = useState(false);
  const [frame, setFrame] = useState(0);

  const onConfirmDraggedFile = () => {
    onImport(draggedFiles, newFileName, cutSprite);
  };

  const handleDropFile = (inFiles) => {
    console.log(Object.values(inFiles));
    const firstFile = Object.values(inFiles).find(isSupportedFormat);
    if (!firstFile) {
      return;
    }
    const reader = new FileReader();
    const [fileName, extension] = firstFile?.name?.split(".");

    // const onSetImages = () => {}
    console.log({ extension, inFiles });
    if (extension.toLowerCase() === "zip") {
      reader.addEventListener("load", () => {
        const zip = new Jszip();
        zip.loadAsync(reader.result.split(",")[1], { base64: true }).then((zipData) => {
          console.log({ zipData });
          getImagesFromFiles(zipData.files).then(({ imageFrames, maxWidth, maxHeight }) => {
            setNewFileName(fileName);
            if (imageFrames.length === 0) return;
            const [spriteSheet, canvas] = createSheetFromImages(imageFrames);
            setDraggedFiles({ imageFrames, maxWidth, maxHeight, spriteSheet, canvas });
            setIsPaused(false);
          });
        });
      });
    } else if (extension.toLowerCase() === "png") {
      getImagesFromFiles(inFiles).then(({ imageFrames, maxWidth, maxHeight }) => {
        setNewFileName(fileName);
        console.log({ imageFrames });
        if (imageFrames.length === 0) return;
        const [spriteSheet, canvas] = createSheetFromImages(imageFrames);
        setDraggedFiles({ imageFrames, maxWidth, maxHeight, spriteSheet, fps, canvas });
        setIsPaused(false);
        setFrame(0);
      });
    } else if (extension.toLowerCase() === "webp") {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const data = new Uint8Array(reader.result);
        console.log({ data });
        decodeAnimation(data, true).then((frames) => {
          getImagesFromWebPFrames(frames).then(({ imageFrames, maxWidth, maxHeight }) => {
            console.log({ imageFrames, maxWidth, maxHeight });
            setNewFileName(fileName);
            console.log({ imageFrames });
            if (imageFrames.length === 0) return;
            const [spriteSheet, canvas] = createSheetFromImages(imageFrames);
            setDraggedFiles({ imageFrames, maxWidth, maxHeight, spriteSheet, fps, canvas });
            setIsPaused(false);
            setFrame(0);
          });
        });
      });
      reader.readAsArrayBuffer(firstFile);
    } else {
      // toast.warn("Please drop multiple PNG files or a zip archive containing them", { position: "bottom-left" });
    }

    if (firstFile && extension.toLowerCase() !== "webp") {
      reader.readAsDataURL(firstFile);
    }
  };

  const onWheelZoom = (e) => {
    setZoom((prev) => (e.deltaY > 0 ? prev + 0.1 : prev - 0.1));
  };
  const onWheelFps = (e) => {
    setIsPaused(false);
    setFps((prev) => {
      return e.deltaY > 0 ? prev + 1 : prev - 1;
    });
    spritePrevRef?.current?.reset();
  };
  const frameCount = draggedFiles?.imageFrames?.length ?? 0;
  const onWheelFrames = (e) => {
    setIsPaused(true);
    setFrame((prev) => {
      const next = e.deltaY > 0 ? prev + 1 : prev - 1;
      if (next < 0) return prev;
      if (next > frameCount - 1) return prev;
      return next;
    });
    spritePrevRef?.current?.reset();
  };

  console.log({ draggedFiles });
  const isASpriteSheet = draggedFiles?.imageFrames?.length === 1;
  return (
    <div
      onDragEnter={() => setDraggedFiles(null)}
      style={{ maxWidth: "90vw", maxHeight: "95vh", minWidth: 100, minHeight: 100 }}
      className="w-full h-full bg-gray-900/80 hover:bg-gray-900/90 overflow-hidden rounded-md p-2 border-1 border-gray-200"
    >
      {draggedFiles ? (
        <div className="flex flex-col gap-3 relative h-full">
          <div className="flex flex-row gap-3">
            <div>name: </div>
            <input
              className="border-1 border-amber-200 px-3 rounded-sm"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
            ></input>
            <div>frames x {isASpriteSheet ? cutSprite.row * cutSprite.col : draggedFiles?.imageFrames?.length}</div>{" "}
            {!isASpriteSheet && (
              <div
                onWheel={onWheelZoom}
                className={buttonClass}
                title="Zoom level. Click to reset, scroll to resize"
                onClick={() => {
                  setZoom(1);
                }}
              >
                size {zoom.toFixed(1)}
              </div>
            )}
          </div>

          <div className="f-full w-full flex-row flex">
            {!isASpriteSheet && (
              <div
                onWheel={onWheelZoom}
                className="overflow-hidden h-full w-full flex-1 rounded-sm"
                style={{ imageRendering: "pixelated" }}
                title="Scroll to zoom"
              >
                <TransformWrapper>
                  <TransformComponent wrapperClass="zoom_wrapper_class_preview_sprite">
                    <SpriteAnimator
                      className="rounded-sm border-1 border-amber-200/60"
                      scale={zoom}
                      fps={fps}
                      key={fps}
                      ref={spritePrevRef}
                      sprite={draggedFiles?.spriteSheet?.src}
                      width={draggedFiles?.maxWidth}
                      height={draggedFiles?.maxHeight}
                      shouldAnimate={!isPaused}
                      frame={frame}
                    />
                  </TransformComponent>
                </TransformWrapper>
              </div>
            )}

            {isASpriteSheet && (
              <div className="w-full h-full flex flex-row gap-2">
                <SpriteCutter scale={zoom} image={draggedFiles?.spriteSheet} cutSprite={cutSprite} />
                <div className="w-23 flex flex-col gap-1">
                  <div className="flex flex-row gap-2 justify-between">
                    <div className="">col:</div>
                    <input
                      type="number"
                      min={1}
                      value={cutSprite.col}
                      defaultValue={1}
                      onChange={(e) => {
                        setCutSprite((p) => ({ ...p, col: Number(e.target.value) }));
                      }}
                      className="border-1 border-amber-200 w-12 rounded-sm pl-1"
                    />
                  </div>
                  <div className="flex flex-row gap-2 justify-between">
                    <div className="">row:</div>
                    <input
                      type="number"
                      min={1}
                      value={cutSprite.row}
                      defaultValue={1}
                      onChange={(e) => {
                        setCutSprite((p) => ({ ...p, row: Number(e.target.value) }));
                      }}
                      className="border-1 border-amber-200 w-12 rounded-sm pl-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-row gap-3 sticky bottom-0 flex-1 justify-between">
            <div className="flex gap-2">
              <button
                className={buttonClass + " bg-amber-900/80 hover:bg-amber-600"}
                onClick={() => setDraggedFiles(null)}
              >
                {"<- back"}
              </button>
            </div>
            {isASpriteSheet ? null : (
              <div className="flex gap-2">
                <div
                  onWheel={onWheelFps}
                  className={buttonClass}
                  title="Fps. Click to reset, Scroll to change"
                  onClick={() => setFps(12)}
                >
                  fps: {fps}
                </div>
                <div
                  className={buttonClass}
                  onClick={() => {
                    setIsPaused((p) => !p);
                    spritePrevRef?.current?.reset();
                  }}
                  onWheel={onWheelFrames}
                  title="Click to Pause/play, Scroll to go through frames"
                >
                  {!isPaused ? "playing" : "paused @" + frame}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button className={buttonClass} onClick={() => onCancel()}>
                cancel
              </button>

              <button
                className={buttonClass + " bg-emerald-600/80 hover:bg-emerald-600"}
                onClick={onConfirmDraggedFile}
              >
                {"Import ->"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <FileUploader
          classes="w-100 min-h-100"
          handleChange={handleDropFile}
          onSelect={handleDropFile}
          name="file"
          multiple
          // types={fileTypes}
          label=" Drop a zip with pngs or multiple png images. Drop one png file to slice its spritesheet into frames. Drop animated webp to extract its frames"
          uploadedLabel="Drop zip"
        />
      )}
    </div>
  );
};
export default memo(FileImport);
