const favicon = document.getElementById('favicon');
const originalTitle = "Gangsta Play";
let scrollInterval;

// --- 1. SPINNING RAT LOGIC (28800px x 200px Spritesheet) ---
const sprite = new Image();
sprite.crossOrigin = "anonymous"; 
sprite.src = './spritesheet.png'; 

let currentFrame = 0;
const totalFrames = 150;    
const frameSize = 200;       // Actual height of your image
const framesPerRow = 144;    // 28800px width / 200px frameSize
const tabSize = 16;          

const canvas = document.createElement('canvas');
canvas.width = tabSize;
canvas.height = tabSize;
const ctx = canvas.getContext('2d');

sprite.onload = () => {
    console.log("Rat Spritesheet Loaded! Spinning commencing...");
    setInterval(() => {
        const row = Math.floor(currentFrame / framesPerRow);
        const col = currentFrame % framesPerRow;

        ctx.clearRect(0, 0, tabSize, tabSize);
        ctx.drawImage(
            sprite, 
            col * frameSize, row * frameSize, frameSize, frameSize, 
            0, 0, tabSize, tabSize
        );

        favicon.href = canvas.toDataURL('image/png');
        currentFrame = (currentFrame + 1) % totalFrames;
    }, 60);
};

// --- 2. THE ULTIMATE PRANK LIST ---
const prankMessages = [
    "   Searching: How to be a discord mod (fast track)...   ",
    "   ⚠️ ACCOUNT SECURITY ALERT: Unusual Login Detected near Moscow, Russia...   ",
    "   WikiHow: How to tell if your fridge is judging you...   ",
    "   [FORUM] Why does my shadow move slightly slower than me?   ",
    "   Searching: Local area worm enthusiasts meeting near me...   ",
    "   DIY Taxidermy for Beginners (WITH PICTURES)   ",
    "   Is it normal to talk to my 47 ferrets? (Reddit Thread)   ",
    "   How to legally marry a ChatGPT bot - Step-by-Step   ",
    "   Searching: Professional Furby Exorcists Near Me (URGENT)   ",
    "   How to explain my 14-inch anime statue to my parents...   ",
    "   Searching: Can you use a waffle iron to cook a whole fish?   ",
    "   Is it weird that I have a crush on the Geico Gecko? (Reddit Thread)   ",
    "   HOW TO HIDE A LARGE HOLE IN THE WALL (WITHOUT SPACKLE)   ",
    "   Order History: 400 lbs of Bulk Dried Mealworms (SHIPPED)   ",
    "   What to do if you accidentally ate a 500-piece puzzle...   ",
    "   Searching: Is it legal to name your child 'Bluetooth Speaker'?   ",
    "   [DEEP THREAD] The hidden geometry of the Obama Cube...   ",
    "   Official 2004 Hamster Dance Remix Archive (FLAC)   ",
    "   Download More RAM (2024 LEGIT) (NO VIRUS) (WORKING)   ",
    "   HOW TO GET MORE FREE AOL MINUTES (WORKING JUNE 2002)   ",
    "   Official Fan Site: The Guy Who Voices the Honda Commercials   ",
    "   ⚠️ WINDOWS FIREWALL: 147 VIRUSES DETECTED (DO NOT CLOSE) ⚠️   ",
    "   Welcome to the Underground Toast Fan Club (Est. 1998)   ",
    "   A Comprehensive Guide to Identifying Different Types of Dirt   ",
    "   [WIKI] List of historical figures who definitely had a tail   ",
    "   Symptoms of: Terminal Main Character Syndrome   ",
    "   Why does my toothpaste taste like a lie?   ",
    "   Searching: Can a human survive on only Vitamin Water and Cheetos?   ",
    "   Official Archive: How to adopt 47 ferrets without a license   ",
    "   WikiHow: How to smell like an old library...   ",
    "   [URGENT] Where to buy authentic dial-up noise on vinyl   ",
    "   YOU WON'T BELIEVE WHAT I JUST ATE (Click for gallery)   "
];

// --- 3. THE BULLETPROOF SCROLLER ---
function startScroll() {
    let msgIndex = Math.floor(Math.random() * prankMessages.length);
    let msg = prankMessages[msgIndex];
    let shiftCount = 0;

    scrollInterval = setInterval(() => {
        // Shift the characters
        msg = msg.substring(1) + msg.substring(0, 1);
        document.title = msg;
        shiftCount++;

        // Reset and Pick New Message when full rotation is reached
        if (shiftCount >= msg.length) {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * prankMessages.length);
            } while (newIndex === msgIndex); // Ensure it's a different message
            
            msgIndex = newIndex;
            msg = prankMessages[msgIndex];
            shiftCount = 0;
            console.log("Switching to: " + msg);
        }
    }, 120); 
}

function stopScroll() {
    clearInterval(scrollInterval);
    document.title = originalTitle;
}

window.onblur = () => { startScroll(); };
window.onfocus = () => { stopScroll(); };
