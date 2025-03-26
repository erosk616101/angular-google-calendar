import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Appointment } from "../models/appointment.model";

@Injectable({
  providedIn: "root",
})
export class AppointmentService {
  private readonly STORAGE_KEY = "calendar_appointments";
  private appointments = new BehaviorSubject<Appointment[]>([]);

  constructor() {
    this.loadAppointments();
  }

  private loadAppointments(): void {
    try {
      const savedData = localStorage.getItem(this.STORAGE_KEY);
      if (savedData) {
        const appointments = JSON.parse(savedData).map(
          (app: Partial<Appointment>) => ({
            ...app,
            date: new Date(app.date as string | number | Date),
          })
        );
        this.appointments.next(appointments);
      }
    } catch (error) {
      console.error("Error loading appointments from storage:", error);
      this.appointments.next([]);
    }
  }

  private saveAppointments(appointments: Appointment[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(appointments));
    } catch (error) {
      console.error("Error saving appointments to storage:", error);
    }
  }

  getAppointments(): Observable<Appointment[]> {
    return this.appointments.asObservable();
  }

  addAppointment(appointment: Appointment): void {
    if (!appointment.id) {
      appointment.id = this.generateUniqueId();
    }

    const current = this.appointments.value;
    const updated = [...current, appointment];
    this.appointments.next(updated);
    this.saveAppointments(updated);
  }

  deleteAppointment(id: string): void {
    if (!id) return;

    const current = this.appointments.value;
    const updated = current.filter((app) => app.id !== id);

    if (updated.length !== current.length) {
      this.appointments.next(updated);
      this.saveAppointments(updated);
    }
  }

  updateAppointment(appointment: Appointment): void {
    if (!appointment || !appointment.id) return;

    const current = this.appointments.value;
    const index = current.findIndex((app) => app.id === appointment.id);

    if (index !== -1) {
      const updated = [...current];
      updated[index] = {
        ...appointment,
        date:
          appointment.date instanceof Date
            ? appointment.date
            : new Date(appointment.date),
      };
      this.appointments.next(updated);
      this.saveAppointments(updated);
    }
  }

  private generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
