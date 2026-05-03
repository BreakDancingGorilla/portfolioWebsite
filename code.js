const favicon = document.getElementById('favicon');
const originalTitle = "portfolio website";
let currentFrame = 0;
const totalFrames = 150;

// NEW MATH BASED ON YOUR FILE DIMENSIONS
const frameSize = 200;       // The actual height of your image
const framesPerRow = 144;    // 28800 width / 200 frameSize = 144 frames per row
const tabSize = 16;          // The size of the actual browser tab

const canvas = document.createElement('canvas');
canvas.width = tabSize;
canvas.height = tabSize;
const ctx = canvas.getContext('2d');

const sprite = new Image();
sprite.crossOrigin = "anonymous"; 
sprite.src = './spritesheet.png';

sprite.onload = () => {
    console.log("Rat Spritesheet Loaded! Drawing 200px frames...");
    setInterval(() => {
        const row = Math.floor(currentFrame / framesPerRow);
        const col = currentFrame % framesPerRow;

        ctx.clearRect(0, 0, tabSize, tabSize);
        
        // This takes the 200px rat and squishes it into the 16px tab
        ctx.drawImage(
            sprite, 
            col * frameSize, row * frameSize, frameSize, frameSize, // Source (200px)
            0, 0, tabSize, tabSize                                  // Destination (16px)
        );

        favicon.href = canvas.toDataURL('image/png');
        currentFrame = (currentFrame + 1) % totalFrames;
    }, 60);
};

// Prank Logic (Keep this the same)
let scrollInterval;
const prankMessage = "   How to be a discord mod    ";
window.onblur = () => {
    let msg = prankMessage;
    scrollInterval = setInterval(() => {
        msg = msg.substring(1) + msg.substring(0, 1);
        document.title = msg;
    }, 1500);
};
window.onfocus = () => {
    clearInterval(scrollInterval);
    document.title = originalTitle;
};
