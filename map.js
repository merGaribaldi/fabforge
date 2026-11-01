// Базовый движок карты Fabforge

let selectedRegion = null;
let mapScale = 1;
let mapX = 0;
let mapY = 0;
let isPanning = false;
let startX = 0, startY = 0;

// Функция открытия/закрытия правой панели данных
function toggleDataPanel() {
    const panel = document.getElementById('data-panel');
    const toggleBtn = document.getElementById('panel-toggle-btn');
    
    const isClosed = panel.classList.contains('collapsed');
    
    if (isClosed) {
        panel.classList.remove('collapsed');
        toggleBtn.textContent = '→'; 
        toggleBtn.title = 'Свернуть панель';
    } else {
        panel.classList.add('collapsed');
        toggleBtn.textContent = '←'; 
        toggleBtn.title = 'Развернуть панель';
    }
}

// Инициализация карты России 2025
function initMap_RU_2025() {
    console.log("Интерфейс карты Россия 2025 успешно инициализирован!");
    mapScale = 1;
    mapX = 0;
    mapY = 0;
    updateMapTransform();
}

// Обновление трансформации (зума и смещения) карты
function updateMapTransform() {
    const mapObject = document.getElementById('russia-map-object');
    if (mapObject) {
        mapObject.style.transform = `translate(${mapX}px, ${mapY}px) scale(${mapScale})`;
    }
}

// Функции зума по кнопкам и горячим клавишам
function zoomIn() {
    mapScale = Math.min(mapScale * 1.25, 8);
    updateMapTransform();
}

function zoomOut() {
    mapScale = Math.max(mapScale / 1.25, 0.5);
    updateMapTransform();
}

// Глобальные горячие клавиши для ПК (+ и -)
window.addEventListener('keydown', (e) => {
    const gameScreen = document.getElementById('game-map-screen');
    if (gameScreen && gameScreen.style.display !== 'none') {
        if (e.key === '+' || e.key === '=' || e.code === 'NumpadAdd') {
            e.preventDefault();
            zoomIn();
        } else if (e.key === '-' || e.code === 'NumpadSubtract') {
            e.preventDefault();
            zoomOut();
        }
    }
});

