'use strict';

const MONDAY = 1;
const TUESDAY = 2;
const WEDNESDAY = 3;
const THURSDAY = 4;
const FRIDAY = 5;
const workDays = [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY];

function generateDates(startDate, endDate) {
  const dates = [];
  let currentDate = startDate;

  while (currentDate <= endDate) {
    dates.push(currentDate);
    const nextDate = new Date(currentDate.getTime());
    nextDate.setDate(currentDate.getDate() + 1);
    currentDate = nextDate;
  }
  return dates;
}

module.exports = {
  numberOfWorkDays(startDate, endDate) {
    const dateRange = generateDates(startDate, endDate);
    return dateRange.filter(date => workDays.includes(date.getDay())).length;
  },
};
