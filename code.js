const favicon = document.getElementById('favicon');
const originalTitle = document.title;

const sprite = new Image();
sprite.src = './spritesheet.png'; 

let currentFrame = 0;
const totalFrames = 150; // Total count of rats in your image
const framesPerRow = 30;  // Adjust this based on your spritesheet's width
const frameSize = 16;     // Size for the tab icon

const canvas = document.createElement('canvas');
canvas.width = frameSize;
canvas.height = frameSize;
const ctx = canvas.getContext('2d');

sprite.onload = () => {
    setInterval(() => {
        // Find the specific rat's position in the grid
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

        // Convert the rat to a favicon URL
        favicon.href = canvas.toDataURL('image/png');
        currentFrame = (currentFrame + 1) % totalFrames;
    }, 60); // 60ms is roughly 16 frames per second for a smooth spin
};

// Prank logic
window.onblur = () => { document.title = "Searching: How to be a discord mod"; };
window.onfocus = () => { document.title = originalTitle; };
