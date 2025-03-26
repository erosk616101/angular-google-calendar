import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { CdkDragDrop, DragDropModule } from "@angular/cdk/drag-drop";
import { AppointmentService } from "../../services/appointment.service";
import { Appointment } from "../../models/appointment.model";
import { Observable, map } from "rxjs";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { AppointmentFormComponent } from "../appointment-form/appointment-form.component";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";

@Component({
  selector: "app-calendar",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatDialogModule,
    DragDropModule,
    AppointmentFormComponent,
    MatMenuModule,
    MatTooltipModule,
  ],
  template: `
    <div class="calendar-container">
      <div class="calendar-header">
        <div class="calendar-nav-group">
          <button
            mat-icon-button
            (click)="previousWeek()"
            aria-label="Previous week"
          >
            <mat-icon>chevron_left</mat-icon>
          </button>
          <button mat-icon-button (click)="nextWeek()" aria-label="Next week">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>

        <button
          mat-flat-button
          class="today-button"
          (click)="today()"
          color="basic"
        >
          Today
        </button>

        <h2>{{ currentMonth }} {{ currentYear }}</h2>

        <button
          mat-flat-button
          class="create-button"
          color="primary"
          (click)="openAppointmentDialog()"
        >
          <mat-icon>add</mat-icon>
          Create Event
        </button>
      </div>

      <div class="calendar-grid">
        <div class="time-column">
          <div class="day-header"></div>
          <div class="time-slots">
            <div class="time-slot" *ngFor="let hour of hours">
              {{ hour > 0 ? hour.toString().padStart(2, "0") + ":00" : "" }}
            </div>
          </div>
        </div>

        <div *ngFor="let date of calendarDates" class="calendar-column">
          <div class="day-header">
            <div class="day-name">{{ date | date : "EEE" }}</div>
            <div class="day-number" [class.today]="isToday(date)">
              {{ date | date : "d" }}
            </div>
          </div>

          <div
            class="day-content"
            cdkDropList
            [id]="'list-' + date.getTime()"
            [cdkDropListData]="getAppointmentsForDate(date) | async"
            [cdkDropListConnectedTo]="getConnectedLists()"
            (cdkDropListDropped)="drop($event)"
            (click)="handleTimelineClick($event, date)"
            (keydown.enter)="openAppointmentDialog(date)"
            tabindex="0"
          >
            <div class="time-grid">
              <div class="hour-slot" *ngFor="let hour of hours">
                <div class="quarter-hour-line"></div>
                <div class="quarter-hour-line"></div>
                <div class="quarter-hour-line"></div>
              </div>
            </div>

            <ng-container
              *ngFor="
                let appointment of (getAppointmentsForDate(date) | async) || []
              "
            >
              <div
                cdkDrag
                [cdkDragData]="appointment"
                class="appointment-item"
                [style.backgroundColor]="appointment.color || '#2563eb'"
                [style.top.px]="getAppointmentPosition(appointment)"
                [style.height.px]="getAppointmentHeight()"
                [matMenuTriggerFor]="appointmentMenu"
                [matMenuTriggerData]="{ appointment: appointment }"
                tabindex="0"
              >
                <div class="appointment-time">
                  {{ appointment.date | date : "shortTime" }}
                </div>
                <div class="appointment-title">{{ appointment.title }}</div>
                <div class="appointment-actions">
                  <mat-icon
                    class="action-icon edit-icon"
                    (click)="
                      $event.stopPropagation(); editAppointment(appointment)
                    "
                    matTooltip="Edit"
                  >
                    edit
                  </mat-icon>
                  <mat-icon
                    class="action-icon delete-icon"
                    (click)="
                      $event.stopPropagation(); deleteAppointment(appointment)
                    "
                    matTooltip="Delete"
                  >
                    delete
                  </mat-icon>
                </div>
                <div class="drag-handle">
                  <mat-icon>drag_indicator</mat-icon>
                </div>
              </div>
            </ng-container>
          </div>
        </div>
      </div>
    </div>

    <mat-menu #appointmentMenu="matMenu">
      <ng-template matMenuContent let-appointment="appointment">
        <button mat-menu-item (click)="editAppointment(appointment)">
          <mat-icon>edit</mat-icon>
          <span>Edit</span>
        </button>
        <button mat-menu-item (click)="deleteAppointment(appointment)">
          <mat-icon color="warn">delete</mat-icon>
          <span class="text-warn">Delete</span>
        </button>
      </ng-template>
    </mat-menu>
  `,
  styles: [
    `
      .calendar-header {
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 16px;
        border-bottom: 1px solid #e0e0e0;
        background: #fff;
        z-index: 1;
        position: sticky;
        top: 0;
      }

      .calendar-header h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 400;
      }

      .calendar-grid {
        display: grid;
        grid-template-columns: 80px repeat(7, 1fr);
      }

      .time-column {
        border-right: 1px solid #e0e0e0;
        background: #fff;
        z-index: 1;
        position: sticky;
        left: 0;
        display: flex;
        flex-direction: column;
      }

      .time-slots {
        flex: 1;
        position: relative;
      }

      .time-slot {
        height: 60px;
        padding: 0 8px;
        text-align: right;
        color: #70757a;
        font-size: 12px;
        position: relative;
        top: -10px;
      }

      .calendar-column {
        border-right: 1px solid #e0e0e0;
        min-width: 180px;
      }

      .day-header {
        height: 80px;
        padding: 8px;
        text-align: center;
        border-bottom: 1px solid #e0e0e0;
        background: #f8f9fa;
        position: sticky;
        top: 0;
        z-index: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 4px;
      }

      .day-name {
        font-size: 14px;
        color: #70757a;
      }

      .day-number {
        font-size: 24px;
        font-weight: 400;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
      }

      .today {
        background: #1a73e8;
        color: white;
        border-radius: 50%;
      }

      .day-content {
        position: relative;
        height: 1440px;
        cursor: pointer;
      }

      .time-grid {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
      }

      .hour-slot {
        height: 60px;
        border-bottom: 1px solid #e0e0e0;
        position: relative;
      }

      .quarter-hour-line {
        position: absolute;
        left: 0;
        right: 0;
        border-bottom: 1px dashed #e0e0e0;
      }

      .quarter-hour-line:nth-child(1) {
        top: 15px;
      }

      .quarter-hour-line:nth-child(2) {
        top: 30px;
      }

      .quarter-hour-line:nth-child(3) {
        top: 45px;
      }

      .appointment-item {
        position: absolute;
        left: 4px;
        right: 4px;
        min-height: 30px;
        padding: 4px 8px;
        color: white;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        overflow: hidden;
        transition: all 0.2s ease;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
      }

      .appointment-item:hover {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .appointment-time {
        font-size: 11px;
        opacity: 0.9;
        margin-bottom: 2px;
      }

      .appointment-title {
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex-grow: 1;
      }

      .appointment-actions {
        position: absolute;
        top: 2px;
        right: 24px;
        opacity: 0;
        transition: opacity 0.2s;
        display: flex;
        gap: 6px;
      }

      .appointment-actions .action-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        line-height: 16px;
        cursor: pointer;
      }

      .appointment-actions .delete-icon {
        color: #f44336;
      }

      .appointment-item:hover .appointment-actions {
        opacity: 0.7;
      }

      .drag-handle {
        position: absolute;
        top: 2px;
        right: 2px;
        cursor: move;
        opacity: 0;
        transition: opacity 0.2s;
      }

      .drag-handle .mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        line-height: 18px;
      }

      .appointment-item:hover .drag-handle {
        opacity: 0.7;
      }

      .cdk-drag-preview {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .cdk-drag-placeholder {
        opacity: 0.3;
      }

      .cdk-drag-animating {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }

      .cdk-drop-list-dragging .appointment-item:not(.cdk-drag-placeholder) {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }

      .text-warn {
        color: #f44336;
      }
    `,
  ],
})
export class CalendarComponent implements OnInit {
  appointments$: Observable<Appointment[]>;
  calendarDates: Date[] = [];
  currentMonth: string = "";
  currentYear: number = 0;
  hours: number[] = Array.from({ length: 24 }, (_, i) => i);
  dropLists: string[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private dialog: MatDialog
  ) {
    this.appointments$ = this.appointmentService.getAppointments();
    this.generateCalendarDates();
  }

