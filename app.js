let video;
let canvas;
let ctx;
let isPlaying = false;
let currentFilter = null;

// Initialize the application
async function init() {
    try {
        // Suppress TensorFlow.js debug messages
        tf.env().set('DEBUG', false);
        
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');

        console.log('Loading face-api models...');
        // Load face-api models
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models')
        ]);
        console.log('Face-api models loaded successfully');

        // Set up event listeners
        document.getElementById('startButton').addEventListener('click', toggleCamera);
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                toggleFilter(filter, btn);
            });
        });
        
        console.log('Initialization complete');
    } catch (error) {
        console.error('Error during initialization:', error);
        alert('Error initializing face detection. Please refresh the page and try again.');
    }
}

// Toggle camera on/off
async function toggleCamera() {
    if (!isPlaying) {
        try {
            console.log('Requesting camera access...');
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: 720,
                    height: 560,
                    facingMode: 'user'
                } 
            });
            
            console.log('Camera access granted');
            video.srcObject = stream;
            
            // Wait for video to be ready
            await new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    console.log('Video metadata loaded');
                    video.play();
                    resolve();
                };
            });
            
            isPlaying = true;
            document.getElementById('startButton').textContent = 'Disable Camera';
            console.log('Starting face detection');
            detectFaces();
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert(`Error accessing camera: ${err.message}\nPlease make sure you have granted camera permissions and your camera is working properly.`);
        }
    } else {
        console.log('Stopping camera');
        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
        isPlaying = false;
        document.getElementById('startButton').textContent = 'Enable Camera';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// Toggle filter selection
function toggleFilter(filter, button) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (currentFilter === filter) {
        currentFilter = null;
    } else {
        currentFilter = filter;
        button.classList.add('active');
    }
    console.log('Current filter:', currentFilter); // Debug log
}

// Detect faces and apply filters
async function detectFaces() {
    if (!isPlaying) return;

    try {
        canvas.width = video.width;
        canvas.height = video.height;

        const options = new faceapi.TinyFaceDetectorOptions({
            inputSize: 416,
            scoreThreshold: 0.5
        });

        const detections = await faceapi.detectAllFaces(video, options)
            .withFaceLandmarks();

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (detections && detections.length > 0) {
            detections.forEach(detection => {
                if (detection.landmarks) {
                    const landmarks = detection.landmarks;
                    
                    if (currentFilter === 'sunglasses') {
                        drawSunglasses(landmarks);
                    } else if (currentFilter === 'hat') {
                        drawHat(landmarks);
                    } else if (currentFilter === 'mustache') {
                        drawMustache(landmarks);
                    }
                }
            });
        }

        requestAnimationFrame(detectFaces);
    } catch (error) {
        console.error('Error in face detection:', error);
        // Continue detection even if there's an error
        requestAnimationFrame(detectFaces);
    }
}

// Draw sunglasses filter
function drawSunglasses(landmarks) {
    try {
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
        
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.ellipse(
            (leftEye[0].x + rightEye[3].x) / 2,
            (leftEye[0].y + rightEye[3].y) / 2,
            (rightEye[3].x - leftEye[0].x) * 0.8,
            (rightEye[3].y - leftEye[0].y) * 0.4,
            0, 0, Math.PI * 2
        );
        ctx.fill();
    } catch (error) {
        console.error('Error drawing sunglasses:', error);
    }
}

// Draw hat filter
function drawHat(landmarks) {
    try {
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
        const nose = landmarks.getNose();
        
        ctx.beginPath();
        ctx.fillStyle = 'red';
        ctx.moveTo(leftEye[0].x - 20, nose[0].y - 40);
        ctx.lineTo(rightEye[3].x + 20, nose[0].y - 40);
        ctx.lineTo(rightEye[3].x + 10, nose[0].y - 20);
        ctx.lineTo(leftEye[0].x - 10, nose[0].y - 20);
        ctx.closePath();
        ctx.fill();
    } catch (error) {
        console.error('Error drawing hat:', error);
    }
}

// Draw mustache filter
function drawMustache(landmarks) {
    try {
        const nose = landmarks.getNose();
        const mouth = landmarks.getMouth();
        
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.moveTo(mouth[0].x, mouth[0].y);
        ctx.quadraticCurveTo(
            (mouth[0].x + mouth[6].x) / 2,
            mouth[0].y + 10,
            mouth[6].x,
            mouth[6].y
        );
        ctx.stroke();
    } catch (error) {
        console.error('Error drawing mustache:', error);
    }
}

// Initialize the app when the page loads
window.addEventListener('load', init); 