// Check if required libraries are loaded
if (typeof handPoseDetection === 'undefined') {
  console.error('handPoseDetection library not found');
  document.getElementById('label').textContent = 'Error: Required libraries not loaded';
  throw new Error('handPoseDetection library not loaded');
}

const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const labelEl = document.getElementById('label');

let detector;

// 1. Start webcam
async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  return new Promise(res => {
    video.onloadedmetadata = () => {
      // Set canvas size after video metadata is loaded
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      res();
    };
  });
}

// 2. Load MediaPipe Hands model
async function loadModel() {
  try {
    console.log('Loading hand pose detection model...');
    // Check if handPoseDetection is available
    if (typeof handPoseDetection === 'undefined') {
      throw new Error('handPoseDetection library not loaded');
    }
    
    detector = await handPoseDetection.createDetector(
      handPoseDetection.SupportedModels.MediaPipeHands,
      {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915',
        maxHands: 1
      }
    );
    console.log('Model loaded successfully');
  } catch (error) {
    console.error('Error loading model:', error);
    throw error;
  }
}

// 3. Simple rule-based classifier (example for “thumbs-up”)
function classify(landmarks) {
  // landmarks: 21 points with x,y,z
  // here: thumbs-up if thumb tip y < index finger mcp y
  const thumbTip = landmarks[4];
  const indexMCP = landmarks[5];

  console.log('Thumb tip:', thumbTip, 'Index MCP:', indexMCP);

  if (thumbTip.y < indexMCP.y) {
    return '👍 Thumbs Up';
  }
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
    console.log('Hand detected:', hands[0].keypoints);
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
  try {
    console.log('Starting SignSpeak application...');
    await setupCamera();
    await video.play();
    await loadModel();
    renderLoop();
  } catch (error) {
    console.error('Error starting application:', error);
    labelEl.textContent = 'Error: ' + error.message;
  }
})();
