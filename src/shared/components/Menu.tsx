import { useState } from "react";

const Menu = ({ items, label, onSelect, onClose, selected }) => {
  const [isVisible, setIsVisible] = useState(false);

  const onOpen = () => {
    setIsVisible((p) => !p);
  };
  return (
    <div className="">
      <div onClick={onOpen} onPointerEnter={() => setIsVisible(true)}>
        {label}
      </div>
      {isVisible && (
        <div
          className="z-80 absolute left-3 w-fit flex-1 h-fit bg-gray-700 rounded-sm border-cyan-100 border-1"
          onPointerLeave={() => setIsVisible(false)}
        >
          {items.map((item, index) => (
            <div key={item.label} className="min-w-40 flex p-2 gap-2 justify-between hover:bg-gray-500">
              <div
                className="flex-1"
                style={{ whiteSpace: "nowrap" }}
                onClick={() => {
                  onSelect(item);
                  setIsVisible(false);
                }}
              >
                {item.label === selected ? "* " : ""}
                {item.label}
              </div>
              {onClose && (
                <div onClick={() => onClose(item)} className="w-5 hover:bg-gray-700 text-center rounded-sm">
                  x
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Menu;
