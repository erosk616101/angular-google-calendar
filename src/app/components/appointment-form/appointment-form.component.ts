import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Appointment } from "../../models/appointment.model";

@Component({
  selector: "app-appointment-form",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="modal-overlay"
      (click)="onOverlayClick($event)"
      (keydown)="onOverlayKeydown($event)"
      tabindex="0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div class="modal-content">
        <div
          class="modal-header"
          [style.background-color]="formData.color || '#4285F4'"
        >
          <h2 id="modal-title">
            {{ isEditMode ? "Edit Appointment" : "New Appointment" }}
          </h2>
          <button class="close-button" (click)="onCancel()">×</button>
        </div>

        <div class="modal-body">
          <form (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                [(ngModel)]="formData.title"
                placeholder="Add title"
                required
                class="form-control"
              />
            </div>

            <div class="form-row">
              <div class="form-group half-width">
                <label for="start">Start Date & Time</label>
                <input
                  type="datetime-local"
                  id="start"
                  name="start"
                  [ngModel]="formatDateForInput(formData.start)"
                  (ngModelChange)="formData.start = parseInputDate($event)"
                  required
                  class="form-control"
                />
              </div>

              <div class="form-group half-width">
                <label for="end">End Date & Time</label>
                <input
                  type="datetime-local"
                  id="end"
                  name="end"
                  [ngModel]="formatDateForInput(formData.end)"
                  (ngModelChange)="formData.end = parseInputDate($event)"
                  required
                  class="form-control"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                id="description"
                name="description"
                [(ngModel)]="formData.description"
                placeholder="Add description (optional)"
                rows="3"
                class="form-control"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="color">Color</label>
              <div
                class="color-selector"
                role="radiogroup"
                aria-label="Appointment color"
              >
                <button
                  *ngFor="let color of colors; let i = index"
                  class="color-option"
                  type="button"
                  [attr.id]="'color-' + i"
                  [style.background-color]="color"
                  [class.selected]="formData.color === color"
                  (click)="selectColor(color)"
                  (keydown)="onColorKeydown($event, color)"
                  tabindex="0"
                  role="radio"
                  [attr.aria-checked]="formData.color === color"
                  [attr.aria-label]="'Color ' + (i + 1)"
                ></button>
              </div>
            </div>

            <div class="form-actions">
              <button
                *ngIf="isEditMode"
                type="button"
                class="delete-button"
                (click)="onDelete()"
              >
                Delete
              </button>
              <div class="right-actions">
                <button
                  type="button"
                  class="cancel-button"
                  (click)="onCancel()"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="save-button"
                  [disabled]="
                    !formData.title || !formData.start || !formData.end
                  "
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        outline: none;
      }

      .modal-content {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        width: 500px;
        max-width: 95%;
        max-height: 95vh;
        overflow-y: auto;
        animation: modal-appear 0.25s ease-out;
      }

      @keyframes modal-appear {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .modal-header {
        padding: 16px 20px;
        color: white;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .modal-header h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }

      .close-button {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
      }

      .modal-body {
        padding: 20px;
      }

      .form-group {
        margin-bottom: 16px;
      }

      .form-row {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
      }

      .half-width {
        flex: 1;
        margin-bottom: 0;
      }

      label {
        display: block;
        margin-bottom: 6px;
        font-size: 14px;
        color: #5f6368;
      }

      .form-control {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #dadce0;
        border-radius: 4px;
        font-size: 14px;
        transition: border-color 0.2s;
      }

      .form-control:focus {
        outline: none;
        border-color: #4285f4;
      }

      .color-selector {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .color-option {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        transition: transform 0.2s;
        position: relative;
        outline: none;
        border: none;
        padding: 0;
        background-color: transparent;
      }

      .color-option:hover,
      .color-option:focus {
        transform: scale(1.1);
      }

      .color-option.selected::after {
        content: "";
        position: absolute;
        top: -3px;
        left: -3px;
        right: -3px;
        bottom: -3px;
        border: 2px solid #000;
        border-radius: 50%;
        opacity: 0.3;
      }

      .form-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 24px;
      }

      .right-actions {
        display: flex;
        gap: 8px;
      }

      button {
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .save-button {
        background-color: #1a73e8;
        color: white;
        border: none;
      }

      .save-button:hover {
        background-color: #1765cc;
      }

      .save-button:disabled {
        background-color: #dadce0;
        cursor: not-allowed;
      }

      .cancel-button {
        background-color: transparent;
        border: 1px solid #dadce0;
        color: #3c4043;
      }

      .cancel-button:hover {
        background-color: #f1f3f4;
      }

      .delete-button {
        background-color: transparent;
        border: none;
        color: #ea4335;
      }

      .delete-button:hover {
        background-color: rgba(234, 67, 53, 0.1);
      }
    `,
  ],
})
export class AppointmentFormComponent implements OnInit {
  @Input() appointment: Appointment | null = null;
  @Input() startDate: Date | null = null;

  @Output() saveAppointment = new EventEmitter<Appointment>();
  @Output() deleteAppointment = new EventEmitter<string>();
  @Output() cancelForm = new EventEmitter<void>();

  formData: Partial<Appointment> = {
    title: "",
    start: new Date(),
    end: new Date(),
    description: "",
    color: "#4285F4",
  };

  isEditMode = false;

  colors: string[] = [
    "#4285F4",
    "#DB4437",
    "#F4B400",
    "#0F9D58",
    "#8430CE",
    "#FF6D01",
    "#46BDC6",
    "#616161",
  ];

  ngOnInit(): void {
    this.isEditMode = !!this.appointment?.id;

    if (this.appointment) {
      this.formData = { ...this.appointment };
    } else if (this.startDate) {
      const endDate = new Date(this.startDate);
      endDate.setHours(endDate.getHours() + 1);

      this.formData.start = this.startDate;
      this.formData.end = endDate;
    } else {
      const now = new Date();
      now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30);

      const end = new Date(now);
      end.setHours(end.getHours() + 1);

      this.formData.start = now;
      this.formData.end = end;
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains("modal-overlay")) {
      this.onCancel();
    }
  }

  onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      this.onCancel();
    }
  }

  selectColor(color: string): void {
    this.formData.color = color;
  }

  onColorKeydown(event: KeyboardEvent, color: string): void {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.formData.color = color;
    }
  }

  formatDateForInput(date: Date | undefined): string {
    if (!date) return "";

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  parseInputDate(dateString: string): Date {
    return new Date(dateString);
  }

  onSubmit(): void {
    if (!this.formData.title || !this.formData.start || !this.formData.end) {
      return;
    }

    const appointmentData: Appointment = {
      id: this.isEditMode ? this.appointment!.id : "",
      title: this.formData.title,
      start: this.formData.start!,
      end: this.formData.end!,
      description: this.formData.description,
      color: this.formData.color,
    };

    this.saveAppointment.emit(appointmentData);
  }

  onDelete(): void {
    if (confirm("Are you sure you want to delete this appointment?")) {
      this.deleteAppointment.emit(this.appointment!.id);
    }
  }

  onCancel(): void {
    this.cancelForm.emit();
  }
}
