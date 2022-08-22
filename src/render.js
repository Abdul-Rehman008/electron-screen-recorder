const { desktopCapturer, remote, ipcRenderer } = require('electron');

const { writeFile } = require('fs');

let mediaRecorder;
const recordedChunks = [];
const videoElement = document.querySelector('video');
const startBtn = document.getElementById('startBtn');

ipcRenderer.on('SET_SOURCE', async (event, sourceId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceId,
            minWidth: 1280,
            maxWidth: 1280,
            minHeight: 720,
            maxHeight: 720
          }
        }
      })
    videoElement.srcObject = stream;
    videoElement.play();

    const options = { mimeType: 'video/webm; codecs=vp9' };
    mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
      

    } catch (e) {
      console.log(e)
    }
  })


startBtn.onclick = e => {
    mediaRecorder.start();
    startBtn.classList.add('danger');
    startBtn.innerText = 'Recording';
  };
  
  const stopBtn = document.getElementById('stopBtn');
  
  stopBtn.onclick = e => {
    mediaRecorder.stop();
    startBtn.classList.remove('danger');
    startBtn.innerText = 'Start';
  };

function handleDataAvailable(e) {
  console.log('video data available');
  recordedChunks.push(e.data);
}

async function handleStop(e) {
  const blob = new Blob(recordedChunks, {
    type: 'video/webm; codecs=vp9'
  });

  const buffer = Buffer.from(await blob.arrayBuffer());
writeFile("./video.webm", buffer, () => console.log('video saved successfully!'));
}
