import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Appointment } from "../../models/appointment.model";
import { CalendarDay } from "../../services/calendar.service";
import { DraggableDirective } from "../../directives/draggable.directive";

@Component({
  selector: "app-week-calendar",
  standalone: true,
  imports: [CommonModule, DraggableDirective],
  template: `
    <div class="week-calendar-container">
      <div class="timeline-header">
        <div class="time-gutter"></div>
        <div class="day-headers">
          <div
            *ngFor="let day of calendarDays"
            class="day-header"
            [class.outside-month]="!day.isCurrentMonth"
          >
            <div class="day-name">{{ getDayName(day.date) }}</div>
            <div class="day-number">{{ day.date.getDate() }}</div>
          </div>
        </div>
      </div>

      <div class="week-body">
        <div class="time-gutter">
          <div *ngFor="let hour of hours" class="hour-label">
            {{ formatHour(hour) }}
          </div>
        </div>

        <div class="week-grid">
          <div class="hour-grid">
            <div *ngFor="let hour of hours" class="hour-row"></div>
          </div>

          <div class="day-columns">
            <div
              *ngFor="let day of calendarDays; let i = index"
              class="day-column"
              [class.today]="day.isToday"
              [class.outside-month]="!day.isCurrentMonth"
              (click)="onTimeSlotClick($event, day.date)"
              (keydown)="onTimeSlotKeydown($event, day.date)"
              tabindex="0"
              role="gridcell"
              [attr.aria-label]="formatDayColumnAriaLabel(day)"
              #dayColumn
            >
              <div
                *ngFor="let appointment of getAppointmentsForDay(day.date)"
                class="appointment-item"
                [style.top.px]="getAppointmentTop(appointment)"
                [style.height.px]="getAppointmentHeight(appointment)"
                [style.background-color]="appointment.color || '#4285F4'"
                (click)="onAppointmentClick($event, appointment)"
                (keydown)="onAppointmentKeydown($event, appointment)"
                tabindex="0"
                role="button"
                [attr.aria-label]="formatAppointmentAriaLabel(appointment)"
                appDraggable
                [appointment]="appointment"
                [dayWidth]="dayColumnWidth"
                (appointmentMoved)="onAppointmentMoved($event)"
              >
                <div class="appointment-time">
                  {{ formatTime(appointment.start) }} -
                  {{ formatTime(appointment.end) }}
                </div>
                <div class="appointment-title">{{ appointment.title }}</div>
                <div class="appointment-actions">
                  <button
                    class="action-btn edit-btn"
                    (click)="onEditAppointment($event, appointment)"
                    aria-label="Edit appointment"
                  >
                    <span class="action-icon">✏️</span>
                  </button>
                  <button
                    class="action-btn delete-btn"
                    (click)="onDeleteAppointment($event, appointment)"
                    aria-label="Delete appointment"
                  >
                    <span class="action-icon">🗑️</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            *ngIf="hasTodayColumn()"
            class="current-time-indicator"
            [style.top.px]="currentTimePosition"
          ></div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .week-calendar-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 600px;
      }

      .timeline-header {
        display: flex;
        border-bottom: 1px solid #dadce0;
      }

      .time-gutter {
        width: 60px;
        border-right: 1px solid #dadce0;
      }

      .day-headers {
        display: flex;
        flex: 1;
      }

      .day-header {
        flex: 1;
        text-align: center;
        padding: 8px 0;
      }

      .day-name {
        font-size: 12px;
        color: #70757a;
      }

      .day-number {
        font-size: 26px;
        line-height: 36px;
        font-weight: 400;
      }

      .today {
        background-color: #e8f0fe;
      }

      .today .day-number {
        color: #1a73e8;
        font-weight: 500;
      }

      .outside-month {
        color: #70757a;
      }

      .week-body {
        display: flex;
        flex: 1;
        overflow-y: auto;
      }

      .hour-label {
        height: 48px;
        padding-right: 8px;
        text-align: right;
        font-size: 12px;
        color: #70757a;
      }

      .week-grid {
        position: relative;
        flex: 1;
        display: flex;
      }

      .hour-grid {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
      }

      .hour-row {
        height: 48px;
        border-bottom: 1px solid #dadce0;
      }

      .day-columns {
        display: flex;
        flex: 1;
        position: relative;
      }

      .day-column {
        flex: 1;
        position: relative;
        min-height: 1152px; /* 24 hours * 48px */
        border-right: 1px solid #dadce0;
        outline: none;
      }

      .day-column.today {
        background-color: #f8f9fa;
      }

      .day-column:focus {
        background-color: #f1f3f4;
      }

      .appointment-item {
        position: absolute;
        left: 2px;
        right: 2px;
        border-radius: 4px;
        padding: 2px 4px;
        color: #fff;
        overflow: hidden;
        cursor: grab;
        font-size: 12px;
        z-index: 1;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
        outline: none;
      }

      .appointment-item:hover,
      .appointment-item:focus {
        opacity: 0.9;
      }

      .appointment-item:active {
        cursor: grabbing;
      }

      .appointment-time {
        font-weight: bold;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .appointment-title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .appointment-actions {
        position: absolute;
        top: 2px;
        right: 2px;
        display: none;
        background-color: rgba(255, 255, 255, 0.95);
        border-radius: 4px;
        padding: 2px;
        z-index: 10;
      }

      .appointment-item:hover .appointment-actions,
      .appointment-item:focus .appointment-actions {
        display: flex;
      }

      .action-btn {
        border: none;
        background: transparent;
        width: 22px;
        height: 22px;
        padding: 0;
        margin: 0 2px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 20;
      }

      .action-btn:hover {
        background-color: rgba(0, 0, 0, 0.1);
      }

      .edit-btn {
        color: #1a73e8;
      }

      .delete-btn {
        color: #ea4335;
      }

      .action-icon {
        font-size: 12px;
      }

      .current-time-indicator {
        position: absolute;
        left: 60px;
        right: 0;
        height: 2px;
        background-color: #ea4335;
        z-index: 2;
      }

      .current-time-indicator::before {
        content: "";
        position: absolute;
        left: -6px;
        top: -4px;
        width: 10px;
        height: 10px;
        background-color: #ea4335;
        border-radius: 50%;
      }
    `,
  ],
})
export class WeekCalendarComponent
  implements OnChanges, AfterViewInit, OnDestroy
{
  @Input() calendarDays: CalendarDay[] = [];
  @Input() appointments: Appointment[] = [];
  @Input() selectedDate: Date | null = null;

  @Output() daySelected = new EventEmitter<Date>();
  @Output() appointmentSelected = new EventEmitter<Appointment>();
  @Output() appointmentUpdated = new EventEmitter<Appointment>();
  @Output() appointmentDeleted = new EventEmitter<string>();

  @ViewChildren("dayColumn") dayColumns!: QueryList<ElementRef>;

  hours: number[] = Array.from(Array(24).keys());
  appointmentsByDay: Map<string, Appointment[]> = new Map();
  isToday = false;
  currentTimePosition = 0;
  dayColumnWidth = 0;

  private resizeTimer: ReturnType<typeof setTimeout> | null = null;
  private timeUpdateTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    window.addEventListener("resize", this.onWindowResize);
  }

  ngAfterViewInit(): void {
    this.calculateDayColumnWidth();
  }

  ngOnDestroy(): void {
    window.removeEventListener("resize", this.onWindowResize);
    if (this.timeUpdateTimer) {
      clearInterval(this.timeUpdateTimer);
    }
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }
  }

  private onWindowResize = (): void => {
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }
    this.resizeTimer = setTimeout(() => {
      this.calculateDayColumnWidth();
    }, 250);
  };

  private calculateDayColumnWidth(): void {
    if (this.dayColumns && this.dayColumns.length > 0) {
      const firstColumn = this.dayColumns.first.nativeElement;
      this.dayColumnWidth = firstColumn.getBoundingClientRect().width;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["appointments"] && this.appointments) {
      this.organizeAppointmentsByDay();
    }

    if (changes["calendarDays"] && this.calendarDays.length > 0) {
      this.isToday = this.calendarDays.some((day) => day.isToday);
      this.updateCurrentTimePosition();

      setTimeout(() => {
        this.calculateDayColumnWidth();
      }, 0);
    }

    if (this.timeUpdateTimer) {
      clearInterval(this.timeUpdateTimer);
    }
    this.timeUpdateTimer = setInterval(() => {
      this.updateCurrentTimePosition();
    }, 60000);
  }

  formatDayColumnAriaLabel(day: CalendarDay): string {
    const date = day.date;
    const dayName = this.getDayName(date);
    const month = date.toLocaleString("default", { month: "long" });
    const dayNum = date.getDate();
    const appointments = this.getAppointmentsForDay(date);
    const eventCount = appointments.length;

    let label = `${dayName}, ${month} ${dayNum}`;
    if (day.isToday) {
      label += " (Today)";
    }
    if (eventCount > 0) {
      label += `, ${eventCount} appointment${eventCount === 1 ? "" : "s"}`;
    }

    return label;
  }

  formatAppointmentAriaLabel(appointment: Appointment): string {
    const title = appointment.title;
    const startTime = this.formatTime(appointment.start);
    const endTime = this.formatTime(appointment.end);
    return `${title}, from ${startTime} to ${endTime}`;
  }

  getDayName(date: Date): string {
    return date.toLocaleString("default", { weekday: "short" });
  }

  formatHour(hour: number): string {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  }

  formatTime(date: Date): string {
    return date.toLocaleString("default", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  getAppointmentTop(appointment: Appointment): number {
    const hours = appointment.start.getHours();
    const minutes = appointment.start.getMinutes();
    return (hours * 60 + minutes) * 0.8;
  }

  getAppointmentHeight(appointment: Appointment): number {
    const startTime =
      appointment.start.getHours() * 60 + appointment.start.getMinutes();
    const endTime =
      appointment.end.getHours() * 60 + appointment.end.getMinutes();
    const durationMinutes = endTime - startTime;
    return Math.max(durationMinutes * 0.8, 20);
  }

  hasTodayColumn(): boolean {
    return this.calendarDays.some((day) => day.isToday);
  }

  updateCurrentTimePosition(): void {
    if (!this.hasTodayColumn()) return;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    this.currentTimePosition = (hours * 60 + minutes) * 0.8;
  }

  organizeAppointmentsByDay(): void {
    this.appointmentsByDay.clear();

    this.appointments.forEach((appointment) => {
      const dateKey = this.getDateKey(appointment.start);

      if (!this.appointmentsByDay.has(dateKey)) {
        this.appointmentsByDay.set(dateKey, []);
      }

      this.appointmentsByDay.get(dateKey)?.push(appointment);
    });
  }

  getAppointmentsForDay(date: Date): Appointment[] {
    const dateKey = this.getDateKey(date);
    return this.appointmentsByDay.get(dateKey) || [];
  }

  private getDateKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }

  onTimeSlotClick(event: MouseEvent, date: Date): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const relativeY = event.clientY - rect.top;
    const minutes = Math.floor(relativeY / 0.8);

    const clickedDate = new Date(date);
    clickedDate.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);

    this.daySelected.emit(clickedDate);
  }

  onTimeSlotKeydown(event: KeyboardEvent, date: Date): void {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      const element = event.currentTarget as HTMLElement;
      const rect = element.getBoundingClientRect();
      const middleY = element.scrollTop + rect.height / 2;
      const minutes = Math.floor(middleY / 0.8);

      const clickedDate = new Date(date);
      clickedDate.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);

      this.daySelected.emit(clickedDate);
    }
  }

  onAppointmentClick(event: MouseEvent, appointment: Appointment): void {
    event.stopPropagation();
    this.appointmentSelected.emit(appointment);
  }

  onAppointmentKeydown(event: KeyboardEvent, appointment: Appointment): void {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      this.appointmentSelected.emit(appointment);
    }
  }

  onEditAppointment(event: MouseEvent, appointment: Appointment): void {
    event.stopPropagation();
    this.appointmentSelected.emit(appointment);
  }

  onDeleteAppointment(event: MouseEvent, appointment: Appointment): void {
    event.stopPropagation();
    if (confirm("Are you sure you want to delete this appointment?")) {
      this.appointmentDeleted.emit(appointment.id);
    }
  }

  onAppointmentMoved(data: {
    appointment: Appointment;
    newStart: Date;
    newEnd: Date;
    dayDelta: number;
  }): void {
    const updatedAppointment = {
      ...data.appointment,
      start: data.newStart,
      end: data.newEnd,
    };

    this.appointmentUpdated.emit(updatedAppointment);
  }
}
