function openApp() {
    document.getElementById('hero-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'flex';
}

function returnToHero() {
    document.getElementById('app-screen').style.display = 'none';
    document.getElementById('hero-screen').style.display = 'flex';
}

function toggleMenu() {
    const menu = document.getElementById('dropdown-menu');
    if (menu.style.display === 'none') {
        menu.style.display = 'flex';
    } else {
        menu.style.display = 'none';
    }
}

// Живые часы для терминала
function initClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;

    const clockHero = document.getElementById('clock-hero');
    const clockApp = document.getElementById('clock-app');

    if (clockHero) clockHero.textContent = timeString;
    if (clockApp) clockApp.textContent = timeString;
}