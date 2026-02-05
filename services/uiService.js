
import { getMonthGrid } from './calendarService.js';

const
    qs = document.querySelector.bind(document),
    headerContainer = qs('#app-header'),
    actionButtonsContainer = qs('#action-buttons-container'),
    legendContainer = qs('#legend-container'),
    infoBannerContainer = qs('#info-banner-container'),
    calendarContainer = qs('#calendar-container'),
    modalContainer = qs('#modal-container');

const hungarianMonths = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];
const weekDays = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];
const WASTE_TYPES = {
    Szelektív: { class: 'waste-selective', icon: 'fa-recycle' },
    Zöldhulladék: { class: 'waste-green', icon: 'fa-leaf' },
    Vegyes: { class: 'waste-mixed', icon: 'fa-trash-can' },
    Üveg: { class: 'waste-glass', icon: 'fa-wine-bottle' },
};
const WASTE_DESCRIPTIONS = {
    'Szelektív': 'Papír, műanyag és fém hulladékok gyűjtése. Kérjük, a hulladékot a szállítás napján reggel 5 óráig helyezze ki!',
    'Zöldhulladék': 'Kerti zöldhulladék gyűjtése. Kérjük, a hulladékot a szállítás napján reggel 5 óráig helyezze ki!',
    'Vegyes': 'Kommunális (vegyes) hulladék gyűjtése. Kérjük, a hulladékot a szállítás napján reggel 5 óráig helyezze ki!',
    'Üveg': 'Üveghulladék gyűjtése (fehér és színes). Kérjük, az üvegeket kiöblítve helyezze ki!',
};

// --- RENDER FUNCTIONS ---

function renderHeader(state) {
    const { currentDate, showNameDays } = state;
    const year = currentDate.getUTCFullYear();
    const monthName = hungarianMonths[currentDate.getUTCMonth()];

    headerContainer.innerHTML = `
        <div class="container">
            <div class="header-logo">
                <svg class="h-10 w-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="#004a99" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14.5 19C14.5 16.5147 12.4853 14.5 10 14.5C7.51472 14.5 5.5 16.5147 5.5 19" stroke="#6a8d24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <h1 class="text-xl md:text-2xl font-bold text-marton-blue hidden sm:block">Naptár</h1>
            </div>
            <div class="header-nav">
                <button class="today-btn" data-action="setToday">Ma</button>
                <div class="flex items-center gap-1">
                    <button data-action="prevYear" aria-label="Előző év"><i class="fa-solid fa-angles-left"></i></button>
                    <button data-action="prevMonth" aria-label="Előző hónap"><i class="fa-solid fa-chevron-left"></i></button>
                </div>
                <div class="date-display">
                    <h2>${monthName}</h2>
                    <p>${year}</p>
                </div>
                <div class="flex items-center gap-1">
                    <button data-action="nextMonth" aria-label="Következő hónap"><i class="fa-solid fa-chevron-right"></i></button>
                    <button data-action="nextYear" aria-label="Következő év"><i class="fa-solid fa-angles-right"></i></button>
                </div>
            </div>
            <div class="header-controls">
                <div class="toggle-container">
                    <span>Névnapok</span>
                    <button class="toggle-switch" data-enabled="${showNameDays}" data-action="toggleNameDays" role="switch" aria-checked="${showNameDays}">
                        <span></span>
                    </button>
                </div>
                <button data-action="showInfo" aria-label="Információk"><i class="fa-solid fa-circle-info text-2xl"></i></button>
            </div>
        </div>
    `;
}

function renderActionButtons(state) {
    actionButtonsContainer.innerHTML = `
        <div class="view-toggle">
            <button data-action="toggleView" data-view="monthly" class="${state.viewMode === 'monthly' ? 'active' : ''}">Havi nézet</button>
            <button data-action="toggleView" data-view="annual" class="${state.viewMode === 'annual' ? 'active' : ''}">Éves nézet</button>
        </div>
        <button class="btn-waste" data-action="downloadWasteIcal"><i class="fa-solid fa-trash-can"></i> Hulladéknaptár (.ics)</button>
        <button class="btn-nameday" data-action="downloadNameDayIcal"><i class="fa-solid fa-cake-candles"></i> Névnapok (.ics)</button>
        <button class="btn-subscribe" data-action="showSubscription"><i class="fa-solid fa-question-circle"></i> Feliratkozási Segédlet</button>
        ${state.viewMode === 'annual' ? `<button class="btn-print" data-action="printView"><i class="fa-solid fa-print"></i> Nyomtatás</button>` : ''}
    `;
}

