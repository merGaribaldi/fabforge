// Универсальный движок карты Fabforge и структура показателей
let selectedRegion = null;
let currentSelectedRegionId = null;
let mapScale = 1;
let mapX = 0;
let mapY = 0;
let isPanning = false;
let startX = 0, startY = 0;
let viewportInitialized = false;
let globalSearchListenersAdded = false;

// Справочник показателей для умного поиска
const INDICATORS_CATALOG = [
    // Широкие показатели
    { type: 'wide', sphereKey: null, categoryLabel: 'Широкие показатели', name: 'Валовой региональный продукт (ВРП) и ВРП на душу населения' },
    { type: 'wide', sphereKey: null, categoryLabel: 'Широкие показатели', name: 'Численность и динамика населения' },
    { type: 'wide', sphereKey: null, categoryLabel: 'Широкие показатели', name: 'Уровень безработицы' },
    { type: 'wide', sphereKey: null, categoryLabel: 'Широкие показатели', name: 'Доля дорог, соответствующих нормативам' },
    { type: 'wide', sphereKey: null, categoryLabel: 'Широкие показатели', name: 'Уровень газификации региона' },
    { type: 'wide', sphereKey: null, categoryLabel: 'Широкие показатели', name: 'Общий уровень преступности на 100 тысяч населения' },
    { type: 'wide', sphereKey: null, categoryLabel: 'Широкие показатели', name: 'Уровень дотационности региона' },
    { type: 'wide', sphereKey: null, categoryLabel: 'Широкие показатели', name: 'Государственный долг региона' },
    { type: 'wide', sphereKey: null, categoryLabel: 'Широкие показатели', name: 'Миграция (эмиграция и иммиграция)' },

    // Узкие показатели: Экономика и Финансы
    { type: 'narrow', sphereKey: 'economy', categoryLabel: 'Экономика и Финансы', name: 'Инфляция по региону' },
    { type: 'narrow', sphereKey: 'economy', categoryLabel: 'Экономика и Финансы', name: 'Налоговое бремя' },
    { type: 'narrow', sphereKey: 'economy', categoryLabel: 'Экономика и Финансы', name: 'Стоимость фиксированного набора товаров и услуг' },
    { type: 'narrow', sphereKey: 'economy', categoryLabel: 'Экономика и Финансы', name: 'Объем инвестиций' },
    { type: 'narrow', sphereKey: 'economy', categoryLabel: 'Экономика и Финансы', name: 'Доля малого и среднего предпринимательства (МСП) в экономике' },
    { type: 'narrow', sphereKey: 'economy', categoryLabel: 'Экономика и Финансы', name: 'Доля прибыльных предприятий' },

    // Узкие показатели: Социальная сфера и Демография
    { type: 'narrow', sphereKey: 'social', categoryLabel: 'Социальная сфера и Демография', name: 'Коэффициент рождаемости' },
    { type: 'narrow', sphereKey: 'social', categoryLabel: 'Социальная сфера и Демография', name: 'Средняя продолжительность жизни' },
    { type: 'narrow', sphereKey: 'social', categoryLabel: 'Социальная сфера и Демография', name: 'Уровень бедности' },
    { type: 'narrow', sphereKey: 'social', categoryLabel: 'Социальная сфера и Демография', name: 'Городское и сельское население' },
    { type: 'narrow', sphereKey: 'social', categoryLabel: 'Социальная сфера и Демография', name: 'Средний балл ЕГЭ по региону' },
    { type: 'narrow', sphereKey: 'social', categoryLabel: 'Социальная сфера и Демография', name: 'Обеспеченность врачами и средним медперсоналом' },
    { type: 'narrow', sphereKey: 'social', categoryLabel: 'Социальная сфера и Демография', name: 'Обеспеченность учреждениями культуры' },

    // Узкие показатели: Инфраструктура и ЖКХ
    { type: 'narrow', sphereKey: 'infrastructure', categoryLabel: 'Инфраструктура и ЖКХ', name: 'Качество транспортной сети' },
    { type: 'narrow', sphereKey: 'infrastructure', categoryLabel: 'Инфраструктура и ЖКХ', name: 'Износ коммунальных сетей' },
    { type: 'narrow', sphereKey: 'infrastructure', categoryLabel: 'Инфраструктура и ЖКХ', name: 'Ввод жилья на душу населения' },
    { type: 'narrow', sphereKey: 'infrastructure', categoryLabel: 'Инфраструктура и ЖКХ', name: 'Коэффициент доступности жилья' },

    // Узкие показатели: Наука, Экология и Безопасность
    { type: 'narrow', sphereKey: 'tech_ecology', categoryLabel: 'Наука, Экология и Безопасность', name: 'Количество выданных патентов' },
    { type: 'narrow', sphereKey: 'tech_ecology', categoryLabel: 'Наука, Экология и Безопасность', name: 'Объем выбросов загрязняющих веществ' },
    { type: 'narrow', sphereKey: 'tech_ecology', categoryLabel: 'Наука, Экология и Безопасность', name: 'Энергетика (выработка и потребление)' },
    { type: 'narrow', sphereKey: 'tech_ecology', categoryLabel: 'Наука, Экология и Безопасность', name: 'Цифровизация' },
    { type: 'narrow', sphereKey: 'tech_ecology', categoryLabel: 'Наука, Экология и Безопасность', name: 'Мобилизационный ресурс' }
];

