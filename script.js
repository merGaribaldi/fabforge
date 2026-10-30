let pendingActionType = null;

// Инициализация приложения при первой загрузке
function initApp() {
    initClock();
    playLoadingScreen('');
}

// Функция для показа экрана загрузки (с текстом или без)
function playLoadingScreen(subtitleText = '') {
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

    // Плавное скрытие экрана загрузки через 1.5 секунды
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
            document.getElementById('hero-screen').style.display = 'flex';
        }, 500);
    }, 1500);
}

function openApp() {
    closeAllMenus();
    document.getElementById('hero-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'flex';
}

function openDonations() {
    closeAllMenus();
    document.getElementById('hero-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'none';
    document.getElementById('donations-screen').style.display = 'flex';
}

// Управление модальным окном подтверждения
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
            returnToHero('Возвращаюсь на главную...');
        } else {
            returnToHero('Возвращаюсь назад...');
        }
    }, 300);
}

function returnToHero(messageText) {
    closeAllMenus();
    document.getElementById('app-screen').style.display = 'none';
    document.getElementById('donations-screen').style.display = 'none';
    document.getElementById('hero-screen').style.display = 'none';

    playLoadingScreen(messageText);
}

// Универсальное управление выпадающим меню с поворотом кнопки
function toggleMenu(menuId) {
    const buttons = {
        'hero-menu': 'btn-hero-menu',
        'app-menu': 'btn-app-menu',
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

// Закрытие всех меню
function closeAllMenus() {
    const menus = ['hero-menu', 'app-menu', 'donations-menu'];
    const buttons = ['btn-hero-menu', 'btn-app-menu', 'btn-donations-menu'];

    menus.forEach(id => {
        const m = document.getElementById(id);
        if (m) m.style.display = 'none';
    });

    buttons.forEach(id => {
        const b = document.getElementById(id);
        if (b) b.classList.remove('active');
    });
}

// Живые часы для всех экранов
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
    const clockDonations = document.getElementById('clock-donations');

    if (clockHero) clockHero.textContent = timeString;
    if (clockApp) clockApp.textContent = timeString;
    if (clockDonations) clockDonations.textContent = timeString;
}