function renderLegend() {
    legendContainer.innerHTML = `
        <div class="legend-item"><div class="color-box" style="background-color: var(--waste-selective-bg); border-color: var(--waste-selective-text);"></div><span>Szelektív</span></div>
        <div class="legend-item"><div class="color-box" style="background-color: var(--waste-green-bg); border-color: var(--waste-green-text);"></div><span>Zöldhulladék</span></div>
        <div class="legend-item"><div class="color-box" style="background-color: var(--waste-mixed-bg); border-color: var(--waste-mixed-text);"></div><span>Vegyes</span></div>
        <div class="legend-item"><div class="color-box" style="background-color: var(--waste-glass-bg); border-color: var(--waste-glass-text);"></div><span>Üveg</span></div>
        <div class="legend-item"><div class="color-box" style="border-left: 4px solid var(--holiday-red); background-color: white;"></div><span>Ünnepnap</span></div>
        <div class="legend-item"><div class="color-box" style="background-color: #f1f5f9;"></div><span>Hétvége</span></div>
    `;
}

function renderInfoBanner(state) {
    if (state.currentDate.getUTCFullYear() !== 2026) {
        infoBannerContainer.innerHTML = `
            <div class="info-banner">
                <p>Tájékoztatás</p>
                <p>A hulladékgyűjtési adatok kizárólag a 2026-os évre érhetőek el.</p>
            </div>`;
    } else {
        infoBannerContainer.innerHTML = '';
    }
}

function renderCalendar(state) {
    if (state.isLoading) {
        calendarContainer.innerHTML = `<div id="loading-spinner" class="flex items-center justify-center min-h-[50vh] text-xl font-semibold">Naptár adatok betöltése...</div>`;
        return;
    }
    calendarContainer.innerHTML = state.viewMode === 'monthly' ? renderMonthlyView(state) : renderAnnualView(state);
}

function renderMonthlyView(state) {
    const { currentDate, calendarData, showNameDays } = state;
    const year = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth();
    const grid = getMonthGrid(year, month);
    
    const today = new Date();
    const todayUTCKey = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())).toISOString().split('T')[0];

    const dayCells = grid.map(day => {
        if (!day) return `<div class="calendar-day empty"></div>`;

        const dayKey = day.toISOString().split('T')[0];
        const dayData = calendarData[dayKey];
        const dayOfWeek = day.getUTCDay();
        const isWeekend = dayOfWeek === 6 || dayOfWeek === 0;
        const isToday = dayKey === todayUTCKey;

        const classes = ['calendar-day'];
        let dayContent = '';
        
        if (isToday) classes.push('today');
        if (isWeekend) classes.push('weekend');
        if (dayData?.holiday) classes.push('holiday');
        if (dayData?.waste && dayData.waste.length > 0) {
            classes.push('clickable');
            const primaryWaste = dayData.waste.find(w => w.type !== 'Vegyes') || dayData.waste[0];
            const wasteInfo = WASTE_TYPES[primaryWaste.type];
            if(wasteInfo) {
                classes.push(wasteInfo.class);
                dayContent += `<i class="fa-solid ${wasteInfo.icon}"></i>`;
            }
        }

        if (dayData?.holiday) {
            dayContent += `<span class="holiday-name">${dayData.holiday.localName}</span>`;
        }
        
        const nameDayHtml = (showNameDays && dayData?.nameDay)
            ? `<div class="day-nameday" title="${dayData.nameDay.names}">${dayData.nameDay.names}</div>`
            : '';

        return `
            <div class="${classes.join(' ')}" data-date="${dayKey}">
                <div class="day-number">${day.getUTCDate()}</div>
                <div class="day-content">${dayContent}</div>
                ${nameDayHtml}
            </div>
        `;
    }).join('');

    return `
        <div class="calendar-grid-container">
            <div class="calendar-header">
                ${weekDays.map(day => `<div>${day.substring(0, 3)}</div>`).join('')}
            </div>
            <div class="calendar-body">${dayCells}</div>
        </div>
    `;
}

