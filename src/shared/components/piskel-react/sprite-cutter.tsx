import { useEffect, useRef } from "react";
import { getCellCoordinates } from "./utils";

const SpriteCutter = ({ image, cutSprite, scale }) => {
  const spriteCutterRef = useRef(null);
  const width = image.width;
  const height = image.height;

  const cellWidth = Math.floor(width / cutSprite.col);
  const cellHeight = Math.floor(height / cutSprite.row);
  const gridColor = "rgb(255,0,132,0.5)";
  const gridStyle = {
    // scale,
    backgroundSize: `${cellWidth}px ${cellHeight}px`,
    backgroundImage: `
       linear-gradient(to right, ${gridColor} 1px, transparent 1px),
       linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
    borderRight: `1px solid ${gridColor}`,
    borderBottom: `1px solid ${gridColor}`,
  };
  const onPointerMove = (e) => {
    const canvas: HTMLCanvasElement = spriteCutterRef?.current;
    const ctx = canvas.getContext("2d");
    const { col, row, cellX, cellY } = getCellCoordinates(e, { cellWidth, cellHeight });
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fillRect(cellX, cellY, cellWidth, cellHeight);
  };
  return (
    <div className="select-none">
      <div className="h-fit w-fit " style={gridStyle} onPointerMove={onPointerMove}>
        <canvas className="absolute" width={width} height={height} ref={spriteCutterRef} />
        <img src={image.src}></img>
      </div>
    </div>
  );
};
export default SpriteCutter;
