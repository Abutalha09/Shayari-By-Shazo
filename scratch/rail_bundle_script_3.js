(()=>{
if(parent===window)return
const q='[data-state="open"],dialog[open]'
const open=()=>document.querySelectorAll(q).length
addEventListener("keydown",(e)=>{
const before=open()
setTimeout(()=>{
if(e.defaultPrevented||open()<before)return
const t=(e.composedPath&&e.composedPath()[0])||e.target
if(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.nodeName)))return
parent.postMessage({type:"21st-preview-key",key:e.key,code:e.code,altKey:e.altKey,ctrlKey:e.ctrlKey,metaKey:e.metaKey,shiftKey:e.shiftKey},"*")
},0)
})
})()