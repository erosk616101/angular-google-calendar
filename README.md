# Angular Calendar Application

A modern, interactive calendar application built with Angular 18 featuring drag-and-drop event management, responsive design, and Material UI components.

## Features

- 📅 Weekly calendar view with intuitive navigation
- ✨ Create and edit calendar events
- 🎨 Color-coded events for better organization
- 🖱️ Drag-and-drop event management
- ⏰ 15-minute time slot precision
- 📱 Responsive design
- 🎯 Modern UI with Material Design

## Technology Stack

- Angular 18
- Angular Material
- Angular CDK (Drag & Drop)
- RxJS
- TypeScript
- ESLint

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── appointment-form/
│   │   └── calendar/
│   ├── models/
│   ├── pages/
│   │   └── calendar-page/
│   ├── services/
│   ├── app.component.ts
│   └── app.routes.ts
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

3. Open your browser and navigate to `http://localhost:4200`

## Development

### Development server

```bash
npm start
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Architecture

### Key Components

- **CalendarComponent**: Main calendar view with drag-and-drop functionality
- **AppointmentFormComponent**: Form for creating and editing appointments
- **AppointmentService**: State management for calendar appointments

### Features Implementation

- **Lazy Loading**: Calendar page is lazy-loaded for better performance
- **Dependency Injection**: Services are properly injected using Angular DI
- **Reactive Forms**: Form handling with validation
- **RxJS**: State management and reactive programming
- **Standalone Components**: Modern Angular architecture
- **Material Design**: Consistent and beautiful UI

## Best Practices

- Proper TypeScript usage
- Comprehensive ESLint configuration
- Reactive programming patterns
- Component composition
- Clean code architecture
- Modern Angular patterns
