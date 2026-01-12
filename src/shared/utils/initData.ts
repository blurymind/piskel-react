export const newTemplate = `// code your react component below
 ({import: {SplitView, View, PiskelReact}}) => {
     const ref= useRef(null)
 console.log({PiskelReact})
  return (
    <div className="flex flex-1 flex-col h-full w-full bg-gray-100">
      <SplitView>
      <View>
  
         <PiskelReact ref={ref}/>
         </View>
      <View>
  
        <iframe 
         src="https://blurymind.github.io/YarnClassic"
         width="100%"
         height="100%"
        />
         </View>
    </SplitView>
    </div>
  )
 }
`;
export const initDataEditors = { piskel: newTemplate };
