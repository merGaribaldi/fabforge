// Универсальный движок карты Fabforge и структура показателей
let selectedRegion = null;
let currentSelectedRegionId = null;
let mapScale = 1;
let mapX = 0;
let mapY = 0;
let isPanning = false;
let startX = 0, startY = 0;
let viewportInitialized = false;

window.showChelyabinskEasterEgg = function() {
    const container = document.getElementById('chelyabinsk-easter-egg-box');
    if (container) {
        container.style.display = container.style.display === 'none' ? 'block' : 'none';
    }
};

// Функция переключения минималистичного обоснования по кнопке «i»
window.toggleMinimalExplanation = function() {
    const box = document.getElementById('minimal-explanation-box');
    const btn = event.currentTarget;
    if (box) {
        if (box.style.display === 'block') {
            box.style.display = 'none';
            btn.classList.remove('active');
        } else {
            box.style.display = 'block';
            btn.classList.add('active');
        }
    }
};

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

function initMap_RU_2025() {
    console.log("Инициализация карты России 2025 через движок map.js...");
    mapScale = 1;
    mapX = 0;
    mapY = 0;
    updateMapTransform();
    loadAndInjectSvgMap();

    if (!viewportInitialized) {
        viewportInitialized = true;
        setupViewportListeners();
    }
}

async function loadAndInjectSvgMap() {
    const container = document.getElementById('map-inner-container');
    if (!container) return;

    try {
        const response = await fetch('maps/russia/2025/map-russia.svg');
        if (!response.ok) throw new Error(`Ошибка загрузки: ${response.status}`);
        const svgText = await response.text();
        container.innerHTML = svgText;
        initSvgInteractivity();
    } catch (e) {
        console.error("Не удалось подгрузить SVG карту:", e);
        container.innerHTML = `<p style="color: #71717a; text-align: center;">Не удалось загрузить файл карты:<br><b>maps/russia/2025/map-russia.svg</b></p>`;
    }
}

function updateMapTransform() {
    const innerContainer = document.getElementById('map-inner-container');
    if (innerContainer) {
        innerContainer.style.transform = `translate(${mapX}px, ${mapY}px) scale(${mapScale})`;
    }
}

function zoomIn() {
    mapScale = Math.min(mapScale * 1.25, 8);
    updateMapTransform();
}

function zoomOut() {
    mapScale = Math.max(mapScale / 1.25, 0.5);
    updateMapTransform();
}

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

function setupViewportListeners() {
    const viewport = document.querySelector('.map-viewport');
    if (!viewport) return;

    viewport.addEventListener('mousedown', (e) => {
        if (e.button === 1) {
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

    window.addEventListener('mouseup', () => {
        if (isPanning) {
            isPanning = false;
            const vp = document.querySelector('.map-viewport');
            if (vp) vp.style.cursor = 'default';
        }
    });
}

// Вспомогательная функция для поиска валидного ID региона по клику или вверх по дереву
function findRegionTarget(element) {
    let curr = element;
    while (curr && curr.tagName && curr.tagName.toLowerCase() !== 'svg') {
        const id = curr.getAttribute('id');
        if (id && id !== 'map-inner-container' && id !== 'fabforge-map-styles') {
            // Проверим, есть ли такое имя в нашей базе или это действительно регион
            return { element: curr, id: id };
        }
        curr = curr.parentElement;
    }
    return null;
}

function initSvgInteractivity() {
    const container = document.getElementById('map-inner-container');
    if (!container) return;
    const svgElement = container.querySelector('svg');
    if (!svgElement) return;

    svgElement.style.width = '100%';
    svgElement.style.height = '100%';
    svgElement.style.display = 'block';

    let styleTag = svgElement.querySelector('#fabforge-map-styles');
    if (!styleTag) {
        styleTag = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        styleTag.id = 'fabforge-map-styles';
        styleTag.textContent = `
            @keyframes goldPulse {
                0% { stroke: #d4af37; stroke-opacity: 0.4; }
                50% { stroke: #d4af37; stroke-opacity: 1; filter: drop-shadow(0 0 2px #d4af37); }
                100% { stroke: #d4af37; stroke-opacity: 0.4; }
            }
            .pulse-border { animation: goldPulse 1.2s infinite ease-in-out; }
            .selected-region { fill: #d4af37 !important; stroke: #d4af37 !important; }
        `;
        svgElement.appendChild(styleTag);
    }

    svgElement.addEventListener('click', (e) => {
        if (e.target === svgElement || e.target.tagName === 'svg') clearSelection();
    });

    const clickableElements = svgElement.querySelectorAll('path, polygon, g[id]');
    clickableElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            const match = findRegionTarget(el);
            if (match && match.element !== selectedRegion) {
                match.element.classList.add('pulse-border');
            }
        });
        el.addEventListener('mouseleave', () => {
            const match = findRegionTarget(el);
            if (match && match.element !== selectedRegion) {
                match.element.classList.remove('pulse-border');
            }
        });
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const match = findRegionTarget(el);
            if (!match) return;

            const region = match.element;
            const regionId = match.id;

            if (selectedRegion === region) {
                clearSelection();
                return;
            }

            selectRegionElement(region, regionId);
        });
    });
}

