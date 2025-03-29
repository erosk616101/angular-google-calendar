import { Routes } from "@angular/router";
import { CalendarPageComponent } from "./pages/calendar-page/calendar-page.component";

export const routes: Routes = [
  { path: "", redirectTo: "calendar", pathMatch: "full" },
  { path: "calendar", component: CalendarPageComponent },
  { path: "**", redirectTo: "calendar" },
];
