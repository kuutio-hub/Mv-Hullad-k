
const WASTE_DESCRIPTIONS = {
    'Szelektív': 'Papír, műanyag és fém hulladékok gyűjtése. Kérjük, a hulladékot a szállítás napján reggel 5 óráig helyezze ki!',
    'Zöldhulladék': 'Kerti zöldhulladék gyűjtése. Kérjük, a hulladékot a szállítás napján reggel 5 óráig helyezze ki!',
    'Vegyes': 'Kommunális (vegyes) hulladék gyűjtése. Kérjük, a hulladékot a szállítás napján reggel 5 óráig helyezze ki!',
    'Üveg': 'Üveghulladék gyűjtése (fehér és színes). Kérjük, az üvegeket kiöblítve helyezze ki!',
};

const WASTE_SUMMARIES = {
    'Szelektív': '♻️ Szelektív hulladékgyűjtés',
    'Zöldhulladék': '🌿 Zöldhulladék gyűjtés',
    'Vegyes': '🗑️ Vegyes hulladékgyűjtés',
    'Üveg': '🍾 Üveghulladék gyűjtés',
};

const formatDateToUTC = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

/**
 * Generates iCal content for waste collection events.
 * @param {object} calendarData The processed calendar data object.
 * @returns {string} The iCal content as a string.
 */
export const generateWasteIcal = (calendarData) => {
    const events = Object.values(calendarData).filter(day => day.waste.length > 0);
    if (events.length === 0) return '';
    
    const year = new Date(Object.keys(calendarData)[0]).getUTCFullYear();
    
    const cal = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        `PRODID:-//Hulladeknaptar//Martonvasar ${year}//HU`,
        `X-WR-CALNAME:Martonvásár Hulladéknaptár ${year}`,
        'X-WR-TIMEZONE:Europe/Budapest',
        'CALSCALE:GREGORIAN',
    ];

    events.forEach(day => {
        day.waste.forEach(event => {
            const eventDate = day.date;
            const startDateStr = `${eventDate.getUTCFullYear()}${(eventDate.getUTCMonth() + 1).toString().padStart(2, '0')}${eventDate.getUTCDate().toString().padStart(2, '0')}`;
            
            cal.push(
                'BEGIN:VEVENT',
                `UID:${startDateStr}-${event.type}@hulladeknaptar.app`,
                `DTSTAMP:${formatDateToUTC(new Date())}`,
                `DTSTART;VALUE=DATE:${startDateStr}`,
                `SUMMARY:${WASTE_SUMMARIES[event.type] || 'Hulladékgyűjtés'}`,
                `DESCRIPTION:${(WASTE_DESCRIPTIONS[event.type] || '').replace(/\n/g, '\\n')}`,
                'LOCATION:Martonvásár, Magyarország',
                // --- Notification Alarm ---
                // This alarm is set to trigger on the day before the event at 5:00 PM (17:00).
                // TRIGGER:-PT7H means 7 hours before the start of the all-day event (which is midnight).
                'BEGIN:VALARM',
                'ACTION:DISPLAY',
                'DESCRIPTION:Emlékeztető: Hulladék kihelyezés másnap reggelre!',
                'TRIGGER:-PT7H',
                'END:VALARM',
                'END:VEVENT'
            );
        });
    });

    cal.push('END:VCALENDAR');
    return cal.join('\r\n');
};

/**
 * Generates iCal content for namedays.
 * @param {Array<object>} nameDays List of nameday objects.
 * @param {number} year The year for the calendar.
 * @returns {string} The iCal content as a string.
 */
export const generateNameDayIcal = (nameDays, year) => {
    if (!nameDays || nameDays.length === 0) return '';

    const cal = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        `PRODID:-//Hulladeknaptar//Magyar Nevnapok ${year}//HU`,
        `X-WR-CALNAME:Magyar Névnapok ${year}`,
        'X-WR-TIMEZONE:Europe/Budapest',
    ];

    nameDays.forEach(nameDay => {
        const eventDate = nameDay.date;
        const dateStr = `${eventDate.getUTCFullYear()}${(eventDate.getUTCMonth() + 1).toString().padStart(2, '0')}${eventDate.getUTCDate().toString().padStart(2, '0')}`;
        
        cal.push(
            'BEGIN:VEVENT',
            `UID:${dateStr}-nameday@hulladeknaptar.app`,
            `DTSTAMP:${formatDateToUTC(new Date())}`,
            `DTSTART;VALUE=DATE:${dateStr}`,
            `SUMMARY:Névnap: ${nameDay.names}`,
            'TRANSP:TRANSPARENT', // Mark as free time
            'CATEGORIES:Névnap',
            'END:VEVENT'
        );
    });

    cal.push('END:VCALENDAR');
    return cal.join('\r\n');
};
