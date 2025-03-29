import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Appointment } from "../../models/appointment.model";
import { CalendarDay } from "../../services/calendar.service";

@Component({
  selector: "app-month-calendar",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="calendar-container">
      <div class="calendar-header">
        <div class="day-names">
          <div class="day-name" *ngFor="let day of dayNames">{{ day }}</div>
        </div>
      </div>

      <div class="calendar-grid">
        <div
          *ngFor="let day of calendarDays"
          class="day-cell"
          [class.outside-month]="!day.isCurrentMonth"
          [class.today]="day.isToday"
          [class.selected]="isSelected(day.date)"
          (click)="onDayClick(day.date)"
          (keydown)="onDayKeydown($event, day.date)"
          tabindex="0"
          role="button"
          [attr.aria-label]="formatDayAriaLabel(day)"
        >
          <div class="day-number">{{ day.date.getDate() }}</div>

          <div class="events-container">
            <div
              *ngFor="
                let appointment of getAppointmentsForDay(day.date);
                let i = index
              "
              class="event-pill"
              [style.background-color]="appointment.color || '#4285F4'"
              (click)="onEventClick($event, appointment)"
              (keydown)="onEventKeydown($event, appointment)"
              tabindex="0"
              role="button"
              [attr.aria-label]="formatEventAriaLabel(appointment)"
              [class.hidden]="i >= 3"
            >
              {{ appointment.title }}
            </div>

            <div
              *ngIf="getAppointmentsForDay(day.date).length > 3"
              class="more-events"
            >
              + {{ getAppointmentsForDay(day.date).length - 3 }} more
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .calendar-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 600px;
      }

      .calendar-header {
        background-color: #fff;
        border-bottom: 1px solid #dadce0;
      }

      .day-names {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        text-align: center;
        color: #70757a;
        font-size: 12px;
        padding: 8px 0;
      }

      .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        grid-template-rows: repeat(6, 1fr);
        flex: 1;
        border-left: 1px solid #dadce0;
      }

      .day-cell {
        position: relative;
        min-height: 100px;
        padding: 8px;
        border-right: 1px solid #dadce0;
        border-bottom: 1px solid #dadce0;
        background-color: #fff;
        overflow: hidden;
        cursor: pointer;
        outline: none;
      }

      .day-cell:hover,
      .day-cell:focus {
        background-color: #f8f9fa;
      }

      .outside-month {
        background-color: #f8f9fa;
        color: #70757a;
      }

      .today {
        background-color: #e8f0fe;
      }

      .selected {
        background-color: #e6f3ff;
      }

      .day-number {
        font-size: 14px;
        margin-bottom: 5px;
        font-weight: 500;
      }

      .today .day-number {
        color: #1a73e8;
        font-weight: bold;
      }

      .events-container {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .event-pill {
        font-size: 12px;
        color: white;
        padding: 2px 4px;
        border-radius: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
        outline: none;
      }

      .event-pill:hover,
      .event-pill:focus {
        opacity: 0.9;
      }

      .more-events {
        font-size: 12px;
        color: #70757a;
        margin-top: 2px;
      }

      .hidden {
        display: none;
      }
    `,
  ],
})
export class MonthCalendarComponent implements OnChanges {
  @Input() calendarDays: CalendarDay[] = [];
  @Input() appointments: Appointment[] = [];
  @Input() selectedDate: Date | null = null;

  @Output() daySelected = new EventEmitter<Date>();
  @Output() appointmentSelected = new EventEmitter<Appointment>();
  @Output() appointmentDeleted = new EventEmitter<string>();

  dayNames: string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  appointmentsByDay: Map<string, Appointment[]> = new Map();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["appointments"] && this.appointments) {
      this.organizeAppointmentsByDay();
    }
  }

  isSelected(date: Date): boolean {
    if (!this.selectedDate) return false;

    return (
      date.getDate() === this.selectedDate.getDate() &&
      date.getMonth() === this.selectedDate.getMonth() &&
      date.getFullYear() === this.selectedDate.getFullYear()
    );
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

  formatDayAriaLabel(day: CalendarDay): string {
    const date = day.date;
    const month = date.toLocaleString("default", { month: "long" });
    const dayNum = date.getDate();
    const year = date.getFullYear();
    const appointments = this.getAppointmentsForDay(date);
    const eventCount = appointments.length;

    let label = `${month} ${dayNum}, ${year}`;
    if (day.isToday) {
      label += " (Today)";
    }
    if (eventCount > 0) {
      label += `, ${eventCount} event${eventCount === 1 ? "" : "s"}`;
    }

    return label;
  }

  formatEventAriaLabel(appointment: Appointment): string {
    const startTime = appointment.start.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const endTime = appointment.end.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${appointment.title}, ${startTime} to ${endTime}`;
  }

  onDayClick(date: Date): void {
    this.daySelected.emit(date);
  }

  onDayKeydown(event: KeyboardEvent, date: Date): void {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.daySelected.emit(date);
    }
  }

  onEventClick(event: MouseEvent, appointment: Appointment): void {
    event.stopPropagation();
    this.appointmentSelected.emit(appointment);
  }

  onEventKeydown(event: KeyboardEvent, appointment: Appointment): void {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      this.appointmentSelected.emit(appointment);
    }
  }

  onDeleteAppointment(event: MouseEvent, appointment: Appointment): void {
    event.stopPropagation();
    if (confirm("Are you sure you want to delete this appointment?")) {
      this.appointmentDeleted.emit(appointment.id);
    }
  }
}
