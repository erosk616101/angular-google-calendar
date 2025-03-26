import { CommonModule } from "@angular/common";
import { Component, Inject, Optional } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  NativeDateAdapter,
} from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { Appointment } from "../../models/appointment.model";

@Component({
  selector: "app-appointment-form",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSelectModule,
    MatIconModule,
  ],
  providers: [
    MatDatepickerModule,
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_LOCALE, useValue: "en-US" },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: "MM/DD/YYYY",
        },
        display: {
          dateInput: "MM/DD/YYYY",
          monthYearLabel: "MMM YYYY",
          dateA11yLabel: "LL",
          monthYearA11yLabel: "MMMM YYYY",
        },
      },
    },
  ],
  template: `
    <div class="appointment-form">
      <h2 mat-dialog-title>{{ isEdit ? "Edit" : "New" }} Event</h2>

      <form [formGroup]="appointmentForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="form-field-full">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" required />
          <mat-error *ngIf="appointmentForm.get('title')?.hasError('required')">
            Title is required
          </mat-error>
        </mat-form-field>

        <div class="date-time-container">
          <mat-form-field appearance="outline">
            <mat-label>Date</mat-label>
            <input
              matInput
              [matDatepicker]="picker"
              formControlName="date"
              required
            />
            <mat-datepicker-toggle
              matSuffix
              [for]="picker"
            ></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Time</mat-label>
            <input matInput type="time" formControlName="time" required />
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="form-field-full">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="form-field-full">
          <mat-label>Color</mat-label>
          <mat-select formControlName="color">
            <mat-option value="#4285f4">Blue</mat-option>
            <mat-option value="#0f9d58">Green</mat-option>
            <mat-option value="#db4437">Red</mat-option>
            <mat-option value="#f4b400">Yellow</mat-option>
            <mat-option value="#ab47bc">Purple</mat-option>
          </mat-select>
        </mat-form-field>

        <div mat-dialog-actions align="end">
          <button mat-button type="button" (click)="onCancel()">Cancel</button>
          <button
            mat-raised-button
            color="primary"
            type="submit"
            [disabled]="!appointmentForm.valid"
          >
            {{ isEdit ? "Update" : "Create" }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .appointment-form {
        padding: 16px;
      }

      .form-field-full {
        width: 100%;
        margin-bottom: 16px;
      }

      .date-time-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 16px;
      }

      mat-form-field {
        width: 100%;
      }

      .mat-mdc-dialog-actions {
        padding: 16px 0 0;
        margin-bottom: 0;
      }
    `,
  ],
})
export class AppointmentFormComponent {
  appointmentForm: FormGroup;
  isEdit: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AppointmentFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private data: Appointment
  ) {
    this.isEdit = !!(data && data.id);

    this.appointmentForm = this.fb.group({
      title: ["", Validators.required],
      date: [new Date(), Validators.required],
      time: ["09:00", Validators.required],
      description: [""],
      color: ["#4285f4"],
    });

    if (data) {
      if (this.isEdit) {
        const date = new Date(this.data.date);
        this.appointmentForm.patchValue({
          ...this.data,
          date: date,
          time: `${date.getHours().toString().padStart(2, "0")}:${date
            .getMinutes()
            .toString()
            .padStart(2, "0")}`,
        });
      } else if (data.date) {
        const date = new Date(data.date);
        this.appointmentForm.patchValue({
          date: date,
          time: `${date.getHours().toString().padStart(2, "0")}:${date
            .getMinutes()
            .toString()
            .padStart(2, "0")}`,
        });
      }
    }
  }

  onSubmit(): void {
    if (this.appointmentForm.valid) {
      const formValue = this.appointmentForm.value;
      const [hours, minutes] = formValue.time.split(":");
      const date = new Date(formValue.date);
      date.setHours(parseInt(hours), parseInt(minutes));

      const appointment: Appointment = {
        id: this.isEdit ? this.data.id : Date.now().toString(),
        title: formValue.title,
        date: date,
        description: formValue.description,
        color: formValue.color,
      };

      this.dialogRef.close(appointment);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