function selectRegionElement(region, regionId) {
    if (selectedRegion) {
        selectedRegion.classList.remove('selected-region');
        selectedRegion.classList.remove('pulse-border');
    }

    selectedRegion = region;
    region.classList.remove('pulse-border');
    region.classList.add('selected-region');

    updateDataPanelForRegion(regionId);
}

// ФУНКЦИЯ ПОИСКА РЕГИОНА ПО ТЕКСТУ (без зума)
window.searchRegion = function(query) {
    const q = query.trim().toLowerCase();
    const dropdown = document.getElementById('search-dropdown');
    if (!dropdown) return;

    if (q.length < 2) {
        dropdown.style.display = 'none';
        dropdown.innerHTML = '';
        return;
    }

    const matches = [];
    for (const [id, rusName] of Object.entries(RU_2025_DATA.regionNames)) {
        if (rusName.toLowerCase().includes(q) || id.toLowerCase().includes(q)) {
            matches.push({ id, name: rusName });
        }
    }

    if (matches.length === 0) {
        dropdown.style.display = 'block';
        dropdown.innerHTML = `<div class="search-item" style="color: #71717a; cursor: default;">Ничего не найдено</div>`;
        return;
    }

    let html = '';
    matches.forEach(m => {
        html += `<div class="search-item" onclick="focusOnRegion('${m.id}', '${m.name}')">${m.name}</div>`;
    });

    dropdown.style.display = 'block';
    dropdown.innerHTML = html;
};

// ПЕРЕХОД К ВЫБРАННОМУ РЕГИОНУ ИЗ ПОИСКА (только выделение, без приближения)
window.focusOnRegion = function(regionId, regionName) {
    const searchInput = document.getElementById('map-search-input');
    const dropdown = document.getElementById('search-dropdown');
    if (searchInput) searchInput.value = regionName;
    if (dropdown) dropdown.style.display = 'none';

    const container = document.getElementById('map-inner-container');
    if (!container) return;
    const svgElement = container.querySelector('svg');
    if (!svgElement) return;

    let targetRegion = svgElement.querySelector(`#${CSS.escape(regionId)}`);
    if (!targetRegion) {
        const allElements = svgElement.querySelectorAll('[id]');
        for (const el of allElements) {
            if (el.getAttribute('id').toLowerCase() === regionId.toLowerCase()) {
                targetRegion = el;
                break;
            }
        }
    }

    if (targetRegion) {
        selectRegionElement(targetRegion, regionId);
    } else {
        updateDataPanelForRegion(regionId);
    }
};

function clearSelection() {
    if (selectedRegion) {
        selectedRegion.classList.remove('selected-region');
        selectedRegion.classList.remove('pulse-border');
        selectedRegion = null;
    }
    currentSelectedRegionId = null;
    resetDataPanel();
    const clearBtn = document.getElementById('map-clear-btn');
    if (clearBtn) clearBtn.classList.remove('visible');
    const searchInput = document.getElementById('map-search-input');
    if (searchInput) searchInput.value = '';
    const dropdown = document.getElementById('search-dropdown');
    if (dropdown) dropdown.style.display = 'none';
}

function getRegionIndicatorsData(regionId) {
    if (RU_2025_DATA.indicatorsDatabase[regionId]) {
        return RU_2025_DATA.indicatorsDatabase[regionId];
    }
    return RU_2025_DATA.indicatorsDatabase["default"];
}

function updateDataPanelForRegion(regionId) {
    currentSelectedRegionId = regionId;
    const content = document.querySelector('.data-panel-content');
    if (content) {
        const rawName = RU_2025_DATA.regionNames[regionId] || regionId;
        const formattedNameHtml = RU_2025_DATA.getFormattedRegionName(regionId, rawName);

        content.innerHTML = `
            <div class="fade-in">
                <h3>Выбранный регион</h3>
                <p style="font-size: 1.15rem; color: #f4f4f5; font-weight: 600; margin-top: 10px; margin-bottom: 15px; letter-spacing: 0.5px; display: flex; flex-direction: column; gap: 8px;">
                    <span>${formattedNameHtml}</span>
                </p>
                <p style="font-size: 0.85rem; color: #a1a1aa; margin-bottom: 15px;">Выберите группу показателей:</p>
                <button class="panel-menu-btn" onclick="openWideView()">Широкие показатели</button>
                <button class="panel-menu-btn" onclick="openNarrowCategoriesView()">Узкие показатели</button>
            </div>
        `;
    }
    const clearBtn = document.getElementById('map-clear-btn');
    if (clearBtn) clearBtn.classList.add('visible');
}