function normalizeSearchStr(str) {
    return (str || '').toLowerCase().replace(/ё/g, 'е').trim();
}

window.showChelyabinskEasterEgg = function() {
    const container = document.getElementById('chelyabinsk-easter-egg-box');
    if (container) {
        container.style.display = container.style.display === 'none' ? 'block' : 'none';
    }
};

// Функция переключения минималистичного обоснования по кнопке «i»
window.toggleMinimalExplanation = function(e) {
    const box = document.getElementById('minimal-explanation-box');
    const btn = (e && e.currentTarget) ? e.currentTarget : document.querySelector('.minimal-i-btn');
    if (box) {
        if (box.style.display === 'block') {
            box.style.display = 'none';
            if (btn) btn.classList.remove('active');
        } else {
            box.style.display = 'block';
            if (btn) btn.classList.add('active');
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

function setupGlobalSearchListeners() {
    if (globalSearchListenersAdded) return;
    globalSearchListenersAdded = true;

    document.addEventListener('click', (e) => {
        const regWrapper = document.getElementById('region-search-wrapper');
        if (regWrapper && !regWrapper.contains(e.target)) {
            closeRegionSearchPopover();
        }

        const indWrapper = document.getElementById('indicator-search-wrapper');
        if (indWrapper && !indWrapper.contains(e.target)) {
            closeIndicatorSearchPopover();
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeRegionSearchPopover();
            closeIndicatorSearchPopover();
        }
    });
}

function initMap_RU_2025() {
    console.log("Инициализация карты России 2025 через движок map.js...");
    mapScale = 1;
    mapX = 0;
    mapY = 0;
    updateMapTransform();
    loadAndInjectSvgMap();
    setupGlobalSearchListeners();

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
        // Не перехватываем + и -, если пользователь печатает в поле поиска
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
            return;
        }
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

function findRegionTarget(element) {
    let curr = element;
    while (curr && curr.tagName && curr.tagName.toLowerCase() !== 'svg') {
        const id = curr.getAttribute('id');
        if (id && id !== 'map-inner-container' && id !== 'fabforge-map-styles') {
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

// === УПРАВЛЕНИЕ ОБЛАКОМ ПОИСКА РЕГИОНА ===
window.toggleRegionSearchPopover = function(e) {
    if (e) e.stopPropagation();
    closeIndicatorSearchPopover();

    const popover = document.getElementById('region-search-popover');
    const btn = document.getElementById('region-search-toggle');
    const input = document.getElementById('map-search-input');
    if (!popover || !btn) return;

    const isOpen = popover.style.display === 'block';
    if (isOpen) {
        closeRegionSearchPopover();
    } else {
        popover.style.display = 'block';
        btn.classList.add('active');
        if (input) {
            input.focus();
            input.select();
            if (input.value.trim().length >= 2) {
                searchRegion(input.value);
            }
        }
    }
};

function closeRegionSearchPopover() {
    const popover = document.getElementById('region-search-popover');
    const btn = document.getElementById('region-search-toggle');
    const dropdown = document.getElementById('search-dropdown');
    if (popover) popover.style.display = 'none';
    if (btn) btn.classList.remove('active');
    if (dropdown) dropdown.style.display = 'none';
}

// ФУНКЦИЯ ПОИСКА РЕГИОНА ПО ТЕКСТУ
window.searchRegion = function(query) {
    const q = normalizeSearchStr(query);
    const dropdown = document.getElementById('search-dropdown');
    if (!dropdown) return;

    if (q.length < 2) {
        dropdown.style.display = 'none';
        dropdown.innerHTML = '';
        return;
    }

    const matches = [];
    if (typeof RU_2025_DATA !== 'undefined' && RU_2025_DATA.regionNames) {
        for (const [id, rusName] of Object.entries(RU_2025_DATA.regionNames)) {
            if (normalizeSearchStr(rusName).includes(q) || normalizeSearchStr(id).includes(q)) {
                matches.push({ id, name: rusName });
            }
        }
    }

    if (matches.length === 0) {
        dropdown.style.display = 'block';
        dropdown.innerHTML = `<div class="search-item" style="color: #71717a; cursor: default;">Ничего не найдено</div>`;
        return;
    }

    dropdown.style.display = 'block';
    dropdown.innerHTML = '';
    matches.forEach(m => {
        const item = document.createElement('div');
        item.className = 'search-item';
        item.textContent = m.name;
        item.onclick = () => focusOnRegion(m.id, m.name);
        dropdown.appendChild(item);
    });
};

// ПЕРЕХОД К ВЫБРАННОМУ РЕГИОНУ ИЗ ПОИСКА
window.focusOnRegion = function(regionId, regionName) {
    const searchInput = document.getElementById('map-search-input');
    if (searchInput) searchInput.value = regionName;
    closeRegionSearchPopover();

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

// === УПРАВЛЕНИЕ ОБЛАКОМ ПОИСКА ПОКАЗАТЕЛЕЙ ===
window.toggleIndicatorSearchPopover = function(e) {
    if (e) e.stopPropagation();
    closeRegionSearchPopover();

    const popover = document.getElementById('indicator-search-popover');
    const btn = document.getElementById('indicator-search-toggle');
    const input = document.getElementById('indicator-search-input');
    if (!popover || !btn) return;

    const isOpen = popover.style.display === 'block';
    if (isOpen) {
        closeIndicatorSearchPopover();
    } else {
        popover.style.display = 'block';
        btn.classList.add('active');
        if (input) {
            input.focus();
            input.select();
            searchIndicator(input.value);
        }
    }
};

function closeIndicatorSearchPopover() {
    const popover = document.getElementById('indicator-search-popover');
    const btn = document.getElementById('indicator-search-toggle');
    if (popover) popover.style.display = 'none';
    if (btn) btn.classList.remove('active');
}

// Умное сопоставление показателя из каталога с реальным массивом региона
function resolveIndicatorIndexInRegion(regData, catalogItem) {
    if (!regData) return -1;
    const targetNorm = normalizeSearchStr(catalogItem.name);
    const targetBase = targetNorm.split('(')[0].trim();

    const list = catalogItem.type === 'wide'
        ? regData.wide
        : (regData.narrow && regData.narrow[catalogItem.sphereKey] ? regData.narrow[catalogItem.sphereKey].items : null);

    if (!Array.isArray(list)) return -1;

    // 1. Точное совпадение (без учёта е/ё и регистра)
    let idx = list.findIndex(el => normalizeSearchStr(el.name) === targetNorm);
    if (idx !== -1) return idx;

    // 2. Совпадение по основной части до скобок (учитывает уточнения в отдельных регионах)
    idx = list.findIndex(el => {
        const elNorm = normalizeSearchStr(el.name);
        const elBase = elNorm.split('(')[0].trim();
        return elBase === targetBase || elNorm.includes(targetBase) || targetNorm.includes(elBase);
    });

    return idx;
}

window.searchIndicator = function(query) {
    const q = normalizeSearchStr(query);
    const dropdown = document.getElementById('indicator-search-dropdown');
    if (!dropdown) return;

    if (q.length < 1) {
        dropdown.style.display = 'none';
        dropdown.innerHTML = '';
        return;
    }

    const matches = INDICATORS_CATALOG.filter(item =>
        normalizeSearchStr(item.name).includes(q) || normalizeSearchStr(item.categoryLabel).includes(q)
    );

    if (matches.length === 0) {
        dropdown.style.display = 'block';
        dropdown.innerHTML = `<div class="search-item" style="color: #71717a; cursor: default;">Показатель не найден</div>`;
        return;
    }

    const regData = getRegionIndicatorsData(currentSelectedRegionId);
    dropdown.style.display = 'block';
    dropdown.innerHTML = '';

    matches.forEach(m => {
        const realIndex = resolveIndicatorIndexInRegion(regData, m);
        const item = document.createElement('div');
        item.className = 'search-item indicator-search-result-item';
        item.innerHTML = `
            <div class="indicator-search-item-title">${m.name}</div>
            <div class="indicator-search-item-cat">${m.categoryLabel}</div>
        `;
        item.onclick = () => {
            closeIndicatorSearchPopover();
            if (realIndex !== -1) {
                openIndicatorDetail(m.type, m.sphereKey, realIndex);
            } else {
                // Если в каком-то регионе список нестандартный, открываем соответствующий раздел
                if (m.type === 'wide') openWideView();
                else openNarrowSphereView(m.sphereKey);
            }
        };
        dropdown.appendChild(item);
    });
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
    closeRegionSearchPopover();
    closeIndicatorSearchPopover();
}

function getRegionIndicatorsData(regionId) {
    if (typeof RU_2025_DATA !== 'undefined' && RU_2025_DATA.indicatorsDatabase) {
        if (RU_2025_DATA.indicatorsDatabase[regionId]) {
            return RU_2025_DATA.indicatorsDatabase[regionId];
        }
        return RU_2025_DATA.indicatorsDatabase["default"];
    }
    return null;
}

function updateDataPanelForRegion(regionId) {
    currentSelectedRegionId = regionId;
    const rawName = (typeof RU_2025_DATA !== 'undefined' && RU_2025_DATA.regionNames[regionId])
        ? RU_2025_DATA.regionNames[regionId]
        : regionId;

    // Подставляем название выбранного региона в поле поиска регионов (само облако остаётся закрытым)
    const searchInput = document.getElementById('map-search-input');
    if (searchInput) {
        searchInput.value = rawName;
    }
    closeRegionSearchPopover();

    const content = document.querySelector('.data-panel-content');
    if (content) {
        const formattedNameHtml = (typeof RU_2025_DATA !== 'undefined' && RU_2025_DATA.getFormattedRegionName)
            ? RU_2025_DATA.getFormattedRegionName(regionId, rawName)
            : rawName;

        content.innerHTML = `
            <div class="fade-in">
                <div class="panel-header-with-search">
                    <h3>Выбранный регион</h3>
                    <div id="indicator-search-wrapper" class="minimal-search-wrapper">
                        <button id="indicator-search-toggle" class="panel-search-loupe-btn" onclick="toggleIndicatorSearchPopover(event)" title="Поиск показателя">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </button>
                        <div id="indicator-search-popover" class="search-popover panel-search-popover" style="display: none;" onclick="event.stopPropagation()">
                            <input type="text" id="indicator-search-input" class="search-popover-input" placeholder="Поиск показателя..." oninput="searchIndicator(this.value)" autocomplete="off">
                            <div id="indicator-search-dropdown" class="search-popover-results" style="display: none;"></div>
                        </div>
                    </div>
                </div>
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
    if (!regData) return;

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
    if (!regData || !regData.narrow) return;
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
    if (!regData) return;
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
                        <button class="minimal-i-btn" onclick="toggleMinimalExplanation(event)" title="Показать обоснование">i</button>
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