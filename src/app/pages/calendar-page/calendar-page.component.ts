import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatDialogModule } from "@angular/material/dialog";
import { CalendarComponent } from "../../components/calendar/calendar.component";
import { AppointmentFormComponent } from "../../components/appointment-form/appointment-form.component";

@Component({
  selector: "app-calendar-page",
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    CalendarComponent,
    AppointmentFormComponent,
  ],
  template: `
    <div class="calendar-page">
      <h1>Calendar Application</h1>
      <div class="calendar-container-wrapper">
        <app-calendar></app-calendar>
      </div>
    </div>
  `,
  styles: [
    `
      .calendar-page {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      .calendar-container-wrapper {
        position: relative;
        flex: 1;
      }
      h1 {
        text-align: center;
        margin-bottom: 20px;
      }
    `,
  ],
})
export class CalendarPageComponent {}
