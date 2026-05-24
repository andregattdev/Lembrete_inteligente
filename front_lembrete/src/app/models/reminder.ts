export interface Reminder {
  id?: number;
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  category: string;
  completed: boolean;
  recurring: boolean;
}

export interface ReminderRequest {
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  category: string;
  recurring: boolean;
}
