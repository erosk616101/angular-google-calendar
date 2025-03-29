import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

export enum ViewMode {
  Day = "day",
  Week = "week",
  Month = "month",
}

@Injectable({
  providedIn: "root",
})
export class UiStateService {
  private viewModeSubject = new BehaviorSubject<ViewMode>(ViewMode.Month);
  public viewMode$ = this.viewModeSubject.asObservable();

  private selectedDateSubject = new BehaviorSubject<Date | null>(null);
  public selectedDate$ = this.selectedDateSubject.asObservable();

  private sidebarOpenSubject = new BehaviorSubject<boolean>(false);
  public sidebarOpen$ = this.sidebarOpenSubject.asObservable();

  constructor() {}

  setViewMode(mode: ViewMode): void {
    this.viewModeSubject.next(mode);
  }

  getViewMode(): Observable<ViewMode> {
    return this.viewMode$;
  }

  setSelectedDate(date: Date | null): void {
    this.selectedDateSubject.next(date);
  }

  getSelectedDate(): Observable<Date | null> {
    return this.selectedDate$;
  }

  toggleSidebar(): void {
    const currentState = this.sidebarOpenSubject.getValue();
    this.sidebarOpenSubject.next(!currentState);
  }

  openSidebar(): void {
    this.sidebarOpenSubject.next(true);
  }

  closeSidebar(): void {
    this.sidebarOpenSubject.next(false);
  }
}
