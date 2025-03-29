import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

export interface ModalData {
  title?: string;
  content?: string;
  type?: string;
  [key: string]: unknown;
}

@Injectable({
  providedIn: "root",
})
export class ModalService {
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  private modalDataSubject = new BehaviorSubject<ModalData | null>(null);

  isOpen$ = this.isOpenSubject.asObservable();
  modalData$ = this.modalDataSubject.asObservable();

  constructor() {}

  open(data?: ModalData): void {
    this.modalDataSubject.next(data || null);
    this.isOpenSubject.next(true);
  }

  close(): void {
    this.isOpenSubject.next(false);
    setTimeout(() => {
      this.modalDataSubject.next(null);
    }, 300);
  }

  isOpen(): Observable<boolean> {
    return this.isOpen$;
  }

  getModalData(): Observable<ModalData | null> {
    return this.modalData$;
  }
}
