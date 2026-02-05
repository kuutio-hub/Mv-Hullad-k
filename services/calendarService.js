
/**
 * Checks if a given year is a leap year.
 * @param {number} year The year to check.
 * @returns {boolean} True if it's a leap year, false otherwise.
 */
export const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

/**
 * Generates the grid of days for a given month and year.
 * Returns an array of Date objects, with nulls for empty cells at the beginning.
 * @param {number} year The full year.
 * @param {number} month The month index (0-11).
 * @returns {Array<Date|null>}
 */
export const getMonthGrid = (year, month) => {
    const grid = [];
    const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
    const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0));

    // getUTCDay() is crucial for timezone independence. Monday is 1, Sunday is 0.
    const startingDayOfWeek = (firstDayOfMonth.getUTCDay() + 6) % 7; // 0 for Monday, 6 for Sunday

    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
        grid.push(null);
    }

    // Add cells for each day of the month
    for (let i = 1; i <= lastDayOfMonth.getUTCDate(); i++) {
        grid.push(new Date(Date.UTC(year, month, i)));
    }

    return grid;
};
