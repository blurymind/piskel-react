import FileSaver from "file-saver";
import Jszip from "jszip";
import { useCallback } from "react";

//https://blurymind.github.io/piskel-react
export const getNewPiskelTemplate = (name: string) => ({
  modelVersion: 2,
  piskel: {
    name,
    description: "Created in https://blurymind.github.io/piskel-react",
    fps: 1,
    height: 32,
    width: 32,
    layers: [
      '{"name":"Layer 1","opacity":1,"frameCount":1,"chunks":[{"layout":[[0]],"base64PNG":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAqCAYAAADBNhlmAAAAAXNSR0IArs4c6QAAAFpJREFUWEft0rENADAIBDHYf2mGcENx6V9Czu08f/v8vulA/aEEE1QB3ddggiqg+xpMUAV0X4MJqoDuazBBFdB9DSaoArqvwQRVQPc1mKAK6L4GE1QB3degCh5SbwArS8HI/AAAAABJRU5ErkJggg=="}]}',
    ],
    hiddenFrames: [],
  },
});
export const usePiskel = ({ piskelRef }) => {
  const getPiskel = () => piskelRef.current?.contentWindow?.pskl;

  const loadPSprite = useCallback((sprite) => {
    const pskl = getPiskel();
    if (!pskl || !sprite) return;
    const app = pskl.app;
    const piskel = sprite.piskel;
    console.log({ sprite });
    const descriptor = new pskl.model.piskel.Descriptor(
      piskel.name,
      piskel.description,
      true,
    );
    pskl.utils.serialization.Deserializer.deserialize(
      sprite,
      function (piskel) {
        piskel.setDescriptor(descriptor);

        app.piskelController.setPiskel(piskel);
        // app.previewController.previewActionsController.piskelController.setFPS(fps);
      },
    );
  }, []);

  const getPiskelData = () => {
    const pskl = getPiskel();
    if (!pskl) return { data: null, name: "" };
    const piskelData = pskl.app.piskelController.getPiskel();
    const piskelState =
      pskl.utils.serialization.Serializer.serialize(piskelData);

    const piskelDataParsed = JSON.parse(piskelState);
    return piskelDataParsed;
  };
  const savePiskel = () => {
    const pskl = getPiskel();
    if (!pskl) return { data: null, name: "" };
    const piskelData = pskl.app.piskelController.getPiskel();
    const piskelState =
      pskl.utils.serialization.Serializer.serialize(piskelData);

    const piskelDataParsed = JSON.parse(piskelState);

    console.log("saved", { piskelDataParsed });
    return { src: piskelDataParsed, name: piskelDataParsed.piskel.name };
  };
  const initPiskelApp = (hideHeader) => {
    const innerDoc =
      piskelRef.current?.contentDocument ||
      piskelRef.current?.contentWindow.document;
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
  };
  const openSettings = () => {
    setTimeout(() => {
      const pskl = getPiskel();
      if (!pskl) return;
      pskl.app.settingsController.settingsContainer
        .getElementsByClassName("tool-icon  icon-settings-resize-white")[0]
        .click(); // call resize window
      pskl.app.settingsController.settingsContainer
        .getElementsByClassName("textfield resize-size-field")[0]
        .focus();
    });
  };
  const createNewPiskel = (name) => {
    const piskelData = getNewPiskelTemplate(name);
    loadPSprite(piskelData);
  };

  const loadImageFramesIntoPiskel = (
    { imageFrames, maxWidth, maxHeight },
    name,
  ) => {
    const pskl = getPiskel();
    const piskelFile =
      pskl.service.ImportService.prototype.createPiskelFromImages_(
        imageFrames,
        name,
        maxWidth,
        maxHeight,
        false,
      );
    const piskelController = pskl.app.piskelController;
    console.log({ imageFrames, piskelFile });
    piskelController.setPiskel(piskelFile, {});
    return piskelFile;
  };

  const getLayersAsImages = () => {
    const piskel = getPiskelData().piskel;
    const imageLayers = [];

    const rows = 1;
    let columns = -1;
    return Promise.all(
      piskel.layers.map((layerString) => {
        return new Promise((resolve) => {
          const layerData = JSON.parse(layerString);

          const b64 = layerData?.chunks?.[0]?.base64PNG ?? "";
          fetch(b64).then((res) => {
            if (columns === -1) {
              columns = layerData.frameCount;
            }
            const blob = res.blob();
            imageLayers.push({
              name: layerData.name,
              blob,
              b64,
              frameCount: layerData.frameCount,
            });
            resolve(1);
          });
        });
      }),
    ).then(() => ({ imageLayers, piskel, rows, columns }));
  };

  return {
    loadPSprite,
    getPiskel,
    savePiskel,
    initPiskelApp,
    createNewPiskel,
    loadImageFramesIntoPiskel,
    getPiskelData,
    openSettings,
    getLayersAsImages,
  };
};

