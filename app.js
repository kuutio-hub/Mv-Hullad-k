
import { getCalendarData } from './services/dataService.js';
import { renderApp, renderError } from './services/uiService.js';
import { generateWasteIcal, generateNameDayIcal } from './services/icalService.js';

// --- STATE MANAGEMENT ---
const state = {
    currentDate: new Date(Date.UTC(2026, 0, 1)),
    viewMode: 'monthly', // 'monthly' or 'annual'
    showNameDays: false,
    calendarData: {},
    nameDays: [],
    isLoading: true,
};

// --- CORE APPLICATION LOGIC ---

async function updateAndRender() {
    try {
        state.isLoading = true;
        renderApp(state); // Show loading spinner

        const year = state.currentDate.getUTCFullYear();
        const data = await getCalendarData(year);
        state.calendarData = data.calendarData;
        state.nameDays = data.nameDays;
        
        state.isLoading = false;
        renderApp(state);
    } catch (error) {
        console.error("Failed to update and render application:", error);
        state.isLoading = false;
        renderError("Hiba történt a naptár adatainak betöltése közben. Kérjük, próbálja újra később.");
    }
}

// --- EVENT HANDLERS ---

const handlers = {
    navigate: (unit, direction) => {
        const currentYear = state.currentDate.getUTCFullYear();
        const currentMonth = state.currentDate.getUTCMonth();
        let newYear = currentYear;
        let newMonth = currentMonth;

        if (unit === 'month') {
            newMonth += direction;
        } else if (unit === 'year') {
            newYear += direction;
        }
        
        state.currentDate = new Date(Date.UTC(newYear, newMonth, 1));
        updateAndRender();
    },
    setToday: () => {
        const today = new Date();
        state.currentDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
        updateAndRender();
    },
    toggleNameDays: () => {
        state.showNameDays = !state.showNameDays;
        renderApp(state); // No need to fetch data again, just re-render
    },
    toggleView: (view) => {
        if (state.viewMode !== view) {
            state.viewMode = view;
            renderApp(state);
        }
    },
    printView: () => window.print(),
    downloadWasteIcal: async () => {
        const wasteData = await getCalendarData(2026, true); // Force fetching only waste data for 2026
        const icalContent = generateWasteIcal(wasteData.calendarData);
        downloadFile('Martonvasar_Hulladeknaptar_2026.ics', icalContent, 'text/calendar;charset=utf-8');
    },
    downloadNameDayIcal: () => {
        const year = state.currentDate.getUTCFullYear();
        const icalContent = generateNameDayIcal(state.nameDays, year);
        downloadFile(`Magyar_Nevnapok_${year}.ics`, icalContent, 'text/calendar;charset=utf-8');
    },
};

function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

// --- INITIALIZATION ---

// Expose state and handlers to the global scope so uiService can access them
window.app = {
    state,
    handlers,
};

// Initial render
document.addEventListener('DOMContentLoaded', () => {
    updateAndRender();
});
