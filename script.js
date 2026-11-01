let pendingActionType = null;
let currentScreen = 'hero';

function initApp() {
    initClock();
    playLoadingScreen('');
}

function playLoadingScreen(subtitleText = '', callback = null) {
    const loader = document.getElementById('loading-screen');
    const subElem = document.getElementById('loading-sub');
    
    if (subtitleText) {
        subElem.textContent = subtitleText;
        subElem.style.display = 'block';
    } else {
        subElem.textContent = '';
        subElem.style.display = 'none';
    }

    loader.style.opacity = '1';
    loader.style.display = 'flex';

    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
            if (callback) {
                callback();
            } else {
                document.getElementById('hero-screen').style.display = 'flex';
                currentScreen = 'hero';
            }
        }, 500);
    }, 1500);
}

function openApp() {
    closeAllMenus();
    document.getElementById('hero-screen').style.display = 'none';
    document.getElementById('russia-maps-screen').style.display = 'none';
    document.getElementById('game-map-screen').style.display = 'none';
    document.getElementById('donations-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'flex';
    currentScreen = 'app';
}

function openRussiaMaps() {
    closeAllMenus();
    document.getElementById('app-screen').style.display = 'none';
    document.getElementById('russia-maps-screen').style.display = 'flex';
    currentScreen = 'russia';
}

function openGameMap2025() {
    closeAllMenus();
    transitionToScreen('game', 'Открываю карту...');
}

function openDonations() {
    closeAllMenus();
    document.getElementById('hero-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'none';
    document.getElementById('russia-maps-screen').style.display = 'none';
    document.getElementById('game-map-screen').style.display = 'none';
    document.getElementById('donations-screen').style.display = 'flex';
    currentScreen = 'donations';
}

function confirmAction(type) {
    closeAllMenus();
    pendingActionType = type;
    const modal = document.getElementById('confirm-modal');
    const textElem = document.getElementById('confirm-modal-text');
    
    if (type === 'hero') {
        textElem.textContent = 'Вы точно хотите вернуться на главную?';
    } else {
        textElem.textContent = 'Вы точно хотите вернуться назад?';
    }
    
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('confirm-modal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        pendingActionType = null;
    }, 300);
}

function executeAction() {
    const type = pendingActionType;
    closeModal();
    
    setTimeout(() => {
        if (type === 'hero') {
            transitionToScreen('hero', 'Возвращаюсь на главную...');
        } else {
            if (currentScreen === 'game') {
                transitionToScreen('russia', 'Возвращаюсь назад...');
            } else if (currentScreen === 'russia') {
                transitionToScreen('app', 'Возвращаюсь назад...');
            } else {
                transitionToScreen('hero', 'Возвращаюсь назад...');
            }
        }
    }, 300);
}

function transitionToScreen(target, messageText) {
    closeAllMenus();
    document.getElementById('hero-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'none';
    document.getElementById('russia-maps-screen').style.display = 'none';
    document.getElementById('game-map-screen').style.display = 'none';
    document.getElementById('donations-screen').style.display = 'none';

    playLoadingScreen(messageText, () => {
        if (target === 'hero') {
            document.getElementById('hero-screen').style.display = 'flex';
            currentScreen = 'hero';
        } else if (target === 'app') {
            document.getElementById('app-screen').style.display = 'flex';
            currentScreen = 'app';
        } else if (target === 'russia') {
            document.getElementById('russia-maps-screen').style.display = 'flex';
            currentScreen = 'russia';
        } else if (target === 'game') {
            document.getElementById('game-map-screen').style.display = 'flex';
            currentScreen = 'game';
            initMap_RU_2025();
        }
    });
}

function toggleMenu(menuId) {
    const buttons = {
        'hero-menu': 'btn-hero-menu',
        'app-menu': 'btn-app-menu',
        'russia-menu': 'btn-russia-menu',
        'game-menu': 'btn-game-menu',
        'donations-menu': 'btn-donations-menu'
    };

    const targetMenu = document.getElementById(menuId);
    const targetBtn = document.getElementById(buttons[menuId]);
    const isOpen = targetMenu.style.display === 'flex';

    closeAllMenus();

    if (!isOpen) {
        targetMenu.style.display = 'flex';
        targetBtn.classList.add('active');
    }
}

function closeAllMenus() {
    const menus = ['hero-menu', 'app-menu', 'russia-menu', 'game-menu', 'donations-menu'];
    const buttons = ['btn-hero-menu', 'btn-app-menu', 'btn-russia-menu', 'btn-game-menu', 'btn-donations-menu'];

    menus.forEach(id => {
        const m = document.getElementById(id);
        if (m) m.style.display = 'none';
    });

    buttons.forEach(id => {
        const b = document.getElementById(id);
        if (b) b.classList.remove('active');
    });
}

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
    const clockRussia = document.getElementById('clock-russia');
    const clockGame = document.getElementById('clock-game');
    const clockDonations = document.getElementById('clock-donations');

    if (clockHero) clockHero.textContent = timeString;
    if (clockApp) clockApp.textContent = timeString;
    if (clockRussia) clockRussia.textContent = timeString;
    if (clockGame) clockGame.textContent = timeString;
    if (clockDonations) clockDonations.textContent = timeString;
}