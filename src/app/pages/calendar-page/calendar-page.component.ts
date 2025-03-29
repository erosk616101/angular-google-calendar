import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subscription } from "rxjs";
import {
  CalendarService,
  ViewMode,
  CalendarDay,
} from "../../services/calendar.service";
import { AppointmentService } from "../../services/appointment.service";
import { ModalService } from "../../services/modal.service";
import { Appointment } from "../../models/appointment.model";
import { AppointmentFormComponent } from "../../components/appointment-form/appointment-form.component";
import { MonthCalendarComponent } from "../../components/month-calendar/month-calendar.component";
import { WeekCalendarComponent } from "../../components/week-calendar/week-calendar.component";
import { DayCalendarComponent } from "../../components/day-calendar/day-calendar.component";

@Component({
  selector: "app-calendar-page",
  standalone: true,
  imports: [
    CommonModule,
    MonthCalendarComponent,
    WeekCalendarComponent,
    DayCalendarComponent,
    AppointmentFormComponent,
  ],
  template: `
    <div class="calendar-page">
      <!-- Calendar Header -->
      <header class="calendar-header">
        <div class="header-left">
          <div class="logo">
            <span class="logo-icon">📅</span>
            <span class="logo-text">Calendar</span>
          </div>
          <button class="today-button" (click)="goToToday()">Today</button>
          <div class="navigation-buttons">
            <button class="nav-button" (click)="previous()">
              <span class="nav-icon">&#9664;</span>
            </button>
            <button class="nav-button" (click)="next()">
              <span class="nav-icon">&#9654;</span>
            </button>
          </div>
          <h2 class="current-date-display">{{ currentDateDisplay }}</h2>
        </div>

        <div class="header-right">
          <div class="view-selector">
            <button
              *ngFor="let mode of viewModes"
              class="view-button"
              [class.active]="currentViewMode === mode.value"
              (click)="setViewMode(mode.value)"
            >
              {{ mode.label }}
            </button>
          </div>
          <button class="create-button" (click)="openNewAppointmentModal()">
            Create
          </button>
        </div>
      </header>

      <!-- Calendar View Container -->
      <main class="calendar-container">
        <!-- Month View -->
        <app-month-calendar
          *ngIf="currentViewMode === 'month'"
          [calendarDays]="calendarDays"
          [appointments]="appointments"
          [selectedDate]="selectedDate"
          (daySelected)="onDaySelected($event)"
          (appointmentSelected)="onAppointmentSelected($event)"
          (appointmentDeleted)="deleteAppointmentById($event)"
        >
        </app-month-calendar>

        <!-- Week View -->
        <app-week-calendar
          *ngIf="currentViewMode === 'week'"
          [calendarDays]="weekDays"
          [appointments]="appointments"
          [selectedDate]="selectedDate"
          (daySelected)="onDaySelected($event)"
          (appointmentSelected)="onAppointmentSelected($event)"
          (appointmentUpdated)="updateAppointment($event)"
          (appointmentDeleted)="deleteAppointmentById($event)"
        >
        </app-week-calendar>

        <!-- Day View -->
        <app-day-calendar
          *ngIf="currentViewMode === 'day'"
          [currentDate]="currentDate"
          [appointments]="filteredAppointments"
          (timeSlotSelected)="onDaySelected($event)"
          (appointmentSelected)="onAppointmentSelected($event)"
          (appointmentUpdated)="updateAppointment($event)"
          (dayChanged)="onDayChanged($event)"
          (appointmentDeleted)="deleteAppointmentById($event)"
        >
        </app-day-calendar>
      </main>

      <!-- Appointment Form Modal -->
      <app-appointment-form
        *ngIf="showAppointmentModal"
        [appointment]="selectedAppointment"
        [startDate]="selectedDate"
        (saveAppointment)="saveAppointment($event)"
        (deleteAppointment)="deleteAppointment($event)"
        (cancelForm)="closeAppointmentModal()"
      >
      </app-appointment-form>
    </div>
  `,
  styles: [
    `
      .calendar-page {
        display: flex;
        flex-direction: column;
        height: 100vh;
        max-height: 100vh;
        overflow: hidden;
        background-color: #f8f9fa;
      }

      .calendar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 16px;
        background-color: #fff;
        border-bottom: 1px solid #dadce0;
        height: 64px;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .logo {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 22px;
        font-weight: 400;
        color: #5f6368;
        margin-right: 12px;
      }

      .logo-icon {
        font-size: 24px;
      }

      .today-button {
        background-color: transparent;
        border: 1px solid #dadce0;
        border-radius: 4px;
        padding: 8px 16px;
        font-size: 14px;
        color: #3c4043;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .today-button:hover {
        background-color: #f1f3f4;
      }

      .navigation-buttons {
        display: flex;
        gap: 4px;
      }

      .nav-button {
        background-color: transparent;
        border: none;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #5f6368;
        transition: background-color 0.2s;
      }

      .nav-button:hover {
        background-color: #f1f3f4;
      }

      .nav-icon {
        font-size: 12px;
      }

      .current-date-display {
        font-size: 22px;
        font-weight: 400;
        color: #3c4043;
        margin: 0;
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .view-selector {
        display: flex;
        border: 1px solid #dadce0;
        border-radius: 4px;
        overflow: hidden;
      }

      .view-button {
        background-color: transparent;
        border: none;
        padding: 8px 12px;
        font-size: 14px;
        color: #3c4043;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .view-button:hover {
        background-color: #f1f3f4;
      }

      .view-button.active {
        background-color: #e8f0fe;
        color: #1a73e8;
      }

      .create-button {
        background-color: #1a73e8;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 24px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .create-button:hover {
        background-color: #1765cc;
      }

      .calendar-container {
        flex: 1;
        overflow: hidden;
        background-color: #fff;
      }
    `,
  ],
})
export class CalendarPageComponent implements OnInit, OnDestroy {
  currentDate: Date = new Date();
  selectedDate: Date | null = null;
  currentViewMode: ViewMode = ViewMode.Month;
  currentDateDisplay: string = "";

