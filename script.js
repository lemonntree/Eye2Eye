const video = document.getElementById('video');
const p1 = document.getElementById('p1'), p2 = document.getElementById('p2');

const faceMesh = new FaceMesh({locateFile: f=>`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`});
faceMesh.setOptions({maxNumFaces:1, refineLandmarks:true, minDetectionConfidence:0.5});
faceMesh.onResults(onResults);

const camera = new Camera(video, {onFrame: async ()=>{await faceMesh.send({image:video})}, width:480, height:360});
camera.start();

function onResults({multiFaceLandmarks, image}) {
  if (!multiFaceLandmarks || multiFaceLandmarks.length === 0) return;
  const lm = multiFaceLandmarks[0];

  // eye center tracking
  const left = lm[468], right = lm[473];
  const avgx = (left.x + right.x) / 2;
  const avgy = (left.y + right.y) / 2;

  const vx = (avgx - 0.5) * 2;
  const vy = (avgy - 0.5) * 2;
  const dx = -vx * 30;
  const dy =  vy * 30;

  // estimate face width
  const leftCorner = lm[33], rightCorner = lm[263];
  const dX = leftCorner.x - rightCorner.x;
  const dY = leftCorner.y - rightCorner.y;
  const faceWidth = Math.sqrt(dX * dX + dY * dY);

  // map faceWidth to scale
  const min = 0.05, max = 0.15;
  const norm = Math.min(Math.max((faceWidth - min) / (max - min), 0), 1);
  const pupilScale = 0.5 + norm;  // range: 0.5 to 1.5

  [p1, p2].forEach(p => {
    p.style.transform = `translate(${dx}px, ${dy}px) scale(${pupilScale})`;
  });
}

function blink() {
  // 执行眨眼动作
  [p1, p2].forEach(p => {
    p.parentElement.style.transform = 'scaleY(0.1)';  // 缩成一条线
  });

  // 150ms 后恢复
  setTimeout(() => {
    [p1, p2].forEach(p => {
      p.parentElement.style.transform = 'scaleY(1)';
    });

    // 设置下一次眨眼（随机5-10秒）
    const nextBlink = Math.random() * 5000 + 5000;
    setTimeout(blink, nextBlink);
  }, 150);
}

// 启动第一次眨眼定时器
setTimeout(blink, 3000);