const favicon = document.getElementById('favicon');
const originalTitle = "portfolio website";
let currentFrame = 0;
const totalFrames = 150;
const framesPerRow = 1800; // 28800 / 16
const frameSize = 32;

const canvas = document.createElement('canvas');
canvas.width = frameSize;
canvas.height = frameSize;
const ctx = canvas.getContext('2d');

const sprite = new Image();
// FIX 1: Allow the canvas to read the image data
sprite.crossOrigin = "anonymous"; 
sprite.src = './spritesheet.png';

sprite.onload = () => {
    console.log("Rat Spritesheet Loaded Successfully!"); // This should now appear in F12
    setInterval(() => {
        const row = Math.floor(currentFrame / framesPerRow);
        const col = currentFrame % framesPerRow;

        ctx.clearRect(0, 0, frameSize, frameSize);
        ctx.drawImage(
            sprite, 
            col * frameSize, row * frameSize, frameSize, frameSize, 
            0, 0, frameSize, frameSize
        );

        const dataUrl = canvas.toDataURL('image/png');
        if (favicon) {
            favicon.href = dataUrl;
        }
        currentFrame = (currentFrame + 1) % totalFrames;
    }, 60);
};

sprite.onerror = () => {
    console.error("FAILED to load spritesheet.png. Check the file path!");
};

// Prank Logic
let scrollInterval;
const prankMessage = "   Searching: How to be a discord mod...    ";

window.onblur = () => {
    let msg = prankMessage;
    scrollInterval = setInterval(() => {
        msg = msg.substring(1) + msg.substring(0, 1);
        document.title = msg;
    }, 150);
};

window.onfocus = () => {
    clearInterval(scrollInterval);
    document.title = originalTitle;
};
