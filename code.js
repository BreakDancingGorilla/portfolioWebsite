const favicon = document.getElementById('favicon');
const originalTitle = document.title;

const sprite = new Image();
sprite.src = './spritesheet.png'; 

let currentFrame = 0;
const totalFrames = 150; // Total number of frames in the whole image
const framesPerRow = 30; // CHANGE THIS to the actual number of frames in one row
const frameSize = 16;   

const canvas = document.createElement('canvas');
canvas.width = frameSize;
canvas.height = frameSize;
const ctx = canvas.getContext('2d');

sprite.onload = () => {
    setInterval(() => {
        // Calculate X and Y position on the grid
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

        favicon.href = canvas.toDataURL('image/png');
        currentFrame = (currentFrame + 1) % totalFrames;
    }, 80);
};

// Prank logic
window.onblur = () => { document.title = "Searching: How to be a discord mod"; };
window.onfocus = () => { document.title = originalTitle; };
