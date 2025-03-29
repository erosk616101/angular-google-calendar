import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  Renderer2,
} from "@angular/core";
import { Appointment } from "../models/appointment.model";

@Directive({
  selector: "[appDraggable]",
  standalone: true,
})
export class DraggableDirective {
  @Input() appointment!: Appointment;
  @Input() dragEnabled = true;
  @Input() dayWidth = 0;
  @Output() appointmentMoved = new EventEmitter<{
    appointment: Appointment;
    newStart: Date;
    newEnd: Date;
    dayDelta: number;
  }>();

  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private originalLeft = 0;
  private originalTop = 0;
  private dragElement: HTMLElement | null = null;
  private minutesPerPixel = 1.25;

  private dayDelta = 0;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener("mousedown", ["$event"])
  onMouseDown(event: MouseEvent): void {
    if (!this.dragEnabled) return;

    if (this.isButtonOrChildOfButton(event.target as HTMLElement)) {
      return;
    }

    event.preventDefault();

    this.isDragging = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.originalTop = this.el.nativeElement.offsetTop;
    this.originalLeft = this.el.nativeElement.offsetLeft;
    this.dayDelta = 0;

    this.createDragElement();

    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
  }

  private isButtonOrChildOfButton(element: HTMLElement): boolean {
    if (
      element.tagName === "BUTTON" ||
      element.classList.contains("action-btn") ||
      element.classList.contains("action-icon")
    ) {
      return true;
    }

    let parent = element.parentElement;
    while (parent && parent !== this.el.nativeElement) {
      if (
        parent.tagName === "BUTTON" ||
        parent.classList.contains("action-btn") ||
        parent.classList.contains("appointment-actions")
      ) {
        return true;
      }
      parent = parent.parentElement;
    }

    return false;
  }

  private onMouseMove = (event: MouseEvent): void => {
    if (!this.isDragging || !this.dragElement) return;

    const deltaY = event.clientY - this.startY;
    const deltaX = event.clientX - this.startX;
    const newTop = this.originalTop + deltaY;

    let newDayDelta = 0;

    if (this.dayWidth > 0) {
      newDayDelta = Math.round(deltaX / this.dayWidth);

      const newLeft = newDayDelta * this.dayWidth;
      this.renderer.setStyle(
        this.dragElement,
        "transform",
        `translateX(${newLeft}px)`
      );
    }

    this.renderer.setStyle(this.dragElement, "top", `${newTop}px`);

    this.dayDelta = newDayDelta;
  };

  private onMouseUp = (event: MouseEvent): void => {
    if (!this.isDragging) return;

    this.isDragging = false;

    if (this.dragElement) {
      const deltaY = event.clientY - this.startY;
      const minutesDelta = Math.round(deltaY * this.minutesPerPixel);

      const newStart = new Date(this.appointment.start);
      newStart.setMinutes(newStart.getMinutes() + minutesDelta);

      const newEnd = new Date(this.appointment.end);
      newEnd.setMinutes(newEnd.getMinutes() + minutesDelta);

      if (this.dayDelta !== 0) {
        newStart.setDate(newStart.getDate() + this.dayDelta);
        newEnd.setDate(newEnd.getDate() + this.dayDelta);
      }

      this.appointmentMoved.emit({
        appointment: this.appointment,
        newStart,
        newEnd,
        dayDelta: this.dayDelta,
      });

      this.removeDragElement();
    }

    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
  };

  private createDragElement(): void {
    this.dragElement = this.renderer.createElement("div");

    const styles = window.getComputedStyle(this.el.nativeElement);
    this.renderer.setStyle(this.dragElement, "position", "absolute");
    this.renderer.setStyle(this.dragElement, "top", `${this.originalTop}px`);
    this.renderer.setStyle(
      this.dragElement,
      "left",
      styles.getPropertyValue("left")
    );
    this.renderer.setStyle(
      this.dragElement,
      "width",
      styles.getPropertyValue("width")
    );
    this.renderer.setStyle(
      this.dragElement,
      "height",
      styles.getPropertyValue("height")
    );
    this.renderer.setStyle(
      this.dragElement,
      "background-color",
      styles.getPropertyValue("background-color")
    );
    this.renderer.setStyle(this.dragElement, "opacity", "0.7");
    this.renderer.setStyle(this.dragElement, "z-index", "1000");
    this.renderer.setStyle(this.dragElement, "pointer-events", "none");
    this.renderer.setStyle(this.dragElement, "border-radius", "4px");
    this.renderer.setStyle(
      this.dragElement,
      "transition",
      "transform 0.1s ease"
    );

    const parent = this.el.nativeElement.parentNode;
    this.renderer.appendChild(parent, this.dragElement);
  }

  private removeDragElement(): void {
    if (this.dragElement && this.dragElement.parentNode) {
      this.dragElement.parentNode.removeChild(this.dragElement);
      this.dragElement = null;
    }
  }
}
