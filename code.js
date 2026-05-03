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


//For on load.
});