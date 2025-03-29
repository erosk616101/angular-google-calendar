import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  ElementRef,
  SimpleChanges,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  NgZone,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Appointment } from "../../models/appointment.model";
import { DraggableDirective } from "../../directives/draggable.directive";

@Component({
  selector: "app-day-calendar",
  standalone: true,
  imports: [CommonModule, DraggableDirective],
  template: `
    <div class="day-calendar-container">
      <div class="day-header">
        <div class="date-display">
          {{ formatDate(currentDate) }}
        </div>
      </div>

      <div class="day-body">
        <div class="time-gutter">
          <div *ngFor="let hour of hours" class="hour-label">
            {{ formatHour(hour) }}
          </div>
        </div>

        <div class="day-grid" #dayGrid>
          <div class="hour-grid">
            <div *ngFor="let hour of hours" class="hour-row"></div>
          </div>

          <div
            class="events-container"
            (click)="onTimeSlotClick($event)"
            (keydown)="onTimeSlotKeydown($event)"
            tabindex="0"
            role="grid"
            aria-label="Day schedule grid"
          >
            <div
              *ngFor="let appointment of appointments"
              class="appointment-item"
              [style.top.px]="getAppointmentTop(appointment)"
              [style.height.px]="getAppointmentHeight(appointment)"
              [style.background-color]="appointment.color || '#4285F4'"
              (click)="onAppointmentClick($event, appointment)"
              (keydown)="onAppointmentKeydown($event, appointment)"
              tabindex="0"
              role="button"
              [attr.aria-label]="
                'Appointment: ' +
                appointment.title +
                ' at ' +
                formatTime(appointment.start)
              "
              appDraggable
              [appointment]="appointment"
              [dayWidth]="300"
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

            <div
              *ngIf="isToday"
              class="current-time-indicator"
              [style.top.px]="currentTimePosition"
            ></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .day-calendar-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 600px;
      }

      .day-header {
        padding: 10px;
        border-bottom: 1px solid #dadce0;
        display: flex;
        justify-content: center;
      }

      .date-display {
        font-size: 18px;
        font-weight: 500;
      }

      .day-body {
        display: flex;
        flex: 1;
        overflow-y: auto;
      }

      .time-gutter {
        width: 60px;
        border-right: 1px solid #dadce0;
      }

      .hour-label {
        height: 48px;
        padding-right: 8px;
        text-align: right;
        font-size: 12px;
        color: #70757a;
      }

      .day-grid {
        position: relative;
        flex: 1;
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

      .events-container {
        position: relative;
        min-height: 1152px; /* 24 hours * 48px */
        width: 100%;
        outline: none;
      }

      .appointment-item {
        position: absolute;
        left: 8px;
        right: 8px;
        border-radius: 4px;
        padding: 4px 8px;
        color: #fff;
        overflow: hidden;
        cursor: grab;
        font-size: 13px;
        z-index: 1;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
        outline: none;
      }

      .appointment-item:hover {
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
        font-size: 14px;
        margin: 2px 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .appointment-actions {
        position: absolute;
        top: 4px;
        right: 4px;
        display: none;
        background-color: rgba(255, 255, 255, 0.95);
        border-radius: 4px;
        padding: 2px;
        z-index: 10;
        box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.15);
      }

      .appointment-item:hover .appointment-actions {
        display: flex;
      }

      .appointment-item:focus .appointment-actions {
        display: flex;
      }

      .action-btn {
        border: none;
        background: transparent;
        width: 24px;
        height: 24px;
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
        font-size: 14px;
      }

      .current-time-indicator {
        position: absolute;
        left: 0;
        right: 0;
        height: 2px;
        background-color: #ea4335;
        z-index: 2;
      }

      .current-time-indicator::before {
        content: "";
        position: absolute;
        left: -8px;
        top: -4px;
        width: 12px;
        height: 12px;
        background-color: #ea4335;
        border-radius: 50%;
      }
    `,
  ],
})
export class DayCalendarComponent
  implements OnChanges, AfterViewInit, OnDestroy
{
  @Input() currentDate!: Date;
  @Input() appointments: Appointment[] = [];

  @Output() timeSlotSelected = new EventEmitter<Date>();
  @Output() appointmentSelected = new EventEmitter<Appointment>();
  @Output() appointmentUpdated = new EventEmitter<Appointment>();
  @Output() appointmentDeleted = new EventEmitter<string>();
  @Output() dayChanged = new EventEmitter<Date>();

  @ViewChild("dayGrid") dayGrid!: ElementRef;

  hours: number[] = Array.from(Array(24).keys());
  isToday = false;
  currentTimePosition = 0;

  private timeUpdateTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.updateCurrentTimePosition();
  }

  ngOnDestroy(): void {
    if (this.timeUpdateTimer) {
      clearInterval(this.timeUpdateTimer);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["currentDate"] && this.currentDate) {
      const today = new Date();
      this.isToday =
        this.currentDate.getDate() === today.getDate() &&
        this.currentDate.getMonth() === today.getMonth() &&
        this.currentDate.getFullYear() === today.getFullYear();
      this.updateCurrentTimePosition();
    }

    if (changes["appointments"] && this.appointments) {
      this.appointments = [...this.appointments].sort(
        (a, b) => a.start.getTime() - b.start.getTime()
      );
    }

    if (this.timeUpdateTimer) {
      clearInterval(this.timeUpdateTimer);
    }

    this.ngZone.runOutsideAngular(() => {
      this.timeUpdateTimer = setInterval(() => {
        this.updateCurrentTimePosition();
        this.ngZone.run(() => {});
      }, 60000);
    });
  }

  formatDate(date: Date): string {
    return date.toLocaleString("default", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
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
    return Math.max(durationMinutes * 0.8, 25);
  }

  updateCurrentTimePosition(): void {
    if (!this.isToday) return;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    this.currentTimePosition = (hours * 60 + minutes) * 0.8;
  }

  onTimeSlotClick(event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const relativeY = event.clientY - rect.top;
    const minutes = Math.floor(relativeY / 0.8);

    const clickedDate = new Date(this.currentDate);
    clickedDate.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);

    this.timeSlotSelected.emit(clickedDate);
  }

  onTimeSlotKeydown(event: KeyboardEvent): void {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const element = event.currentTarget as HTMLElement;

      const middleY = element.scrollTop + element.clientHeight / 2;
      const minutes = Math.floor(middleY / 0.8);

      const clickedDate = new Date(this.currentDate);
      clickedDate.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);

      this.timeSlotSelected.emit(clickedDate);
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

    if (data.dayDelta !== 0) {
      const newDate = new Date(this.currentDate);
      newDate.setDate(newDate.getDate() + data.dayDelta);
      this.dayChanged.emit(newDate);
    }

    this.appointmentUpdated.emit(updatedAppointment);
  }
}
