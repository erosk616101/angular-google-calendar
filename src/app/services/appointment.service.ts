import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { Appointment } from "../models/appointment.model";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class AppointmentService {
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  public appointments$ = this.appointmentsSubject.asObservable();

  private sampleAppointments: Appointment[] = [
    {
      id: "1",
      title: "Team Meeting",
      start: new Date(2025, 2, 10, 10, 0),
      end: new Date(2025, 2, 10, 11, 0),
      description: "Weekly team sync-up",
      color: "#4285F4",
    },
    {
      id: "2",
      title: "Lunch with Client",
      start: new Date(2025, 2, 12, 12, 30),
      end: new Date(2025, 2, 12, 13, 30),
      description: "Discussing new project",
      color: "#0F9D58",
    },
    {
      id: "3",
      title: "Doctor Appointment",
      start: new Date(2025, 2, 15, 14, 0),
      end: new Date(2025, 2, 15, 15, 0),
      description: "Annual checkup",
      color: "#DB4437",
    },
    {
      id: "4",
      title: "Project Deadline",
      start: new Date(2025, 2, 20, 9, 0),
      end: new Date(2025, 2, 20, 17, 0),
      description: "Final submission for Q1 project",
      color: "#F4B400",
    },
  ];

  constructor() {
    this.loadAppointments();
  }

  loadAppointments(): void {
    setTimeout(() => {
      this.appointmentsSubject.next(this.sampleAppointments);
    }, 300);
  }

  getAppointments(): Observable<Appointment[]> {
    return this.appointments$;
  }

  getAppointmentById(id: string): Observable<Appointment | undefined> {
    return this.appointments$.pipe(
      map((appointments) => appointments.find((app) => app.id === id))
    );
  }

  getAppointmentsByDate(date: Date): Observable<Appointment[]> {
    return this.appointments$.pipe(
      map((appointments) =>
        appointments.filter(
          (app) =>
            app.start.getDate() === date.getDate() &&
            app.start.getMonth() === date.getMonth() &&
            app.start.getFullYear() === date.getFullYear()
        )
      )
    );
  }

  addAppointment(appointment: Appointment): Observable<Appointment> {
    const newId = Math.random().toString(36).substring(2, 9);
    const newAppointment = {
      ...appointment,
      id: newId,
      color: appointment.color || this.getRandomColor(),
    };

    const currentAppointments = this.appointmentsSubject.getValue();
    this.appointmentsSubject.next([...currentAppointments, newAppointment]);

    return of(newAppointment);
  }

  updateAppointment(updatedAppointment: Appointment): Observable<Appointment> {
    const currentAppointments = this.appointmentsSubject.getValue();
    const updatedAppointments = currentAppointments.map((app) =>
      app.id === updatedAppointment.id ? updatedAppointment : app
    );

    this.appointmentsSubject.next(updatedAppointments);
    return of(updatedAppointment);
  }

  deleteAppointment(id: string): Observable<boolean> {
    const currentAppointments = this.appointmentsSubject.getValue();
    const filteredAppointments = currentAppointments.filter(
      (app) => app.id !== id
    );

    this.appointmentsSubject.next(filteredAppointments);
    return of(true);
  }

  checkOverlap(appointment: Appointment): Observable<boolean> {
    return this.appointments$.pipe(
      map((appointments) => {
        const otherAppointments = appointments.filter((app) =>
          appointment.id ? app.id !== appointment.id : true
        );

        return otherAppointments.some(
          (app) => appointment.start < app.end && appointment.end > app.start
        );
      })
    );
  }

  private getRandomColor(): string {
    const colors = [
      "#4285F4",
      "#DB4437",
      "#F4B400",
      "#0F9D58",
      "#8430CE",
      "#FF6D01",
      "#46BDC6",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
