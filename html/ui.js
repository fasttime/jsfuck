function createEngineSelectionBox(){"use strict";function a(a,b){var c=art("LABEL",art("INPUT",{style:{marginLeft:"0"},type:"checkbox"},b),a||null);return c}function b(){var a=document.createEvent("Event");a.initEvent("input",!0,!1),g.dispatchEvent(a)}function c(a,b){var c,d=Object.create(null),e=JScrewIt.Feature;return a.forEach(function(a){var b=e[a];b.individualNames.forEach(function(a){d[a]=null})}),b.forEach(function(a){delete d[a]}),c=JScrewIt.Feature(Object.keys(d)).canonicalNames}function d(){var a,b=[],d=["ANY_DOCUMENT","ANY_WINDOW","DOCUMENT","DOMWINDOW","HTMLDOCUMENT","WINDOW"];return Array.prototype.forEach.call(i,function(a){var c,e;a.checked&&(c=a.feature,b.push(c),e=a.notForWebWorker,Array.prototype.push.apply(d,e))}),a=JScrewIt.commonFeaturesOf.apply(null,b)||[],j.checked&&(a=c(a,d)),a}function e(){var b=art("DIV",{style:{display:"table"}}),c=a("Support web workers");g=art("FIELDSET",art("DIV",art("P",{style:{margin:".25em 0 .75em"}},"Select the engines you want your code to support."),b,art("HR"),c,art.on("change",f))),Object.defineProperty(g,"features",{configurable:!0,get:function(){return h}}),k.forEach(function(c){var d=art("DIV",{style:{display:"table-row"}},art("DIV",{style:{display:"table-cell",paddingRight:".5em"}},c.name));art(b,d),c.versions.forEach(function(b){var c=a(b.number,{checked:!0,feature:b.feature,notForWebWorker:b.notForWebWorker}),e=c.style;e.display="table-cell",e.paddingLeft=".5em",e.width="7.5em",art(d,c)})}),i=b.querySelectorAll("INPUT"),j=c.querySelector("INPUT"),h=d()}function f(){h=d(),b()}var g,h,i,j,k=[{name:"Chrome",versions:[{feature:"CHROME41",number:"41+"}]},{name:"Internet Explorer",versions:[{feature:"IE9",number:"9"},{feature:"IE10",number:"10"},{feature:"IE11",number:"11"}]},{name:"Firefox",versions:[{feature:"FF31",number:"31+"}]},{name:"Safari",versions:[{feature:"SAFARI70",number:"7.0"},{feature:"SAFARI71",number:"7.1"},{feature:"SAFARI71",number:"8.0",notForWebWorker:["SELF_OBJ"]}]},{name:"Opera",versions:[{feature:"CHROME41",number:"28+"}]},{name:"Microsoft Edge",versions:[{feature:"EDGE"}]},{name:"Android Browser",versions:[{feature:"ANDRO400",number:"4.0.x"},{feature:"ANDRO412",number:"4.1.x–4.3.x"},{feature:"ANDRO442",number:"4.4.x"}]},{name:"Node.js",versions:[{feature:"NODE010",number:"0.10.x"},{feature:"NODE012",number:"0.12.x"}]}];return e(),g}function createRoll(){"use strict";function a(){var a=art("DIV");g=a.style,g.display="none",e=art("DIV",a),e.container=a,Object.defineProperty(e,"rollTo",{configurable:!0,value:c,writable:!0}),f=e.style,f.height="0",f.overflowY="hidden"}function b(){var a=+new Date,b=a-k;m=j+b*l/250,(m-h)*l>=0&&(m=h,d()),f.height=1===m?"":e.scrollHeight*m+"px",g.display=0===m?"none":""}function c(a){if(a===m)d();else{var c=a>m?1:-1;c!==l&&(j=m,k=+new Date,l=c),h=a,i||(i=setInterval(b,0))}}function d(){clearInterval(i),i=null,l=0}var e,f,g,h,i,j,k,l=0,m=0;return a(),e}!function(){"use strict";function a(c){var d,e,f,g,h;for(d=c instanceof Node?c:"function"==typeof c?c.call(a):document.createElement(c),e=arguments.length,f=1;e>f;++f)g=arguments[f],g instanceof Node?d.appendChild(g):null!=g&&(h=typeof g,"object"===h?b(d,g):"function"===h?g.call(a,d):d.appendChild(document.createTextNode(g)));return d}function b(a,c){var d,e;for(d in c)e=c[d],d in a&&"object"==typeof e?b(a[d],e):a[d]=e}a.on=function(a,b,c){function d(d){d.addEventListener(a,b,c)}return d},window.art=a}(),function(){"use strict";function areEqualArrays(a,b){var c,d,e=a.length;if(e!==b.length)return!1;for(;e--;)if(c=a[e],d=b[e],c!==d)return!1;return!0}function createWorker(){if("undefined"!=typeof Worker)try{worker=new Worker("html/worker.js")}catch(a){}}function encode(){var a,b=getOptions();try{a=JScrewIt.encode(inputArea.value,b)}catch(c){return resetOutput(),void updateError(c+"")}updateOutput(a)}function encodeAsync(){var a=getOptions(),b={input:inputArea.value,options:a};waitingForWorker?queuedData=b:(worker.postMessage(b),resetOutput(),setWaitingForWorker(!0)),inputArea.onkeyup=null}function getOptions(){var a=wrapWithCallBox.checked?"call":"none",b={features:currentFeatures,wrapWith:a};return b}function handleCompInput(){var a=compMenu.selectedIndex,b=compMenu.options[a].value,c=b?JScrewIt.Feature[b].canonicalNames:engineSelectionBox.features;(outOfSync||!areEqualArrays(c,currentFeatures))&&(currentFeatures=c,this()),a!==compMenu.previousIndex&&(compMenu.previousIndex=a,roll.rollTo(+!b))}function handleInputAreaKeyUp(a){"Tab"!==a.key&&encodeAsync()}function handleRun(){var value;try{value=eval(outputArea.value)}catch(error){alert(error)}"string"==typeof value&&alert('"'+value+'"')}function handleWorkerMessage(a){var b,c;queuedData?(worker.postMessage(queuedData),queuedData=null):(b=a.data,c=b.error,c?updateError(b.error):updateOutput(b.output),setWaitingForWorker(!1))}function init(){var a,b,c,d;document.querySelector("body>*>div").style.display="block",inputArea.value=inputArea.defaultValue,wrapWithCallBox.checked=wrapWithCallBox.defaultChecked,outputArea.oninput=updateStats,art(stats.parentNode,art("BUTTON","Run this",{style:{"float":"right",fontSize:"10pt"}},art.on("click",handleRun))),b=controls.querySelector("button"),worker?(controls.removeChild(b),a=encodeAsync,worker.onmessage=handleWorkerMessage,encodeAsync()):(b.onclick=encode,a=noEncode,outputArea.value=""),inputArea.oninput=a,wrapWithCallBox.onchange=a,compMenu.selectedIndex=compMenu.previousIndex=0,c=handleCompInput.bind(a),compMenu.onchange=c,compMenu.onkeydown=setTimeout.bind(null,c),engineSelectionBox=art(createEngineSelectionBox(),{className:"engineSelectionBox"},art.on("input",c)),roll=createRoll(),art(roll.container,art("DIV",{className:"frame"},art("SPAN","Custom Compatibility Selection"),engineSelectionBox)),art(controls.parentNode,roll),inputArea.createTextRange?(d=inputArea.createTextRange(),d.move("textedit",1),d.select()):inputArea.setSelectionRange(2147483647,2147483647),inputArea.focus()}function noEncode(){outputSet&&updateStats(!0)}function resetOutput(){outputSet=!1,outputArea.value="",stats.textContent="…"}function setWaitingForWorker(a){waitingForWorker=a,outputArea.disabled=a}function updateError(a){alert(a)}function updateOutput(a){outputArea.value=a,updateStats()}function updateStats(a){var b=outputArea.value.length,c=1===b?"1 char":b+" chars";outOfSync=!!a,a&&(worker&&(inputArea.onkeyup=handleInputAreaKeyUp),c+=" – <i>out of sync</i>"),outputSet=!0,stats.innerHTML=c}var engineSelectionBox,outOfSync,outputSet,queuedData,roll,waitingForWorker,worker,currentFeatures=[];document.addEventListener("DOMContentLoaded",init),createWorker()}();