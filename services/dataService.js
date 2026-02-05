
import { isLeapYear } from './calendarService.js';

const API_CACHE = {};

/**
 * Fetches data from a URL with caching.
 * @param {string} url The URL to fetch.
 * @returns {Promise<any>} The fetched JSON data.
 */
async function fetchWithCache(url) {
    if (API_CACHE[url]) {
        return API_CACHE[url];
    }
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }
        const data = await response.json();
        API_CACHE[url] = data;
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

/**
 * Fetches and processes waste collection events for a given year.
 * @param {number} year The year to fetch data for.
 * @returns {Promise<Array<object>>} A list of waste collection events.
 */
async function getWasteEvents(year) {
    // Modular design: In the future, this could try to fetch `waste-calendar-${year}.json`
    if (year !== 2026) {
        return [];
    }
    
    const data = await fetchWithCache('data/waste-calendar-2026.json');
    if (!data) return [];
    
    const events = [];
    data.collections.forEach(collection => {
        // Handle specific dates
        collection.dates.forEach(monthData => {
            monthData.days.forEach(day => {
                events.push({
                    date: new Date(Date.UTC(year, monthData.month - 1, day)),
                    type: collection.type,
                });
            });
        });

        // Handle recurring weekly dates
        if (collection.recurringDay !== undefined) {
            for (let i = 0; i < 366; i++) {
                const currentDate = new Date(Date.UTC(year, 0, 1 + i));
                if (currentDate.getUTCFullYear() > year) break;
                if (currentDate.getUTCDay() === collection.recurringDay) {
                    events.push({
                        date: currentDate,
                        type: collection.type,
                    });
                }
            }
        }
    });
    return events;
}

/**
 * Fetches public holidays for a given year.
 * @param {number} year The year to fetch holidays for.
 * @returns {Promise<Array<object>>} A list of holidays.
 */
async function getHolidays(year) {
    return await fetchWithCache(`https://date.nager.at/api/v3/PublicHolidays/${year}/HU`);
}

/**
 * Fetches namedays for a given year, correctly handling leap years by shifting names after Feb 23rd.
 * @param {number} year The year to fetch namedays for.
 * @returns {Promise<Array<object>>} A list of namedays.
 */
async function getNameDays(year) {
    const nameDayData = await fetchWithCache('/data/namedays.json');
    if (!nameDayData) return [];

    const isLeap = isLeapYear(year);
    const resultingNameDays = [];

    Object.entries(nameDayData).forEach(([key, names]) => {
        const [month, day] = key.split('-').map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));

        // In a leap year, shift all namedays from Feb 24th onwards
        if (isLeap && month === 2 && day >= 24) {
            date.setUTCDate(date.getUTCDate() + 1);
        }
        
        resultingNameDays.push({ date, names });
    });
    
    // In a leap year, add the special "Szökőnap" on the 24th
    if (isLeap) {
        resultingNameDays.push({
            date: new Date(Date.UTC(year, 1, 24)),
            names: "Szökőnap"
        });
    }

    return resultingNameDays;
}

/**
 * Fetches all calendar-related data for a given year and merges it.
 * @param {number} year The year for which to fetch data.
 * @param {boolean} [wasteOnly=false] - If true, only fetches waste data.
 * @returns {Promise<object>} An object containing merged calendar data and nameday list.
 */
export async function getCalendarData(year, wasteOnly = false) {
    const promises = [getWasteEvents(year)];
    if (!wasteOnly) {
        promises.push(getHolidays(year), getNameDays(year));
    }

    const [wasteEvents, holidays, nameDays] = await Promise.all(promises);

    const calendarData = {};

    const addEvent = (date, eventData) => {
        if (!date || isNaN(date.getTime())) return; // Guard against invalid dates
        const key = date.toISOString().split('T')[0];
        if (!calendarData[key]) {
            calendarData[key] = { date, waste: [], holiday: null, nameDay: null };
        }
        Object.assign(calendarData[key], eventData);
    };
    
    (wasteEvents || []).forEach(e => {
        const key = e.date.toISOString().split('T')[0];
        if (!calendarData[key]) {
            calendarData[key] = { date: e.date, waste: [], holiday: null, nameDay: null };
        }
        calendarData[key].waste.push(e);
    });

    (holidays || []).forEach(h => {
        const parts = h.date.split('-');
        const utcDate = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
        addEvent(utcDate, { holiday: h });
    });
    
    (nameDays || []).forEach(n => addEvent(n.date, { nameDay: n }));

    return { calendarData, nameDays: nameDays || [] };
}
