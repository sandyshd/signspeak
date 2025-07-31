const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const labelEl = document.getElementById('label');

let detector;

// 1. Start webcam
async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  return new Promise(res => video.onloadedmetadata = res);
}

// 2. Load MediaPipe Hands model
async function loadModel() {
    console.log('Loading hand pose detection model...');
    const model = handPoseDetection.SupportedModels.MediaPipeHands;
    const detectorConfig = {
    runtime: 'mediapipe',
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands'
                    // or 'base/node_modules/@mediapipe/hands' in npm.
    };
detector = await handPoseDetection.createDetector(model, detectorConfig);

    /*
    detector = await handPoseDetection.createDetector(
        handPoseDetection.SupportedModels.MediaPipeHands,
        { runtime: 'tfjs', modelType: 'lite', maxHands: 1 }
    );
    */
    console.log('Model loaded successfully');
}

/**
* 3. Simple rule-based gesture classifier.
* @param {Array<{x,y,z}>} lm  – 21 hand landmarks from MediaPipe
* @returns {string} one of: "👍 Thumbs Up", "👎 Thumbs Down",
*                      "✌️ Victory", "✋ Open Palm", "✊ Fist", or "…"
*/
function classify(lm) {
    console.log('Classifying landmarks:', lm);
  // Helper to check if a finger is extended:
  // tip y is above (less than) pip y → extended
  const isExtended = (tipIdx, pipIdx) => lm[tipIdx].y < lm[pipIdx].y;

  // Thumb oriented up/down:
  const thumbUp   = lm[4].y < lm[2].y;  // tip above MCP
  const thumbDown = lm[4].y > lm[2].y;  // tip below MCP

  // Fingers extended?
  const idxExt = isExtended(8, 6);   // index
  const midExt = isExtended(12, 10); // middle
  const ringExt = isExtended(16, 14);// ring
  const pinkyExt = isExtended(20, 18);// pinky

  // 1) Thumbs-Up: thumb up + other fingers folded
  if (thumbUp && !idxExt && !midExt && !ringExt && !pinkyExt) {
    return '👍 Thumbs Up';
  }

  // 2) Thumbs-Down: thumb down + other fingers folded
  if (thumbDown && !idxExt && !midExt && !ringExt && !pinkyExt) {
    return '👎 Thumbs Down';
  }

  // 3) Victory (Peace): index & middle extended, others folded
  if (idxExt && midExt && !ringExt && !pinkyExt && !thumbUp) {
    return '✌️ Victory';
  }

  // 4) Open Palm: all five fingers extended
  if (thumbUp && idxExt && midExt && ringExt && pinkyExt) {
    return '✋ Open Palm';
  }

  // 5) Fist: all five fingers folded
  if (!thumbUp && !idxExt && !midExt && !ringExt && !pinkyExt) {
    return '✊ Fist';
  }

  // default
  return '…';
}


// 4. Speak a label once per change
let lastSpoken = '';
function speak(text) {
  if (text && text !== lastSpoken) {
    new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    lastSpoken = text;
  }
}

// 5. Main loop: detect & render
async function renderLoop() {
  const hands = await detector.estimateHands(video, { flipHorizontal: true });
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (hands.length) {
    const pts = hands[0].keypoints;
    // draw keypoints
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
    });
    // label & speak
    const lbl = classify(hands[0].keypoints);
    labelEl.textContent = lbl;
    speak(lbl);
  } else {
    labelEl.textContent = 'No hand detected';
    lastSpoken = '';
  }

  requestAnimationFrame(renderLoop);
}

// 6. Kickoff
(async () => {
  await setupCamera();
  video.play();
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  await loadModel();
  renderLoop();
})();