export const getCell = ({ x, y, maxWidth, maxHeight }) => {
  const col = Math.floor(x / maxWidth);
  const row = Math.floor(y / maxHeight);
  const cellX = col * maxWidth;
  const cellY = row * maxHeight;
  return { col, row, cellX, cellY };
};
export const getCellCoordinates = (e, { cellWidth, cellHeight }) => {
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  return getCell({ x, y, maxWidth: cellWidth, maxHeight: cellHeight });
};

export const getClippedRegion = (image, x, y, width, height) => {
  const canvas = document.createElement("canvas"),
    ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
  return canvas;
};

export const createImagesFromSheet = (
  sheetImage: HTMLImageElement,
  cutSprite = { row: 1, col: 1 },
): {
  imageFrames: HTMLImageElement[];
  maxWidth: number;
  maxHeight: number;
} => {
  const maxWidth = Math.floor(sheetImage.width / cutSprite.col);
  const maxHeight = Math.floor(sheetImage.height / cutSprite.row);

  const imageFrames = [];
  for (const col of Array(cutSprite.col).keys()) {
    for (const row of Array(cutSprite.row).keys()) {
      const x = col * maxWidth;
      const y = row * maxHeight;
      const cell = getCell({ x, y, maxWidth, maxHeight });
      const clippedCan = getClippedRegion(
        sheetImage,
        cell.cellX,
        cell.cellY,
        maxWidth,
        maxHeight,
      );
      const finalImage = new Image();
      finalImage.src = clippedCan.toDataURL();
      // console.log({
      //   x,
      //   y,
      //   row,
      //   col,
      //   cell,
      //   clippedCan,
      //   finalImage,
      //   maxWidth,
      //   maxHeight,
      //   sheetImage,
      // });
      imageFrames.push(finalImage);
    }
  }
  return { imageFrames, maxWidth, maxHeight };
};

const LIMIT_FRAMES = 100;
export const COLS = 16;
export const createSheetFromImages = (
  imageFrames: HTMLImageElement[],
): [HTMLImageElement, HTMLCanvasElement] => {
  if (imageFrames.length === 0) return [null, null];
  const c: HTMLCanvasElement = document.createElement("canvas");
  const ctx = c.getContext("2d");
  const frameWidth = imageFrames[0].width;
  const frameHeight = imageFrames[0].height;

  const columns = Math.min(COLS, imageFrames.length);
  const countToRender = Math.min(LIMIT_FRAMES, imageFrames.length);
  const width = frameWidth * columns;
  const numberOfRows = Math.floor(countToRender / columns);
  const height = numberOfRows * frameHeight;
  console.log({ width, frameHeight, numberOfRows, height });
  c.width = width;
  c.height = height;
  imageFrames.forEach((image, index) => {
    if (index > countToRender) return;
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = col * frameWidth;
    const y = row * frameHeight;
    ctx.drawImage(image, x, y, frameWidth, frameHeight);
  });
  const image = new Image();
  console.log({ source: c.toDataURL() });
  image.src = c.toDataURL(); // todo this fails because canvas has a width limit
  return [image, c];
};

export const getImagesFromWebPFrames = (frames) => {
  const imageFrames = [];
  const maxWidth = frames[0].width;
  const maxHeight = frames[0].height;

  const canvas = document.createElement("canvas");
  canvas.width = maxWidth;
  canvas.height = maxHeight;
  canvas.style.width = `${maxWidth}px`;
  canvas.style.height = `${maxHeight}px`;
  const ctx = canvas.getContext("2d");
  return Promise.all(
    frames.map((frame) => {
      return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => {
          imageFrames.push(image);
          resolve(1);
        };
        image.onerror = (event) => {
          console.error("Unable to load ", image, event);
          resolve(1);
        };
        const imageData = ctx.createImageData(maxWidth, maxHeight);
        imageData.data.set(new Uint8ClampedArray(frame.data));

        ctx.putImageData(imageData, 0, 0);
        const url = ctx.canvas.toDataURL("image/png");
        image.src = url;
      });
    }),
  ).then(() => ({ imageFrames, maxWidth, maxHeight }));
};