  ngOnInit(): void {
    this.updateHeaderDate();
    this.updateDropLists();
  }

  updateDropLists(): void {
    this.dropLists = this.calendarDates.map((date) => "list-" + date.getTime());
  }

  getConnectedLists(): string[] {
    return this.dropLists;
  }

  getAppointmentsForDate(date: Date): Observable<Appointment[]> {
    return this.appointments$.pipe(
      map((appointments) => {
        return appointments.filter((app) => {
          const appDate =
            app.date instanceof Date ? app.date : new Date(app.date);
          return this.isSameDate(appDate, date);
        });
      })
    );
  }

  generateCalendarDates(): void {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    this.calendarDates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  }

  updateHeaderDate(): void {
    const firstDate = this.calendarDates[0];
    this.currentMonth = firstDate.toLocaleString("default", { month: "long" });
    this.currentYear = firstDate.getFullYear();
  }

  previousWeek(): void {
    const firstDate = new Date(this.calendarDates[0]);
    firstDate.setDate(firstDate.getDate() - 7);
    this.calendarDates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(firstDate);
      date.setDate(firstDate.getDate() + i);
      return date;
    });
    this.updateHeaderDate();
    this.updateDropLists();
  }

  nextWeek(): void {
    const firstDate = new Date(this.calendarDates[0]);
    firstDate.setDate(firstDate.getDate() + 7);
    this.calendarDates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(firstDate);
      date.setDate(firstDate.getDate() + i);
      return date;
    });
    this.updateHeaderDate();
    this.updateDropLists();
  }

  today(): void {
    this.generateCalendarDates();
    this.updateHeaderDate();
    this.updateDropLists();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isSameDate(date1: Date | string, date2: Date | string): boolean {
    const d1 = date1 instanceof Date ? date1 : new Date(date1);
    const d2 = date2 instanceof Date ? date2 : new Date(date2);

    return d1.toDateString() === d2.toDateString();
  }

  getAppointmentPosition(appointment: Appointment): number {
    const date =
      appointment.date instanceof Date
        ? appointment.date
        : new Date(appointment.date);
    const minutes = date.getHours() * 60 + date.getMinutes();
    return (minutes / 60) * 60;
  }

  getAppointmentHeight(): number {
    return 30;
  }

  openAppointmentDialog(initialDate?: Date): void {
    const dialogRef = this.dialog.open(AppointmentFormComponent, {
      width: "400px",
      panelClass: "appointment-form-dialog",
      data: initialDate ? { date: initialDate } : undefined,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.appointmentService.addAppointment(result);
      }
    });
  }

  handleTimelineClick(event: MouseEvent, date: Date): void {
    if ((event.target as HTMLElement).closest(".appointment-item")) {
      return;
    }

    const containerElement = event.currentTarget as HTMLElement;
    const rect = containerElement.getBoundingClientRect();
    const offsetY = event.clientY - rect.top + containerElement.scrollTop;

    const hourHeight = 60;
    const totalMinutes = (offsetY / hourHeight) * 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = this.roundToNearestQuarter(totalMinutes % 60);

    const finalHours = minutes === 60 ? hours + 1 : hours;
    const finalMinutes = minutes === 60 ? 0 : minutes;

    const appointmentDate = new Date(date);
    appointmentDate.setHours(finalHours, finalMinutes, 0, 0);

    this.openAppointmentDialog(appointmentDate);
  }

  editAppointment(appointment: Appointment): void {
    const dialogRef = this.dialog.open(AppointmentFormComponent, {
      width: "400px",
      panelClass: "appointment-form-dialog",
      data: appointment,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.appointmentService.updateAppointment(result);
      }
    });
  }

  deleteAppointment(appointment: Appointment): void {
    if (confirm("Are you sure you want to delete this appointment?")) {
      if (appointment && appointment.id) {
        this.appointmentService.deleteAppointment(appointment.id);
      }
    }
  }

  private roundToNearestQuarter(minutes: number): number {
    return Math.round(minutes / 15) * 15;
  }

  drop(event: CdkDragDrop<Appointment[] | null>): void {
    if (!event.container.data || !event.item.data) return;

    const appointment = event.item.data as Appointment;
    const containerElement = event.container.element.nativeElement;
    const rect = containerElement.getBoundingClientRect();
    const offsetY = event.dropPoint.y - rect.top + containerElement.scrollTop;

    const hourHeight = 60;
    const totalMinutes = (offsetY / hourHeight) * 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = this.roundToNearestQuarter(totalMinutes % 60);

    // Adjust hours if minutes round up to 60
    const finalHours = minutes === 60 ? hours + 1 : hours;
    const finalMinutes = minutes === 60 ? 0 : minutes;

    // Create new date from the target container's date
    const targetDate = new Date(parseInt(event.container.id.split("-")[1]));
    targetDate.setHours(finalHours, finalMinutes);

    // Update the appointment with the new date
    this.appointmentService.updateAppointment({
      ...appointment,
      date: targetDate,
    });
  }
}
