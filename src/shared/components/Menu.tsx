import { useState } from "react"

const Menu = ({items, label, onSelect, onClose}) => {
const [isVisible, setIsVisible] = useState(true)
console.log({items})
const onOpen =()=>{
    setIsVisible(p=>!p)
}
return (
    <div className="">
    <div onClick={onOpen} onPointerEnter={()=>setIsVisible(true)}
    >{label}
    </div>
    {isVisible && (
    <div className="absolute left-3 w-fit flex-1 h-fit bg-gray-700 rounded-sm"
        onPointerLeave={()=>setIsVisible(false)}
    >
        {items.map(item=> 
        <div className="min-w-40 flex p-2 gap-2 justify-between hover:bg-gray-500">
            <div className="" style={{whiteSpace: "nowrap"}} onClick={()=>{
                onSelect(item)
                setIsVisible(false)
            }
                }>{item.label}</div>
            {onClose && <div onClick={()=>onClose(item)}>x</div>}
            </div>
        )}
    </div>
    )}

    </div>
)
}
export default Menu