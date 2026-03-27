export interface Employee {
  id: string;
  email: string;
  name: string;
  position: string;
  accessLevel: 'employee' | 'manager';
  location?: string; // для сотрудников с уровнем доступа "employee"
  createdAt: string;
  registered: boolean; // зарегистрировался ли сотрудник в приложении
}

export interface ChecklistItem {
  id: string;
  text: string;
  comment?: string;
  photoUrl?: string;
  requiresPhoto?: boolean;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string;
  location?: string;
  department?: string;
  items: ChecklistItem[];
  createdAt?: string;
  frequency?: 'daily' | 'specific';
  specificDays?: number[];
  timeFrom?: string;
  timeTo?: string;
}

export interface CompletedChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  comment?: string;
  photoUrl?: string;
  requiresPhoto?: boolean;
  completedAt?: string;
}

export interface CompletedChecklist {
  id: string;
  templateId: string;
  templateName: string;
  templateLocation?: string;
  location?: string;
  date: string;
  completedAt: string;
  completedBy?: string; // имя сотрудника, который выполнил чек-лист
  items: CompletedChecklistItem[];
  itemId?: string;
  note?: string;
}