function renderAnnualView(state) {
    const { currentDate, calendarData } = state;
    const year = currentDate.getUTCFullYear();

    const monthGrids = Array(12).fill(null).map((_, monthIndex) => {
        const firstDay = new Date(Date.UTC(year, monthIndex, 1));
        const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
        const startingDay = (firstDay.getUTCDay() + 6) % 7;
        const dayCells = Array.from({ length: startingDay + daysInMonth });

        const daysHtml = dayCells.map((_, index) => {
            const dayOfMonth = index - startingDay + 1;
            if (dayOfMonth <= 0) return `<div></div>`;

            const date = new Date(Date.UTC(year, monthIndex, dayOfMonth));
            const dayKey = date.toISOString().split('T')[0];
            const dayData = calendarData[dayKey];
            const isWeekend = [0, 6].includes(date.getUTCDay());

            let cellClass = "day-cell";
            if(dayData?.holiday) cellClass += ' holiday';
            else if (dayData?.waste?.length > 0) {
                 const primaryWaste = dayData.waste.find(w => w.type !== 'Vegyes') || dayData.waste[0];
                 cellClass += ` ${WASTE_TYPES[primaryWaste.type]?.class || ''}`;
            }
            else if (isWeekend) cellClass += ' weekend';

            return `<div class="day-cell-wrapper"><div class="${cellClass}">${dayOfMonth}</div></div>`;
        }).join('');
        
        return `
            <div class="mini-calendar">
                <h4>${hungarianMonths[monthIndex]}</h4>
                <div class="week-header">${['H','K','Sze','Cs','P','Szo','V'].map(d => `<span>${d}</span>`).join('')}</div>
                <div class="days-grid">${daysHtml}</div>
            </div>
        `;
    }).join('');

    return `<div class="annual-view">${monthGrids}</div>`;
}

// --- MODAL RENDERING & LOGIC ---

function showModal(type, state, dateKey) {
    let modalHtml = '';
    if (type === 'info') modalHtml = getInfoModalHtml();
    if (type === 'subscription') modalHtml = getSubscriptionModalHtml();
    if (type === 'eventDetail') modalHtml = getEventDetailModalHtml(state, dateKey);
    
    if (!modalHtml) return;

    modalContainer.innerHTML = modalHtml;
    const overlay = modalContainer.querySelector('.modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeModal();
        });
    }
    modalContainer.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
}


function closeModal() {
    modalContainer.innerHTML = '';
}

function getEventDetailModalHtml(state, dateKey) {
    const dayData = state.calendarData[dateKey];
    if (!dayData || dayData.waste.length === 0) return '';
    
    const formattedDate = new Intl.DateTimeFormat('hu-HU', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', timeZone: 'UTC',
    }).format(dayData.date);

    const eventCards = dayData.waste.map(event => {
        const wasteInfo = WASTE_TYPES[event.type] || {};
        return `
            <div class="event-card ${wasteInfo.class}">
                <div class="event-title">
                    <i class="fa-solid ${wasteInfo.icon}"></i>
                    <h3>${event.type} gyűjtés</h3>
                </div>
                <p>${WASTE_DESCRIPTIONS[event.type] || ''}</p>
            </div>`;
    }).join('');

    return `
        <div class="modal-overlay">
            <div class="modal-content event-detail-modal-content">
                <button class="modal-close-btn"><i class="fa-solid fa-times fa-2x"></i></button>
                <h2>Teendők a napon</h2>
                <p class="date-header">${formattedDate}</p>
                <div class="space-y-4">${eventCards}</div>
            </div>
        </div>`;
}

