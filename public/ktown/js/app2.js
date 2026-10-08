        function updateClock() {
            const clockElement = document.getElementById('clockTime');
            const now = new Date();
            clockElement.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
        setInterval(updateClock, 1000);
        updateClock();
    