// Функция инициализации интерактивности, панорамирования колёсиком и кликов
function initSvgMap() {
    const mapObject = document.getElementById('russia-map-object');
    if (!mapObject) return;
    
    const viewport = document.querySelector('.map-viewport');
    if (viewport && !viewport.dataset.panInitialized) {
        viewport.dataset.panInitialized = "true";
        
        // Перетаскивание карты ЗАТЯЖКОЙ СРЕДНЕЙ КНОПКИ МЫШИ (колёсико) на ПК
        viewport.addEventListener('mousedown', (e) => {
            if (e.button === 1) { // Нажатие на колёсико мыши
                e.preventDefault();
                isPanning = true;
                startX = e.clientX - mapX;
                startY = e.clientY - mapY;
                viewport.style.cursor = 'grabbing';
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (!isPanning) return;
            mapX = e.clientX - startX;
            mapY = e.clientY - startY;
            updateMapTransform();
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 1 || isPanning) {
                isPanning = false;
                if (viewport) viewport.style.cursor = 'default';
            }
        });

        // Предотвращаем стандартное меню браузера при клике колёсиком
        viewport.addEventListener('contextmenu', (e) => {
            if (e.button === 1) e.preventDefault();
        });

        // Мобильная поддержка тач-жестов (перемещение пальцем на смартфонах)
        viewport.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                isPanning = true;
                startX = e.touches[0].clientX - mapX;
                startY = e.touches[0].clientY - mapY;
            }
        }, { passive: true });

        viewport.addEventListener('touchmove', (e) => {
            if (!isPanning || e.touches.length !== 1) return;
            mapX = e.touches[0].clientX - startX;
            mapY = e.touches[0].clientY - startY;
            updateMapTransform();
        }, { passive: true });

        viewport.addEventListener('touchend', () => {
            isPanning = false;
        });
    }

    try {
        const svgDoc = mapObject.contentDocument;
        if (!svgDoc) return;
        
        let styleTag = svgDoc.getElementById('fabforge-map-styles');
        if (!styleTag) {
            styleTag = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'style');
            styleTag.id = 'fabforge-map-styles';
            styleTag.textContent = `
                @keyframes goldPulse {
                    0% { stroke: #d4af37; stroke-opacity: 0.4; }
                    50% { stroke: #d4af37; stroke-opacity: 1; filter: drop-shadow(0 0 2px #d4af37); }
                    100% { stroke: #d4af37; stroke-opacity: 0.4; }
                }
                .pulse-border {
                    animation: goldPulse 1.2s infinite ease-in-out;
                }
                .selected-region {
                    fill: #d4af37 !important;
                    stroke: #d4af37 !important;
                }
            `;
            svgDoc.documentElement.appendChild(styleTag);
        }

        // Клик по фону внутри SVG — снятие выделения
        svgDoc.addEventListener('click', (e) => {
            if (e.target === svgDoc.documentElement || e.target.tagName === 'svg') {
                clearSelection();
            }
        });
        
        const regions = svgDoc.querySelectorAll('path, polygon, g[id]');
        
        regions.forEach(region => {
            region.addEventListener('mouseenter', () => {
                if (region !== selectedRegion) {
                    region.classList.add('pulse-border');
                }
            });
            
            region.addEventListener('mouseleave', () => {
                if (region !== selectedRegion) {
                    region.classList.remove('pulse-border');
                }
            });
            
            region.addEventListener('click', (e) => {
                e.stopPropagation();
                const regionId = region.getAttribute('id') || region.getAttribute('name') || 'unknown';
                
                if (selectedRegion === region) {
                    clearSelection();
                    return;
                }
                
                if (selectedRegion) {
                    selectedRegion.classList.remove('selected-region');
                    selectedRegion.classList.remove('pulse-border');
                }
                
                selectedRegion = region;
                region.classList.remove('pulse-border');
                region.classList.add('selected-region');
                
                updateDataPanelForRegion(regionId);
            });
        });
        
        console.log("SVG карта успешно подключена, найдено регионов:", regions.length);
    } catch (e) {
        console.warn("Не удалось получить доступ к содержимому SVG:", e);
    }
}

// Полный сброс выделения регионов
function clearSelection() {
    if (selectedRegion) {
        selectedRegion.classList.remove('selected-region');
        selectedRegion.classList.remove('pulse-border');
        selectedRegion = null;
    }
    resetDataPanel();
    const clearBtn = document.getElementById('map-clear-btn');
    if (clearBtn) clearBtn.classList.remove('visible');
}

// Обновление правой панели и появление крестика сброса
function updateDataPanelForRegion(regionId) {
    const content = document.querySelector('.data-panel-content');
    if (content) {
        const readableName = (typeof RU_2025_DATA !== 'undefined' && RU_2025_DATA.regionNames && RU_2025_DATA.regionNames[regionId]) 
            ? RU_2025_DATA.regionNames[regionId] 
            : regionId;

        content.innerHTML = `
            <h3>Выбранный регион</h3>
            <p style="font-size: 1.15rem; color: #f4f4f5; font-weight: 600; margin-top: 15px; letter-spacing: 0.5px;">${readableName}</p>
        `;
    }
    const clearBtn = document.getElementById('map-clear-btn');
    if (clearBtn) clearBtn.classList.add('visible');
}

// Возврат панели в исходное состояние
function resetDataPanel() {
    const content = document.querySelector('.data-panel-content');
    if (content) {
        content.innerHTML = `
            <h3>Панель управления</h3>
            <p>Нажмите на любой регион на карте, чтобы получить подробную информацию о территории.</p>
        `;
    }
}

// Глобальная функция сброса
window.clearSelectionFromPanel = function() {
    const mapObject = document.getElementById('russia-map-object');
    if (mapObject && mapObject.contentDocument) {
        const svgDoc = mapObject.contentDocument;
        const regions = svgDoc.querySelectorAll('path, polygon, g[id]');
        regions.forEach(r => {
            r.classList.remove('selected-region');
            r.classList.remove('pulse-border');
        });
    }
    clearSelection();
};