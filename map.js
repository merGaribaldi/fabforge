// Базовый движок карты Fabforge

// Функция открытия/закрытия правой панели данных
function toggleDataPanel() {
    const panel = document.getElementById('data-panel');
    const toggleBtn = document.getElementById('panel-toggle-btn');
    
    const isClosed = panel.classList.contains('collapsed');
    
    if (isClosed) {
        panel.classList.remove('collapsed');
        toggleBtn.textContent = '→'; // Когда меню РАЗВЁРНУТО — стрелка смотрит вправо
        toggleBtn.title = 'Свернуть панель';
    } else {
        panel.classList.add('collapsed');
        toggleBtn.textContent = '←'; // Когда меню СВЁРНУТО — стрелка смотрит влево
        toggleBtn.title = 'Развернуть панель';
    }
}

// Инициализация карты России 2025 (интерфейсная заглушка)
function initMap_RU_2025() {
    console.log("Интерфейс карты Россия 2025 успешно инициализирован!");
}