export const downloadZip = (layers, fileName, layerData) => {
  return new Promise((resolve) => {
    const zip = new Jszip();
    const folder = zip.folder(fileName);
    folder.file(
      "layers.cfg",
      `[sprite]\nrows=${layerData.rows}\ncolumns=${layerData.columns}\nname: ${layerData.piskel.name}\nwidth: ${layerData.piskel.width}\nheight: ${layerData.piskel.height}\nfps: ${layerData.piskel.fps}
      `,
    );
    folder.file("layers.json", JSON.stringify(layerData.kaplay));
    layers.forEach((layer) => {
      folder.file(`${layer.name}.png`, layer.blob);
    });
    zip.generateAsync({ type: "blob" }).then((content) => {
      FileSaver.saveAs(content, fileName);
      resolve(content);
    });
  });
};

export const getImagesFromGifPFrames = (frames) => {
  let frameImageData;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  c.width = frames[0].dims.width;
  c.height = frames[0].dims.height;
  const maxWidth = c.width;
  const maxHeight = c.height;
  const gifCanvas: HTMLCanvasElement = document.createElement("canvas");
  gifCanvas.width = c.width;
  gifCanvas.height = c.height;
  const gifCtx = gifCanvas.getContext("2d");
  const tempCanvas: HTMLCanvasElement = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  let needsDisposal = false;
  const imageFrames = [];

  return Promise.all(
    frames.map((frame) => {
      return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => {
          imageFrames.push(image);
          resolve(1);
        };
        image.onerror = (event) => {
          console.error("Unable to load ", image, event);
          resolve(1);
        };
        ///////////////////////////

        /// render
        if (needsDisposal) {
          gifCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
          needsDisposal = false;
        }
        /// draw patch
        const dims = frame.dims;
        if (
          !frameImageData ||
          dims.width != frameImageData.width ||
          dims.height != frameImageData.height
        ) {
          tempCanvas.width = dims.width;
          tempCanvas.height = dims.height;
          frameImageData = tempCtx.createImageData(dims.width, dims.height);
        }

        // set the patch data as an override
        frameImageData.data.set(frame.patch);

        // draw the patch back over the canvas
        tempCtx.putImageData(frameImageData, 0, 0);
        gifCtx.drawImage(tempCanvas, dims.left, dims.top);
        /// manipulate
        const imageData = gifCtx.getImageData(
          0,
          0,
          gifCanvas.width,
          gifCanvas.height,
        );

        const pixelsX = 5 + Math.floor(c.width - 5);
        const pixelsY = (pixelsX * c.height) / c.width;

        ctx.putImageData(imageData, 0, 0);
        ctx.drawImage(c, 0, 0, c.width, c.height, 0, 0, pixelsX, pixelsY);
        ctx.drawImage(c, 0, 0, pixelsX, pixelsY, 0, 0, c.width, c.height);

        /// render
        if (frame.disposalType === 2) {
          needsDisposal = true;
        }

        const url = gifCanvas.toDataURL("image/png");
        image.src = url;
      });
    }),
  ).then(() => ({ imageFrames, maxWidth, maxHeight }));
};
// create Images from jszip files or regular files
export const getImagesFromFiles = (files) => {
  const imageFrames = [];
  let maxWidth = -1;
  let maxHeight = -1;
  return Promise.all(
    Object.values(files)
      // jszip files dont have a type property, so we have to do this instead
      .filter((item) => item.name.toLowerCase().endsWith(".png"))
      .sort((a, b) => a.name - b.name)
      .map((resource) => {
        console.log({ resource });
        return new Promise((resolve) => {
          const image = new Image();
          image.onload = () => {
            imageFrames.push(image);
            maxWidth = Math.max(image.width, maxWidth);
            maxHeight = Math.max(image.height, maxHeight);
            resolve(1);
          };
          image.onerror = (event) => {
            console.error("Unable to load ", resource, event);
            resolve(1);
          };

          try {
            if (resource.async != null) {
              // this async function is attached to jszip files
              resource.async("blob").then((blob) => {
                const imageUrl = URL.createObjectURL(blob);
                console.log({ blob, imageUrl });
                image.src = imageUrl;
              });
            } else {
              // we have to do this on regular files
              const reader = new FileReader();
              reader.onload = () => {
                image.src = reader.result;
              };
              reader.readAsDataURL(resource);
            }
          } catch (error) {
            // Unable to load the image, ignore it.
            console.error("Unable to load ", resource, error);
            resolve(1);
          }
        });
      }),
  ).then(() => ({ imageFrames, maxWidth, maxHeight }));
};
export const sprites = {
  sonic: {
    modelVersion: 2,
    piskel: {
      name: "sonic", // note that name and key must be the same always
      description: "",
      fps: 12,
      height: 50,
      width: 50,
      layers: [
        '{"name":"Layer 1","frameCount":25,"base64PNG":"data:image/png;base64,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"}',
      ],
    },
  },
  mario: {
    modelVersion: 2,
    piskel: {
      name: "mario",
      description: "",
      fps: 3,
      height: 42,
      width: 40,
      layers: [
        '{"name":"Layer 1","frameCount":2,"base64PNG":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAqCAYAAAAkqNwKAAAEpklEQVRoQ+2aLVjzMBDHDzeJrJyMnEROIpGTSCQSOYlEIicnkZNIZGXlZCWyrjx3zYVrljQfLdve92nNurZJL7//fSTZbmA+RhG4GdV6bgwzwJFOMAOcAY4kMLL57IFXAVCp1mlHVf33Ao0boAbXVFXHr2m6z8Wi+1Cq+34NIG2RJ7IpH6BSrQEn4bEraogG5EQGJ0ecLbLuYCpx8wAKeHsAeGRPs0a3qyrYSIPPCdEDzhZgLMh0gA54PU8UFqJxF4FoRwcAoNAbnWL2i4UR1gQMOkGGwNkA2fMQnlHRkpfvMUR6LsPIpLC1BOa2DI+/I0Rzb0SUZAFEIBi2DKgpSzKh/nijz+LhuSsiq5V5htucC+BQarEFGSNwPECrijG84/aRgCEsPMdjud0BQkWgdO7y0r/yRKVaKXCM93KqoVyeaJcfIAPDDjEsyhLK72+4W697NsUAlA2+Pj9hdXtLwMlY+Z6Y0Yae0f0Zjw89D0B52hTCSQA6gEmACA09S3ocn7O9rvt4rQcQoP890fgTNkq1bBvfSxHYtE2wY9ADh7yOAeEnHvuHVW88m48uL0rY/Cw/eOKNEd7ifUTDcwk4lGI45UgHIDsjIQ7nQJ5L6SLBIYyw7lYr8sKYA437KktAqAyNiwy1jzR28F1KtWyXDYWLml3k+LuMFrYz1qYgQBww5z15bkN84eWcHuWrnlxLeHjL2d8UALFzDRFPUWCXN/quITg8KHIS7IkCSAat173B22rbk2msbBwWRlUBEEFyvykGBz1eR42dC30pRqaZnGgIT2OUaqXX4Etk1fKFs+15dlU0fSaoHYTHD4hwDqWZnp0ZtoQB6tCQSzK8RBPVbQOwX50UEB4HhcOmhN22v3Qyk9wMg1MhcjjbIBlcTthKG5IA0st0awOQaPYrsHnBpssrEiC2wyNn0poCjybvkQI320W3HM0QNA6g9kIO318ABxpTA0vn2BZw7K6rewp70w5PMoyNAijWwgQwQmAEiEcOxHiAbL1eKpE3ig1Ue0OBiorY/fhzrxP24bvl7ktH53fzoFNdw8UA0rsz5wGIIQnQYgjKSiqLBJ+f3Icz/IyqBVZ1TUtGPmjpKA7eAMFLOL+tiiIrrQSnMd6wwfzGuQ/PtzWFKh3VAWBb9O/78uRfhLOeyqQI3Nmd/hvO4FLu3to4wHcccP6mgVXvvxsL6umzB/Dkngbq7TPDeLMRIVXmDQopMArK4vKz8ho/Kzc37D49njQIUC1Pi0N1PJKHIaDdky4SWFXfl6DeujxTPTen9zRgf5+J6ivVXoPA4e0sF/nqAC+OysvLN3tZh128YkW2vSBSZaf4SrXXIHAQoG0ke2AuQGd/OfnH91u0zsG59nlzvifFBAHaYUI5UK9p7ZfJTQffPV9/yQlcA7y0wEGALgNxmoLThI+i6HHyhfBDXZtpwtQeeGmBs6YxOFEt65p2aGS+cwHEa7QHWBTeX++SvQ9lG/DAcwqcBRAH3AC4/w/jSSILnERP/R8aT3/nFDi8lPP9p2QoiTsrt56mTPkflQFBziVwGKC3LF3JjQsL/O8DvLCOM8CRAswAZ4AjCYxsPnvgSIA/kjKcWEd9DO4AAAAASUVORK5CYII="}',
      ],
    },
  },
};

const supported = [".png", ".zip", ".webp", ".gif"];
export const isSupportedFormat = (file): boolean => {
  return supported.some((type) => file?.name?.toLowerCase().endsWith(type));
};

export const saveImage = (image, name: string) => {
  const c: HTMLCanvasElement = document.createElement("canvas");
  const ctx = c.getContext("2d");
  c.width = image.width;
  c.height = image.height;
  ctx.drawImage(image, 0, 0, image.width, image.height);
  window.location.href = c.toDataURL("image/png");
  const gh = c.toDataURL("png");

  const a = document.createElement("a");
  a.href = gh;
  a.download = `${name}.png`;

  a.click();
};
