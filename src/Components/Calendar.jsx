import React, { useState } from "react";
import { getMonth, getDate, getYear, getTime } from 'date-fns';

const Calendar = ({ handleClose, onDateSelected }) => {
  const [selectedTime, setSelectedTime] = useState("22:00");
  
  const currentDate = new Date()
  const Month = getMonth(currentDate)
  const Year = getYear(currentDate);
  const date = getDate(currentDate)

  const [currentMonth, setCurrentMonth] = useState(Month);
  const [currentYear, setCurrentYear] = useState(Year);
  const [selectedDate, setSelectedDate] = useState(date);

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

  const getDaysInMonth = (month, year) =>
    new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (month, year) =>
    new Date(year, month, 1).getDay();

  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Prev month trailing days
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInPrevMonth = getDaysInMonth(prevMonth, prevYear);

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
    }

    // Current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, isCurrentMonth: true });
    }

    // Next month leading days
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({ day, isCurrentMonth: false });
    }

    return days;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else setCurrentMonth(currentMonth - 1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else setCurrentMonth(currentMonth + 1);
  };

  const handleDateClick = (day, isCurrentMonth) => {
    if (!isCurrentMonth) return;

    const clickedDate = new Date(currentYear, currentMonth, day);

    if (clickedDate >= todayOnly) {
      setSelectedDate(day);
    }
  };

  const handleTimeChange = (e) => setSelectedTime(e.target.value);

  const handleClear = () => {
    setSelectedDate(null);
    setSelectedTime("12:00");
  };

  const calendarDays = generateCalendarDays();

  const handleOK = () => {
    const selectedDateTime = new Date(
      currentYear,
      currentMonth,
      selectedDate,
      parseInt(selectedTime.split(":")[0]),
      parseInt(selectedTime.split(":")[1])
    );

    if (onDateSelected) {
      onDateSelected(selectedDateTime);
    }
  };

  return (
    <div className="w-72 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 font-sans">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition"
        >
          ‹
        </button>
        <h2 className="text-sm font-semibold text-gray-700">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <button
          onClick={handleNextMonth}
          className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition"
        >
          ›
        </button>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day, i) => (
          <div
            key={i}
            className="text-center text-[11px] text-gray-400 font-medium"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {calendarDays.map((dayObj, index) => {
          const isToday =
            dayObj.day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();

          const isPastDate =
            dayObj.isCurrentMonth &&
            new Date(currentYear, currentMonth, dayObj.day) < todayOnly;

          return (
            <button
              key={index}
              onClick={() =>
                !isPastDate && handleDateClick(dayObj.day, dayObj.isCurrentMonth)
              }
              disabled={isPastDate}
              className={`
                w-8 h-8 text-xs rounded-full flex items-center justify-center
                transition-colors
                ${isPastDate
                  ? "text-gray-300 cursor-not-allowed"
                  : dayObj.isCurrentMonth
                    ? selectedDate === dayObj.day
                      ? "bg-amber-400 text-gray-900 font-semibold shadow-sm"
                      : isToday
                        ? "ring-1 ring-amber-300 text-gray-700 hover:bg-gray-100"
                        : "text-gray-700 hover:bg-gray-100"
                    : "text-gray-300"
                }
              `}
            >
              {dayObj.day}
            </button>
          );
        })}
      </div>

      {/* Time Picker */}
      <div className="border-t border-gray-100 pt-3 mb-3">
        <div className="flex items-center">
          <span className="text-xs text-gray-500 font-medium">Time</span>
          <input
            type="time"
            value={selectedTime}
            onChange={handleTimeChange}
            className="ml-auto text-xs px-2 py-1 rounded-full border border-gray-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-300 outline-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 border-t border-gray-100 pt-3">
        <button
          onClick={handleClear}
          className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-50 transition"
        >
          Clear
        </button>
        <button
          onClick={handleOK}
          className="px-4 py-1.5 bg-amber-400 text-gray-900 text-xs rounded-md font-medium hover:bg-amber-500 shadow-sm transition"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default Calendar;
