const video = document.getElementById('video');
const p1 = document.getElementById('p1'), p2 = document.getElementById('p2');

const faceMesh = new FaceMesh({locateFile: f=>`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`});
faceMesh.setOptions({maxNumFaces:1, refineLandmarks:true, minDetectionConfidence:0.5});
faceMesh.onResults(onResults);

const camera = new Camera(video, {onFrame: async ()=>{await faceMesh.send({image:video})}, width:480, height:360});
camera.start();

function onResults({multiFaceLandmarks, image}) {
  if (!multiFaceLandmarks || multiFaceLandmarks.length===0) return;
  const lm = multiFaceLandmarks[0],
        left = lm[468], right = lm[473],
        avgx = (left.x + right.x)/2,
        avgy = (left.y + right.y)/2;

  const vx = (avgx - 0.5)*2, vy=(avgy - 0.5)*2;
  const maxOff = 30;
  const dx = vx * maxOff, dy = vy * maxOff;

  [p1, p2].forEach(p=>{p.style.left = `${40 + dx}px`; p.style.top = `${40 + dy}px`;});
}