  calendarDays: CalendarDay[] = [];
  weekDays: CalendarDay[] = [];

  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  selectedAppointment: Appointment | null = null;

  showAppointmentModal = false;

  viewModes = [
    { label: "Day", value: ViewMode.Day },
    { label: "Week", value: ViewMode.Week },
    { label: "Month", value: ViewMode.Month },
  ];

  private subscriptions = new Subscription();

  constructor(
    private calendarService: CalendarService,
    private appointmentService: AppointmentService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.calendarService.getCurrentDate().subscribe((date) => {
        this.currentDate = date;
        this.updateCalendarView();
      })
    );

    this.subscriptions.add(
      this.calendarService.getViewMode().subscribe((mode) => {
        this.currentViewMode = mode;
        this.updateCalendarView();
      })
    );

    this.subscriptions.add(
      this.appointmentService.getAppointments().subscribe((appointments) => {
        this.appointments = appointments;
        this.updateFilteredAppointments();
      })
    );

    this.appointmentService.loadAppointments();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  updateCalendarView(): void {
    switch (this.currentViewMode) {
      case ViewMode.Day:
        this.currentDateDisplay = this.calendarService.formatDayHeader(
          this.currentDate
        );
        this.updateFilteredAppointments();
        break;
      case ViewMode.Week:
        this.weekDays = this.calendarService.getWeekDays(this.currentDate);
        this.currentDateDisplay = `${this.formatMonthYear(
          this.weekDays[0].date
        )} - ${this.formatMonthYear(this.weekDays[6].date)}`;
        break;
      case ViewMode.Month:
        this.calendarDays = this.calendarService.getMonthDays(this.currentDate);
        this.currentDateDisplay = this.calendarService.formatMonthYear(
          this.currentDate
        );
        break;
    }
  }

  formatMonthYear(date: Date): string {
    return date.toLocaleString("default", {
      month: "short",
      day: "numeric",
      year: this.isDifferentYear(date) ? "numeric" : undefined,
    });
  }

  isDifferentYear(date: Date): boolean {
    return date.getFullYear() !== this.currentDate.getFullYear();
  }

  updateFilteredAppointments(): void {
    if (this.currentViewMode === ViewMode.Day) {
      this.filteredAppointments = this.appointments.filter((app) =>
        this.calendarService.isSameDay(app.start, this.currentDate)
      );
    }
  }

  onDayChanged(date: Date): void {
    this.calendarService.setCurrentDate(date);
  }

  goToToday(): void {
    this.calendarService.goToToday();
  }

  previous(): void {
    this.calendarService.goToPrevious();
  }

  next(): void {
    this.calendarService.goToNext();
  }

  setViewMode(mode: ViewMode): void {
    this.calendarService.setViewMode(mode);
  }

  onDaySelected(date: Date): void {
    this.selectedDate = date;
    this.selectedAppointment = null;
    this.openNewAppointmentModal();
  }

  onAppointmentSelected(appointment: Appointment): void {
    this.selectedAppointment = appointment;
    this.selectedDate = new Date(appointment.start);
    this.openAppointmentModal();
  }

  openNewAppointmentModal(): void {
    this.selectedAppointment = null;
    this.showAppointmentModal = true;
  }

  openAppointmentModal(): void {
    this.showAppointmentModal = true;
  }

  closeAppointmentModal(): void {
    this.showAppointmentModal = false;
  }

  saveAppointment(appointment: Appointment): void {
    if (appointment.id) {
      this.appointmentService.updateAppointment(appointment).subscribe({
        next: () => {
          this.closeAppointmentModal();
        },
        error: (err) => console.error("Error updating appointment:", err),
      });
    } else {
      this.appointmentService.addAppointment(appointment).subscribe({
        next: () => {
          this.closeAppointmentModal();
        },
        error: (err) => console.error("Error creating appointment:", err),
      });
    }
  }

  updateAppointment(appointment: Appointment): void {
    if (appointment.id) {
      this.appointmentService.updateAppointment(appointment).subscribe({
        next: () => {},
        error: (err) => console.error("Error updating appointment:", err),
      });
    }
  }

  deleteAppointmentById(id: string): void {
    if (!id) return;

    this.appointmentService.deleteAppointment(id).subscribe({
      next: () => {},
      error: (err) => console.error("Error deleting appointment:", err),
    });
  }

  deleteAppointment(id: string): void {
    if (!id) return;

    this.appointmentService.deleteAppointment(id).subscribe({
      next: () => {
        this.closeAppointmentModal();
      },
      error: (err) => console.error("Error deleting appointment:", err),
    });
  }
}
