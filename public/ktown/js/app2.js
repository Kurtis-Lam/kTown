const clockElement = document.getElementById('clockTime');
function updateClock() {
    if (document.hidden) return;
    clockElement.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
setInterval(updateClock, 1000);
updateClock();