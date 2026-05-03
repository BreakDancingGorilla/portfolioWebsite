 addEventListener("load", (event) => {
window.onblur = function () {
  document.title = "I miss you... come back! 🥺";
}
window.onfocus = function () {
  document.title = "My Normal Website";
}
    
let msg = "  Wait, did you really just leave me for another tab?  ";
function scrollTitle() {
  document.title = msg;
  msg = msg.substring(1) + msg.substring(0, 1);
  setTimeout(scrollTitle, 150); // Lower is faster
}
scrollTitle();

const favicon = document.querySelector('link[rel="icon"]');
const img = new Image();
img.src = 'spritesheet.png'; // Path to your single sprite sheet

let frame = 0;
const totalFrames = 150; // Total number of frames in your sheet
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 16;
canvas.height = 16;

img.onload = () => {
  setInterval(() => {
    ctx.clearRect(0, 0, 16, 16);
    // Draws a 16x16 slice from the sprite sheet
    ctx.drawImage(img, frame * 16, 0, 16, 16, 0, 0, 16, 16);
    favicon.href = canvas.toDataURL('image/png');
    frame = (frame + 1) % totalFrames;
  }, 100); // Adjust speed here
};
//For on load.
});