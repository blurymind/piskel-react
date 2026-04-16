import { memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import  Jszip from "jszip"
import "./index.css";
import { useLocalStorage } from "@uidotdev/usehooks";
import Menu from "../Menu"

const zip = new Jszip()
import { FileUploader } from "react-drag-drop-files";

const fileTypes = ["ZIP"];

import {usePiskel, sprites} from "./utils"
// copy of src/shared/components/piskel-react/piskel/dest/prod/index.html
export const PiskelReact = ({
  piskelAppPath = "piskel/dest/prod/index.html",
  ref,
  piskelFile,
  hideHeader = true,
}) => {
  const [currentName, setCurrentName] = useLocalStorage("currentPiskelName", "")
  const [piskels, setPiskels] = useLocalStorage("piskels", {mario: {label: sprites.mario.piskel.name, src: sprites.mario}});
  const currentPiskel = piskels[currentName]

  const piskelRef = useRef(null);
  const {getPiskel, loadPSprite, savePiskel, createNewPiskel, initPiskelApp, getPiskelData} = usePiskel({piskelRef})
 
  const loadSprite = useCallback((sprite) => {
    loadPSprite(sprite)
    setCurrentName(sprite.piskel.name)
  }, [setCurrentName]);

  // todo https://github.com/4ian/GDevelop/blob/94b980313b7ac851610e12a55f767dcfc3316d4c/newIDE/app/public/external/piskel/piskel-main.js#L122
  const onSavePiskel = () => {
    const {src, name} = savePiskel()
    setPiskels(prev=> ({...prev,
      [name]: {
        label: name,
        src
      }
    }))
  }

  useEffect(() => {
    console.log("load prop changed", { piskelFile });
    if (piskelFile) {
      loadSprite(piskelFile);
    } else {
      // loadSprite(editedPiskel);
    }
  }, []);
  

  useImperativeHandle(ref, () => {
    return {
      loadSprite,
      getPiskel,
    };
  }, []);

  const onLoadPiskelApp = () => {
    initPiskelApp(hideHeader)
    loadSprite(currentPiskel?.src ?? piskelFile ?? sprites.mario);
  };
 
const createEmptyAnimation = () => {
  const name = prompt("Create new file? ", "newPiskel")
  if(!name) return;
  if(name === currentName){
    alert("Cant have two " + name)
    return
  }
  createNewPiskel(name)
  setCurrentName(name)
  };

  const onSelectFile = item => {
    onSavePiskel()
    setTimeout(()=> {
      loadSprite(item.src)
    }, 100)

  }

  const onCloseFile = (sprite) => {
    const confirmation = confirm("This will close " + sprite.label)
    if(!confirmation) return;
    if(!(sprite.label in piskels)) return

    const nextPiskels  = {...piskels}
    delete nextPiskels[sprite.label]

    const piskelsVals = Object.values(nextPiskels)
    
    if(piskelsVals.length === 0) {
      createEmptyAnimation()
      return
    }
    const next = piskelsVals[0]
    if(!next) return;
    loadSprite(next.src);
    setTimeout(()=> {
      setPiskels(nextPiskels)
    }, 100)
  }

  const onCopyToClip = () => {
      navigator.clipboard.writeText(JSON.stringify(getPiskelData())).then(
    () => {
      console.log(getPiskelData())
    },
    () => {
      alert("failed to copy")
    },
   );
  }

  const onPasteClip = () => {
  navigator.clipboard
    .readText()
    .then((clipText) => {
      try {
        const data = JSON.parse(clipText)
        console.log({data})
        const promptName = prompt("What should we call the pasted sprite? ", data.piskel.name)
        if(promptName) {
          if(promptName in piskels) {
            alert("name is already taken")
            return;
          }
          data.piskel.name = promptName
          setPiskels(prev=> ({...prev,
            [promptName]: {
              label: promptName,
              src: data
            }
          }))
        }
        // alert("todo")
        
      } catch(e) {
        console.error(e)
      }
    });
 
  }

//  todo https://stuk.github.io/jszip/documentation/api_jszip/load_async.html
  const handleDropFile = (inFile) => {
    console.log(file);
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      console.log("LOADED" , reader)
      // convert image file to base64 string
      // preview.src = reader.result;
      //data:application/zip;base64,UEsDB
      zip.loadAsync(reader.result.split(",")[1], {base64: true}).then(zipData=>{
        console.log({zipData})
        const filesInZip = zipData.files;
        zipData.files.forEach(frame=>{
          console.log({frame, asData: frame.asText()})
        })
      })
    });
    if (inFile) {
      reader.readAsDataURL(inFile);
    }
  }
 
  return (
    <div style={{ height: "100%" }}>
      <div className="absolute left-20 bg-amber-200" onDrag={console.log}>
        <FileUploader handleChange={handleDropFile} name="file" types={fileTypes} />

      </div>

      <div className="absolute top-0 p-2 bg-gray-700 w-23 overflow-hidden" style={{whiteSpace: "nowrap"}} title={currentName}>{currentName}</div>

      <div className="absolute top-20 rounded-sm w-20 overflow-hidden h-50 bg-gray-600/20" >
        <div className="flex flex-1 gap-3 m-2 flex-col">
          <button className="hover:bg-gray-500" onClick={onSavePiskel}>Save</button>
          <button className="hover:bg-gray-500" onClick={createEmptyAnimation}>New</button>
          <button className="hover:bg-gray-500" onClick={onCopyToClip}>Copy</button>
          <button className="hover:bg-gray-500" onClick={onPasteClip}>Paste</button>
        </div>
      </div>
      <div className="absolute top-10 m-2"> 
          <Menu selected={currentName} onClose={onCloseFile} onSelect={onSelectFile} label={`Open (${Object.values(piskels).length})`} items={Object.values(piskels)} /> 
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
