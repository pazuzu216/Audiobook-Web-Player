let audioFiles=[],storedFileNames=JSON.parse(localStorage.getItem("audioFileNames"))||[],currentIndex=localStorage.getItem("currentIndex")?parseInt(localStorage.getItem("currentIndex")):0,currentTime=localStorage.getItem("currentTime")?parseFloat(localStorage.getItem("currentTime")):0,sleepRemaining=localStorage.getItem("sleepRemaining")?parseInt(localStorage.getItem("sleepRemaining")):2700,sleepTimerValue=localStorage.getItem("sleepTimerValue")?parseInt(localStorage.getItem("sleepTimerValue")):45,fadeTimeValue=localStorage.getItem("fadeTimeValue")?parseInt(localStorage.getItem("fadeTimeValue")):60,storedVolume=localStorage.getItem("volume")?parseFloat(localStorage.getItem("volume")):1,skipTime=localStorage.getItem("skipTime")?parseInt(localStorage.getItem("skipTime")):10,sleepPaused=!0;const audioPlayer=document.getElementById("audioPlayer"),sleepTimerDisplay=document.getElementById("sleepTimerDisplay"),fileListElement=document.getElementById("fileList");let sleepTimer,originalVolume=storedVolume;audioPlayer.volume=storedVolume,document.getElementById("sleepTimerInput").value=sleepTimerValue,document.getElementById("fadeTimeInput").value=fadeTimeValue,document.getElementById("skipTimeInput").value=skipTime;let userChangedVolume=!1;function storeSkipTime(){skipTime=parseInt(document.getElementById("skipTimeInput").value),localStorage.setItem("skipTime",skipTime)}function skipBackward(){let e=audioPlayer.currentTime-60*skipTime;e<0?function i(){currentIndex>0?(currentIndex--,localStorage.setItem("currentIndex",currentIndex),highlightPlayingFile(),audioPlayer.src=URL.createObjectURL(audioFiles[currentIndex]),audioPlayer.addEventListener("loadedmetadata",()=>{(e+=audioPlayer.duration)<0?i():(audioPlayer.currentTime=e,localStorage.setItem("currentTime",audioPlayer.currentTime),audioPlayer.play())},{once:!0})):(audioPlayer.currentTime=0,audioPlayer.play())}():(audioPlayer.currentTime=e,audioPlayer.play()),localStorage.setItem("currentIndex",currentIndex),localStorage.setItem("currentTime",audioPlayer.currentTime)}function skipForward(){let e=audioPlayer.currentTime,i=currentIndex,t=audioPlayer.currentTime+60*skipTime;t>audioPlayer.duration?(t-=audioPlayer.duration,function r(){currentIndex<audioFiles.length-1?(currentIndex++,audioPlayer.src=URL.createObjectURL(audioFiles[currentIndex]),audioPlayer.addEventListener("loadedmetadata",()=>{t>audioPlayer.duration?(t-=audioPlayer.duration,r()):(audioPlayer.currentTime=t,audioPlayer.play(),localStorage.setItem("currentTime",audioPlayer.currentTime),localStorage.setItem("currentIndex",currentIndex),highlightPlayingFile())},{once:!0})):(currentIndex=i,audioPlayer.src=URL.createObjectURL(audioFiles[currentIndex]),audioPlayer.currentTime=e,audioPlayer.play(),localStorage.setItem("currentTime",audioPlayer.currentTime),localStorage.setItem("currentIndex",currentIndex),highlightPlayingFile())}()):(audioPlayer.currentTime=t,audioPlayer.play(),localStorage.setItem("currentTime",audioPlayer.currentTime),localStorage.setItem("currentIndex",currentIndex),highlightPlayingFile())}function startSleepTimer(){sleepPaused=!1,userChangedVolume=!1,sleepRemaining=60*sleepTimerValue,clearInterval(sleepTimer),sleepTimer=setInterval(()=>{if(!sleepPaused){if(sleepRemaining--,localStorage.setItem("sleepRemaining",sleepRemaining),updateSleepTimerDisplay(),sleepRemaining<=fadeTimeValue){let e=1-sleepRemaining/fadeTimeValue;audioPlayer.volume=originalVolume*Math.pow(1-e,2)}sleepRemaining<=0&&(clearInterval(sleepTimer),audioPlayer.pause(),audioPlayer.volume=originalVolume,sleepRemaining=60*sleepTimerValue,localStorage.setItem("sleepRemaining",sleepRemaining))}},1e3)}function setSleepTimer(){sleepTimerValue=parseInt(document.getElementById("sleepTimerInput").value),localStorage.setItem("sleepTimerValue",sleepTimerValue),sleepRemaining=60*sleepTimerValue,startSleepTimer()}function updateSleepTimerDisplay(){sleepTimerDisplay.textContent=`Time remaining: ${Math.floor(sleepRemaining/60)}:${String(sleepRemaining%60).padStart(2,"0")}`}function renderFileList(){fileListElement.innerHTML="",0!==audioFiles.length&&(fileListElement.style.display="block",storedFileNames.forEach((e,i)=>{let t=document.createElement("li");t.textContent=e,t.className="clickable",t.onclick=()=>{currentIndex=i,currentTime=0,playSelectedFile()},t.style.textAlign="left",fileListElement.appendChild(t)}),highlightPlayingFile())}function highlightPlayingFile(){Array.from(fileListElement.children).forEach((e,i)=>{e.className=i===currentIndex?"playing":"clickable"})}function playSelectedFile(){audioFiles[currentIndex]&&(audioPlayer.src=URL.createObjectURL(audioFiles[currentIndex]),audioPlayer.currentTime=currentTime,audioPlayer.play(),highlightPlayingFile(),localStorage.setItem("currentIndex",currentIndex),localStorage.setItem("currentTime",audioPlayer.currentTime))}function playNext(){currentIndex=(currentIndex+1)%audioFiles.length,currentTime=0,playSelectedFile()}function storeAndDisplayFiles(){let e=Array.from(directoryInput.files).filter(e=>e.type.startsWith("audio/")||/\.(mp3|m4b|aac|mka|weba|wav|ogg|flac)$/i.test(e.name));if(0===e.length)return;e.sort((e,i)=>e.name.localeCompare(i.name,void 0,{numeric:!0})),audioFiles=e,storedFileNames=e.map(e=>e.name);let i=storedFileNames,t=JSON.parse(localStorage.getItem("audioFileNames"))||[];JSON.stringify(i)!==JSON.stringify(t)&&(currentIndex=0,currentTime=0,localStorage.setItem("currentIndex",currentIndex),localStorage.setItem("currentTime",currentTime)),localStorage.setItem("audioFileNames",JSON.stringify(storedFileNames)),renderFileList(),playSelectedFile()}function storeSleepTimerValue(){sleepTimerValue=parseInt(document.getElementById("sleepTimerInput").value),localStorage.setItem("sleepTimerValue",sleepTimerValue)}function storeFadeTimeValue(){fadeTimeValue=parseInt(document.getElementById("fadeTimeInput").value),localStorage.setItem("fadeTimeValue",fadeTimeValue)}audioPlayer.addEventListener("volumechange",e=>{userChangedVolume&&(originalVolume=audioPlayer.volume,localStorage.setItem("volume",originalVolume))}),audioPlayer.addEventListener("play",startSleepTimer),audioPlayer.addEventListener("pause",()=>{sleepPaused=!0,localStorage.setItem("currentTime",audioPlayer.currentTime),localStorage.setItem("currentIndex",currentIndex),localStorage.setItem("sleepRemaining",sleepRemaining)}),audioPlayer.addEventListener("timeupdate",()=>{localStorage.setItem("currentTime",audioPlayer.currentTime)}),audioPlayer.addEventListener("ended",playNext),audioPlayer.addEventListener("input",()=>{userChangedVolume=!0}),document.addEventListener("keydown",e=>{"MediaPlayPause"===e.code&&(audioPlayer.paused?audioPlayer.play():audioPlayer.pause()),("MediaFastForward"===e.key||"MediaTrackNext"===e.key)&&skipForward(),("MediaRewind"===e.key||"MediaTrackPrevious"===e.key)&&skipBackward()}),"serviceWorker"in navigator&&navigator.serviceWorker.register("./service-worker.js").then(e=>console.log("Service Worker registered!",e)).catch(e=>console.log("Service Worker registration failed:",e));