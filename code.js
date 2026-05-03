const favicon = document.getElementById('favicon');
const originalTitle = "portfolio website";
let scrollInterval;

// --- 1. SPINNING RAT LOGIC ---
const sprite = new Image();
sprite.src = './spritesheet.png'; 

let currentFrame = 0;
const totalFrames = 150;    // Change this to the total frames in your rat animation
const framesPerRow = 1800;  // 28800px width / 16px frame size
const frameSize = 16;       

const canvas = document.createElement('canvas');
canvas.width = frameSize;
canvas.height = frameSize;
const ctx = canvas.getContext('2d');

sprite.onload = () => {
    setInterval(() => {
        // Calculate grid position on the 28800x200 spritesheet
        const row = Math.floor(currentFrame / framesPerRow);
        const col = currentFrame % framesPerRow;

        const sourceX = col * frameSize;
        const sourceY = row * frameSize;

        ctx.clearRect(0, 0, frameSize, frameSize);
        ctx.drawImage(
            sprite, 
            sourceX, sourceY, frameSize, frameSize, 
            0, 0, frameSize, frameSize
        );

        // Update the tab icon
        favicon.href = canvas.toDataURL('image/png');
        currentFrame = (currentFrame + 1) % totalFrames;
    }, 60); // 60ms for a smooth spin
};

// --- 2. SCROLLING PRANK LOGIC ---
const prankMessage = "   Searching: How to be a discord mod...    ";

function startScroll() {
    let msg = prankMessage;
    scrollInterval = setInterval(() => {
        msg = msg.substring(1) + msg.substring(0, 1);
        document.title = msg;
    }, 150);
}

function stopScroll() {
    clearInterval(scrollInterval);
    document.title = originalTitle;
}

// Trigger when user leaves the tab
window.onblur = () => {
    startScroll();
};

// Reset when user returns
window.onfocus = () => {
    stopScroll();
};