function openWideView() {
    const content = document.querySelector('.data-panel-content');
    if (!content) return;

    const regData = getRegionIndicatorsData(currentSelectedRegionId);
    let itemsHtml = regData.wide.map((item, index) => {
        return `
            <div class="indicator-item-wrapper" style="margin-bottom: 8px;">
                <button class="indicator-btn" onclick="openIndicatorDetail('wide', null, ${index})">
                    <span>${item.name}</span>
                    <span style="color: #d4af37;">→</span>
                </button>
            </div>
        `;
    }).join('');

    content.innerHTML = `
        <div class="fade-in">
            <button class="panel-back-btn" onclick="updateDataPanelForRegion(currentSelectedRegionId)">← Назад к региону</button>
            <h3>Широкие показатели</h3>
            <div style="margin-top: 15px; display: flex; flex-direction: column; gap: 8px;">
                ${itemsHtml}
            </div>
        </div>
    `;
}

function openNarrowCategoriesView() {
    const content = document.querySelector('.data-panel-content');
    if (!content) return;

    content.innerHTML = `
        <div class="fade-in">
            <button class="panel-back-btn" onclick="updateDataPanelForRegion(currentSelectedRegionId)">← Назад к региону</button>
            <h3>Узкие показатели</h3>
            <p style="font-size: 0.85rem; color: #a1a1aa; margin-bottom: 15px; margin-top: 5px;">Выберите сферу жизни:</p>
            <button class="panel-menu-btn" onclick="openNarrowSphereView('economy')">Экономика и Финансы</button>
            <button class="panel-menu-btn" onclick="openNarrowSphereView('social')">Социальная сфера и Демография</button>
            <button class="panel-menu-btn" onclick="openNarrowSphereView('infrastructure')">Инфраструктура и ЖКХ</button>
            <button class="panel-menu-btn" onclick="openNarrowSphereView('tech_ecology')">Наука, Экология и Безопасность</button>
        </div>
    `;
}

function openNarrowSphereView(sphereKey) {
    const regData = getRegionIndicatorsData(currentSelectedRegionId);
    const sphereData = regData.narrow[sphereKey];
    if (!sphereData) return;

    const content = document.querySelector('.data-panel-content');
    if (!content) return;

    let itemsHtml = sphereData.items.map((item, index) => {
        return `
            <div class="indicator-item-wrapper" style="margin-bottom: 8px;">
                <button class="indicator-btn" onclick="openIndicatorDetail('narrow', '${sphereKey}', ${index})">
                    <span>${item.name}</span>
                    <span style="color: #d4af37;">→</span>
                </button>
            </div>
        `;
    }).join('');

    content.innerHTML = `
        <div class="fade-in">
            <button class="panel-back-btn" onclick="openNarrowCategoriesView()">← Назад к сферам</button>
            <h3>${sphereData.title}</h3>
            <div style="margin-top: 15px; display: flex; flex-direction: column; gap: 8px;">
                ${itemsHtml}
            </div>
        </div>
    `;
}

function openIndicatorDetail(type, sphereKey, index) {
    const regData = getRegionIndicatorsData(currentSelectedRegionId);
    let indicator;
    let backAction;

    if (type === 'wide') {
        indicator = regData.wide[index];
        backAction = 'openWideView()';
    } else {
        indicator = regData.narrow[sphereKey].items[index];
        backAction = `openNarrowSphereView('${sphereKey}')`;
    }

    if (!indicator) return;

    const content = document.querySelector('.data-panel-content');
    if (!content) return;

    const hasInfo = indicator.explanation && indicator.explanation.trim().length > 0;

    content.innerHTML = `
        <div class="fade-in">
            <button class="panel-back-btn" onclick="${backAction}">← Назад к списку</button>
            <div class="indicator-detail-card" style="margin-top: 12px;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; gap: 10px;">
                    <div class="indicator-detail-title" style="font-size: 1.05rem; font-weight: 600; color: #f4f4f5; line-height: 1.4; flex-grow: 1; margin: 0;">${indicator.name}</div>
                    ${hasInfo ? `
                        <button class="minimal-i-btn" onclick="toggleMinimalExplanation()" title="Показать обоснование">i</button>
                    ` : ''}
                </div>

                <div class="indicator-detail-desc" style="font-size: 0.82rem; color: #a1a1aa; margin-bottom: 8px;">Значение параметра по региону:</div>
                
                <div class="indicator-value-box" style="margin-bottom: 0;">
                    <b>${indicator.value}</b>
                </div>

                ${hasInfo ? `
                    <div id="minimal-explanation-box" class="minimal-explanation-box" style="display: none;">
                        ${indicator.explanation}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function resetDataPanel() {
    const content = document.querySelector('.data-panel-content');
    if (content) {
        content.innerHTML = `
            <h3>Панель управления</h3>
            <p>Нажмите на любой регион на карте, чтобы получить подробную информацию о территории.</p>
        `;
    }
}

window.clearSelectionFromPanel = function() {
    const container = document.getElementById('map-inner-container');
    if (container) {
        const svgElement = container.querySelector('svg');
        if (svgElement) {
            svgElement.querySelectorAll('path, polygon, g[id]').forEach(r => {
                r.classList.remove('selected-region');
                r.classList.remove('pulse-border');
            });
        }
    }
    clearSelection();
};