import { useState, useMemo } from 'react';
import { CalendarDay } from '../types/leave';
import { getDaysInMonth, addMonths, areDatesEqual } from '../utils/dateUtils';

export const useCalendar = (initialDate: Date = new Date()) => {
  const [currentDate, setCurrentDate] = useState(initialDate);

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(currentDate.getFullYear(), i, 1);
      return {
        date: monthDate,
        days: getDaysInMonth(currentDate.getFullYear(), i),
      };
    });
  }, [currentDate]);

  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => addMonths(prev, direction === 'next' ? 12 : -12));
  };

  const getDaysForMonth = (monthIndex: number): CalendarDay[] => {
    const month = months[monthIndex];
    if (!month) return [];

    return month.days.map(date => ({
      date,
      isCurrentMonth: true,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isToday: areDatesEqual(date, new Date()),
      leaves: [],
    }));
  };

  return {
    currentDate,
    months,
    navigateYear,
    getDaysForMonth,
    setCurrentDate,
  };
};