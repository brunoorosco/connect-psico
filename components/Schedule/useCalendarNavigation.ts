import { useState, useCallback } from "react"
import { DayObject, WeekDate } from "./types"
import { weekDaysFull } from "./const"

export function useCalendarNavigation(initialDate: Date = new Date()) {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate)
  const [selectedDate, setSelectedDate] = useState<number>(initialDate.getDate())

  const previousMonth = useCallback((): void => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))
  }, [])

  const nextMonth = useCallback((): void => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))
  }, [])

  const previousWeek = useCallback((): void => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() - 7)
      return newDate
    })
  }, [])

  const nextWeek = useCallback((): void => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + 7)
      return newDate
    })
  }, [])

  const getDaysInMonth = useCallback((date: Date): DayObject[] => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: DayObject[] = []

    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, isCurrentMonth: false })
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true })
    }

    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false })
    }

    return days
  }, [])

  const getWeekDates = useCallback((): WeekDate[] => {
    const dates: WeekDate[] = []

    // Find the sunday of the current week
    const day = currentDate.getDay()
    const diff = currentDate.getDate() - day
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(diff)

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      dates.push({
        day: date.getDate(),
        weekDay: weekDaysFull[date.getDay()],
        isToday: date.toDateString() === new Date().toDateString(),
        fullDate: new Date(date) // Add full date for reference
      })
    }
    return dates
  }, [currentDate])

  return {
    currentDate,
    selectedDate,
    setSelectedDate,
    previousMonth,
    nextMonth,
    previousWeek,
    nextWeek,
    getDaysInMonth,
    getWeekDates,
    days: getDaysInMonth(currentDate),
    weekDates: getWeekDates(),
  }
}
