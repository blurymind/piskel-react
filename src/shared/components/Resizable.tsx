import { useEffect, useState } from "react";

//https://www.calculator.net/percent-calculator.html?cpar1=50&cpar2=1200&cpar3=&ctype=1&x=Calculate
const convertToPxFromPercent = (newSize, isVertical) =>  { 
    const total = isVertical? window.innerHeight : window.innerWidth
    console.log({total, newSize})
    return Math.floor(((newSize/100) * total))
}

export const ResizablePane = ({
  minSize,
  initialSize,
  maxSize,
  grow,
  isVertical,
  bgColor,
  children
}) => {
  const [size, setSize] = useState(initialSize);
  const [isResizing, setIsResizing] = useState(false);

  const dimension = isVertical ? "height" : "width";

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const movement = (isVertical ? e.movementY : e.movementX) / 10;
      let newSize = size + movement;

      newSize = Math.max(minSize, Math.min(maxSize, newSize));
      setSize(newSize);
    };

    const handleMouseUp = () => setIsResizing(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [size, isResizing, minSize, maxSize, isVertical]);

  const handleMouseDown = () => setIsResizing(true);

  console.log(convertToPxFromPercent(size, isVertical), isVertical)
  return (
    <div
      className={`relative ${bgColor} ${grow ? "grow" : ""} shrink-0`}
      style={{ [dimension]: `${convertToPxFromPercent(size, isVertical)}px`, }}
    >
      {!grow && (
        <ResizableHandle
          isResizing={isResizing}
          isVertical={isVertical}
          handleMouseDown={handleMouseDown}
        />
      )}
      <div className="overflow-hidden w-full h-full">
        {children}
      </div>
     
    </div>
  );
}

export const ResizableHandle = ({ isResizing, isVertical, handleMouseDown }) => {
  const positionHandleStyle = isVertical
    ? "h-1 left-0 right-0 bottom-0 cursor-row-resize"
    : "w-1 top-0 bottom-0 right-0 cursor-col-resize";

  return (
    <div
      className={`absolute ${positionHandleStyle} hover:bg-blue-600 ${
        isResizing ? "bg-blue-600" : ""
      } bg-yellow-200 z-99999`}
      onMouseDown={handleMouseDown}
    />
  );
}