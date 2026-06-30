// ============================================================================
// Symbiosis HR Payroll - Event Bus (Pub/Sub Pattern)
// ============================================================================

type EventCallback<T = any> = (data: T) => void;
type EventMap = Record<string, EventCallback[]>;

export class EventBus {
  private events: EventMap = {};
  private static instance: EventBus;

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  on<T = any>(event: string, callback: EventCallback<T>): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  off<T = any>(event: string, callback: EventCallback<T>): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit<T = any>(event: string, data: T): void {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  once<T = any>(event: string, callback: EventCallback<T>): () => void {
    const wrapper = (data: T) => {
      callback(data);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }

  clear(event?: string): void {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

// Global event bus instance
export const eventBus = EventBus.getInstance();

// Event names constants
export const Events = {
  DATABASE_UPDATED: 'databaseUpdated',
  LOGIN: 'login',
  LOGOUT: 'logout',
  ROLE_CHANGED: 'roleChanged',
  ORG_CHANGED: 'orgChanged',
  TAB_CHANGED: 'tabChanged',
  THEME_CHANGED: 'themeChanged',
  PERIOD_CHANGED: 'periodChanged',
  PAYROLL_LOCKED: 'payrollLocked',
  EMPLOYEE_ADDED: 'employeeAdded',
  EMPLOYEE_UPDATED: 'employeeUpdated',
  EMPLOYEE_DELETED: 'employeeDeleted',
  ATTENDANCE_UPLOADED: 'attendanceUploaded',
  TOAST: 'toast',
  ERROR: 'error'
} as const;