function getInfoModalHtml() {
    return `
    <div class="modal-overlay">
      <div class="modal-content info-modal">
        <button class="modal-close-btn"><i class="fa-solid fa-times fa-2x"></i></button>
        <div class="modal-header">
            <i class="fa-solid fa-book-open"></i>
            <div>
                 <h2>Információk & Wiki</h2>
                 <p>Hasznos tudnivalók a hulladékgyűjtésről Martonvásáron.</p>
            </div>
        </div>
        <div class="info-section">
            <h3 style="color: var(--marton-blue);">Házhoz menő szelektív hulladékgyűjtés</h3>
            <p><strong>Papír:</strong> hullámkarton összehajtogatva; kartondoboz (pl: élelmiszer, kozmetikum doboza, cipősdoboz); reklám- és egyéb újság, szórólap; csomagolópapír; nyomtatópapír; tojástartó; füzet; könyv</p>
            <p><strong>Műanyag:</strong> műanyag PET-palack; tejtermékek kiöblített poharai, tégelyei; kozmetikai szerek flakonjai, tubusai, tégelyei; tisztító- és mosószerek csomagolásai; fólia, habosított fólia; műanyag kupakok; élelmiszerek műanyag csomagolása; tejes és üdítős többrétegű italoskarton</p>
            <p><strong>Fém:</strong> fém italosdoboz; konzervdoboz; fémkupak</p>
        </div>
        <div class="info-section">
            <h3 style="color: var(--marton-green);">Zöldhulladék gyűjtés</h3>
            <p><strong>Zöldhulladék gyűjtésbe tartozó anyagok:</strong> 110 literes zsákban, a gallyak, ágak zöldhulladék díjmentes elszállítására jogosító matricával ellátott kötegben (max. 50x70 cm-es köteg, max. 5 cm ágvastagságig) helyezhető ki.</p>
            <p>A januári zöldhulladékgyűjtés során kizárólag a díszítő elemektől és egyéb hulladékoktól mentes fenyőfákat szállítjuk el.</p>
        </div>
        <div class="info-section">
            <h3 style="color: var(--waste-glass-text);">Üveghulladék Gyűjtés</h3>
            <p>Az üveghulladék (fehér és színes) gyűjtése a városban negyedévente történik. A pontos, hivatalos időpontokért kérjük, mindig ellenőrizze a <a href="https://martonvasar.hu/varosnaptar" target="_blank" rel="noopener noreferrer">Martonvásári Városnaptárat</a>!</p>
        </div>
        <div class="info-section">
            <h3>Lomtalanítás</h3>
            <p>A lomtalanítási igényét a <a href="tel:+3617767777">+36 1 776 7777</a> telefonszámon, vagy az <a href="mailto:ugyfel@deponia.hu">ugyfel@deponia.hu</a> e-mail címen vagy online (<a href="https://idopontfoglalas.deponia.hu/lomtalanitas" target="_blank" rel="noopener noreferrer">idopontfoglalas.deponia.hu</a>) jelezheti.</p>
        </div>
        <div class="info-section">
            <h3>Hulladékudvarok</h3>
            <p>Az ingyenesen elhelyezhető hulladékokról és a nyitva tartásról a <a href="https://www.deponia.hu" target="_blank" rel="noopener noreferrer">www.deponia.hu</a> honlapon érhető el információ.</p>
        </div>
        <div class="info-section" style="border-left: 4px solid var(--holiday-red); background-color: #fef2f2;">
            <h3 style="color: var(--holiday-red);"><i class="fa-solid fa-triangle-exclamation mr-2"></i>Fontos Tudnivalók</h3>
            <p>Kérjük, a hulladékokat a szállítás napján reggel 5 óráig az ingatlanok elé szíveskedjenek kihelyezni úgy, hogy az se a gyalogos, se a jármű forgalmat ne akadályozza!</p>
        </div>
        <div class="info-section">
            <h3>Szolgáltató elérhetősége</h3>
            <p><strong>DEPÓNIA Nonprofit Kft.</strong></p>
            <p><strong>Honlap:</strong> <a href="https://www.deponia.hu" target="_blank" rel="noopener noreferrer">www.deponia.hu</a></p>
            <p><strong>Telefon:</strong> <a href="tel:+367767777">+36 776 7777</a></p>
            <p><strong>E-mail:</strong><br>
            Számlázás: <a href="mailto:ugyfel@deponia.hu">ugyfel@deponia.hu</a><br>
            Szállítás: <a href="mailto:pilis@deponia.hu">pilis@deponia.hu</a></p>
        </div>
      </div>
    </div>`;
}

