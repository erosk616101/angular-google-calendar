import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasAppointments: boolean;
}

export enum ViewMode {
  Day = "day",
  Week = "week",
  Month = "month",
}

@Injectable({
  providedIn: "root",
})
export class CalendarService {
  private currentDateSubject = new BehaviorSubject<Date>(new Date());
  public currentDate$ = this.currentDateSubject.asObservable();

  private viewModeSubject = new BehaviorSubject<ViewMode>(ViewMode.Month);
  public viewMode$ = this.viewModeSubject.asObservable();

  constructor() {}

  getCurrentDate(): Observable<Date> {
    return this.currentDate$;
  }

  setCurrentDate(date: Date): void {
    this.currentDateSubject.next(new Date(date));
  }

  getViewMode(): Observable<ViewMode> {
    return this.viewMode$;
  }

  setViewMode(mode: ViewMode): void {
    this.viewModeSubject.next(mode);
  }

  goToToday(): void {
    this.setCurrentDate(new Date());
  }

  goToPrevious(): void {
    const currentDate = this.currentDateSubject.getValue();
    const currentMode = this.viewModeSubject.getValue();

    const newDate = new Date(currentDate);

    switch (currentMode) {
      case ViewMode.Day:
        newDate.setDate(currentDate.getDate() - 1);
        break;
      case ViewMode.Week:
        newDate.setDate(currentDate.getDate() - 7);
        break;
      case ViewMode.Month:
        newDate.setMonth(currentDate.getMonth() - 1);
        break;
    }

    this.setCurrentDate(newDate);
  }

  goToNext(): void {
    const currentDate = this.currentDateSubject.getValue();
    const currentMode = this.viewModeSubject.getValue();

    const newDate = new Date(currentDate);

    switch (currentMode) {
      case ViewMode.Day:
        newDate.setDate(currentDate.getDate() + 1);
        break;
      case ViewMode.Week:
        newDate.setDate(currentDate.getDate() + 7);
        break;
      case ViewMode.Month:
        newDate.setMonth(currentDate.getMonth() + 1);
        break;
    }

    this.setCurrentDate(newDate);
  }

  getMonthDays(date: Date): CalendarDay[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days: CalendarDay[] = [];
    const today = new Date();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const firstDayOfWeek = firstDay.getDay();

    const daysFromPrevMonth = firstDayOfWeek;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const lastDayOfPrevMonth = new Date(
      prevMonthYear,
      prevMonth + 1,
      0
    ).getDate();

    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(prevMonthYear, prevMonth, lastDayOfPrevMonth - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: this.isSameDay(date, today),
        hasAppointments: false,
      });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: this.isSameDay(date, today),
        hasAppointments: false,
      });
    }

    const totalDaysNeeded = 42;
    const remainingDays = totalDaysNeeded - days.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;

    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(nextMonthYear, nextMonth, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: this.isSameDay(date, today),
        hasAppointments: false,
      });
    }

    return days;
  }

  getWeekDays(date: Date): CalendarDay[] {
    const days: CalendarDay[] = [];
    const today = new Date();

    const currentDay = date.getDay();
    const firstDayOfWeek = new Date(date);
    firstDayOfWeek.setDate(date.getDate() - currentDay);

    for (let i = 0; i < 7; i++) {
      const day = new Date(firstDayOfWeek);
      day.setDate(firstDayOfWeek.getDate() + i);

      days.push({
        date: day,
        isCurrentMonth: day.getMonth() === date.getMonth(),
        isToday: this.isSameDay(day, today),
        hasAppointments: false,
      });
    }

    return days;
  }

  formatMonthYear(date: Date): string {
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  }

  formatDayHeader(date: Date): string {
    return date.toLocaleString("default", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }
}
