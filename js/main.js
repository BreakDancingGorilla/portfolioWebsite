const favicon = document.getElementById('favicon');
const originalTitle = "Gangsta Play";
let scrollInterval;

// --- 1. SPINNING RAT LOGIC ---
const sprite = new Image();
sprite.crossOrigin = "anonymous";
sprite.src = './assets/images/spritesheet.png';

let currentFrame = 0;
const totalFrames = 150;
const frameSize = 200;
const framesPerRow = 144;
const tabSize = 16;

const favCanvas = document.createElement('canvas');
favCanvas.width = tabSize;
favCanvas.height = tabSize;
const favCtx = favCanvas.getContext('2d');

sprite.onload = () => {
    setInterval(() => {
        const row = Math.floor(currentFrame / framesPerRow);
        const col = currentFrame % framesPerRow;
        favCtx.clearRect(0, 0, tabSize, tabSize);
        favCtx.drawImage(sprite, col * frameSize, row * frameSize, frameSize, frameSize, 0, 0, tabSize, tabSize);
        favicon.href = favCanvas.toDataURL('image/png');
        currentFrame = (currentFrame + 1) % totalFrames;
    }, 150);
};

// --- 2. THE PRANK LIST & SCROLLER ---
const prankMessages = [
    "   Searching: How to be a discord mod (fast track)...   ",
    "   ⚠️ ACCOUNT SECURITY ALERT: Unusual Login Detected...   ",
    "   Searching: Professional Furby Exorcists Near Me (URGENT)   ",
    "   Order History: 400 lbs of Bulk Dried Mealworms (SHIPPED)   ",
    "   Download More RAM (2024 LEGIT) (NO VIRUS)   "
];

function startScroll() {
    let msgIndex = Math.floor(Math.random() * prankMessages.length);
    let msg = prankMessages[msgIndex];
    let shiftCount = 0;
    scrollInterval = setInterval(() => {
        msg = msg.substring(1) + msg.substring(0, 1);
        document.title = msg;
        shiftCount++;
        if (shiftCount >= msg.length) {
            msgIndex = (msgIndex + 1) % prankMessages.length;
            msg = prankMessages[msgIndex];
            shiftCount = 0;
        }
    }, 120);
}

function stopScroll() {
    clearInterval(scrollInterval);
    document.title = originalTitle;
}

window.onblur = startScroll;
window.onfocus = stopScroll;

// --- 3. CANVAS BACKGROUND & CURSOR TRAIL ---
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let trail = [];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

window.addEventListener('mousemove', (e) => {
    trail.push({ x: e.clientX, y: e.clientY, alpha: 1 });
});

function drawTrail() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < trail.length; i++) {
        let p = trail[i];
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = "#39FF14";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();

        p.alpha -= 0.02;
        if (p.alpha <= 0) {
            trail.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(drawTrail);
}
drawTrail();