function getSubscriptionModalHtml() {
    return `
    <div class="modal-overlay">
        <div class="modal-content sub-modal-content">
            <button class="modal-close-btn"><i class="fa-solid fa-times fa-2x"></i></button>
            <div class="modal-header">
                <i class="fa-solid fa-bell" style="color: var(--marton-blue);"></i>
                <h2>Feliratkozás & Értesítések</h2>
                <p>Importálja a letöltött <strong>.ics</strong> fájlt a kedvenc naptáralkalmazásába.</p>
            </div>
            <div>
                <div class="info-section" style="border-left: 4px solid var(--marton-blue); background-color: #eff6ff;">
                    <h3 style="color: var(--marton-blue);"><i class="fa-solid fa-bell"></i>Automatikus Emlékeztető</h3>
                    <p>A hulladéknaptár eseményei <strong>automatikus értesítést</strong> tartalmaznak, amely a gyűjtés <strong>előtti nap este 17:00-kor</strong> fog jelezni, hogy ne felejtse el kihelyezni a hulladékot.</p>
                </div>
                <h3><i class="fa-brands fa-google" style="color: #4285F4;"></i> Google Naptár (számítógépen)</h3>
                <ol>
                    <li>Töltse le a kívánt naptárfájlt (.ics) a főoldalon.</li>
                    <li>Nyissa meg a <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer">Google Naptárat</a>.</li>
                    <li>A bal oldali menüben, a "Más naptárak" mellett kattintson a plusz (<strong>+</strong>) jelre.</li>
                    <li>Válassza az "<strong>Importálás</strong>" opciót.</li>
                    <li>Válassza ki a letöltött <strong>.ics</strong> fájlt a számítógépéről, adja hozzá a kívánt naptárhoz, majd kattintson az "Importálás" gombra.</li>
                </ol>
            </div>
            <div class="close-btn-container">
                <button class="modal-close-btn">Értettem</button>
            </div>
        </div>
    </div>
    `;
}

// --- EVENT BINDING ---
function bindEvents(state, handlers) {
    document.body.addEventListener('click', e => {
        const target = e.target.closest('[data-action], [data-date]');
        if (!target) return;

        const { action, view, date } = target.dataset;

        if (action) {
            switch (action) {
                case 'prevMonth': handlers.navigate('month', -1); break;
                case 'nextMonth': handlers.navigate('month', 1); break;
                case 'prevYear': handlers.navigate('year', -1); break;
                case 'nextYear': handlers.navigate('year', 1); break;
                case 'setToday': handlers.setToday(); break;
                case 'toggleNameDays': handlers.toggleNameDays(); break;
                case 'toggleView': handlers.toggleView(view); break;
                case 'printView': handlers.printView(); break;
                case 'downloadWasteIcal': handlers.downloadWasteIcal(); break;
                case 'downloadNameDayIcal': handlers.downloadNameDayIcal(); break;
                case 'showInfo': showModal('info', state); break;
                case 'showSubscription': showModal('subscription', state); break;
            }
        } else if (date) { // For clicking on a calendar day
            showModal('eventDetail', state, date);
        }
    });
}

export function renderError(message) {
    calendarContainer.innerHTML = `
        <div class="info-banner" style="background-color: #fee2e2; border-left-color: #ef4444; color: #b91c1c;">
            <p>Hiba!</p>
            <p>${message}</p>
        </div>
    `;
}

let eventsBound = false;

// --- MAIN RENDER ORCHESTRATOR ---
export function renderApp(state) {
    const { handlers } = window.app;
    
    renderHeader(state);
    renderActionButtons(state);
    renderLegend();
    renderInfoBanner(state);
    renderCalendar(state);
    
    // Bind events only once
    if (!eventsBound) {
        bindEvents(state, handlers);
        eventsBound = true;
    }
}
