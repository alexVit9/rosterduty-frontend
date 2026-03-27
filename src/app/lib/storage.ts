import { ChecklistTemplate, CompletedChecklist, Employee } from '../types';

const TEMPLATES_KEY = 'restaurant_checklist_templates';
const COMPLETED_KEY = 'restaurant_completed_checklists';
const RESTAURANT_SETTINGS_KEY = 'restaurant_settings';
const EMPLOYEES_KEY = 'restaurant_employees';

export interface RestaurantSettings {
  name?: string;
  locations: string[];
  departments: string[];
  workingDays?: number[]; // 0-6, where 0 is Sunday
}

// Restaurant Settings
export const getRestaurantSettings = (): RestaurantSettings => {
  const data = localStorage.getItem(RESTAURANT_SETTINGS_KEY);
  return data ? JSON.parse(data) : { locations: [], departments: [] };
};

export const saveRestaurantSettings = (settings: RestaurantSettings): void => {
  localStorage.setItem(RESTAURANT_SETTINGS_KEY, JSON.stringify(settings));
};

export const addLocation = (location: string): void => {
  const settings = getRestaurantSettings();
  if (!settings.locations.includes(location)) {
    settings.locations.push(location);
    saveRestaurantSettings(settings);
  }
};

export const removeLocation = (location: string): void => {
  const settings = getRestaurantSettings();
  settings.locations = settings.locations.filter(l => l !== location);
  saveRestaurantSettings(settings);
};

export const addDepartment = (department: string): void => {
  const settings = getRestaurantSettings();
  if (!settings.departments.includes(department)) {
    settings.departments.push(department);
    saveRestaurantSettings(settings);
  }
};

export const removeDepartment = (department: string): void => {
  const settings = getRestaurantSettings();
  settings.departments = settings.departments.filter(d => d !== department);
  saveRestaurantSettings(settings);
};

// Employees
export const getEmployees = (): Employee[] => {
  const data = localStorage.getItem(EMPLOYEES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveEmployee = (employee: Employee): void => {
  const employees = getEmployees();
  const index = employees.findIndex(e => e.id === employee.id);
  
  if (index >= 0) {
    employees[index] = employee;
  } else {
    employees.push(employee);
  }
  
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
};

export const deleteEmployee = (id: string): void => {
  const employees = getEmployees().filter(e => e.id !== id);
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
};

export const markEmployeeAsRegistered = (email: string): void => {
  const employees = getEmployees();
  const employee = employees.find(e => e.email === email);
  
  if (employee && !employee.registered) {
    employee.registered = true;
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
  }
};

export const getEmployeeByEmail = (email: string): Employee | undefined => {
  return getEmployees().find(e => e.email === email);
};

// Templates
export const getTemplates = (): ChecklistTemplate[] => {
  const data = localStorage.getItem(TEMPLATES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTemplate = (template: ChecklistTemplate): void => {
  const templates = getTemplates();
  const index = templates.findIndex(t => t.id === template.id);
  
  if (index >= 0) {
    templates[index] = template;
  } else {
    templates.push(template);
  }
  
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
};

export const deleteTemplate = (id: string): void => {
  const templates = getTemplates().filter(t => t.id !== id);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
};

export const getTemplateById = (id: string): ChecklistTemplate | undefined => {
  return getTemplates().find(t => t.id === id);
};

// Completed Checklists
export const getCompletedChecklists = (): CompletedChecklist[] => {
  const data = localStorage.getItem(COMPLETED_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveCompletedChecklist = (checklist: CompletedChecklist): void => {
  const completed = getCompletedChecklists();
  const index = completed.findIndex(c => c.id === checklist.id);
  
  if (index >= 0) {
    completed[index] = checklist;
  } else {
    completed.push(checklist);
  }
  
  localStorage.setItem(COMPLETED_KEY, JSON.stringify(completed));
};

export const getCompletedChecklistsByDate = (date: string): CompletedChecklist[] => {
  return getCompletedChecklists().filter(c => c.date === date);
};

export const getCompletedChecklistByTemplateAndDate = (
  templateId: string,
  date: string
): CompletedChecklist | undefined => {
  return getCompletedChecklists().find(
    c => c.templateId === templateId && c.date === date
  );
};

// Initialize sample data for demo
export const initializeSampleData = (): void => {
  const templates = getTemplates();
  const completed = getCompletedChecklists();

  // Only initialize if there's no data
  if (templates.length === 0) {
    // Create sample template
    const sampleTemplate: ChecklistTemplate = {
      id: 'template-1',
      name: 'Утренняя проверка кухни',
      description: 'Ежедневная проверка чистоты и готовности кухни к работе',
      items: [
        { id: 'item-1', text: 'Проверка температуры холодильников' },
        { id: 'item-2', text: 'Проверка чистоты рабочих поверхностей' },
        { id: 'item-3', text: 'Проверка наличия моющих средств' },
        { id: 'item-4', text: 'Проверка срока годности продуктов' },
        { id: 'item-5', text: 'Проверка исправности плит' },
        { id: 'item-6', text: 'Проверка вентиляции' },
        { id: 'item-7', text: 'Проверка чистоты посуды' },
        { id: 'item-8', text: 'Проверка температуры морозильников' },
      ],
      createdAt: new Date().toISOString(),
    };

    saveTemplate(sampleTemplate);

    // Create sample completed checklist for today
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const sampleCompletedChecklist: CompletedChecklist = {
      id: 'completed-1',
      templateId: 'template-1',
      templateName: 'Утренняя проверка кухни',
      date: todayStr,
      items: [
        { itemId: 'item-1', completed: true, photoUrl: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop' },
        { itemId: 'item-2', completed: true, photoUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop' },
        { itemId: 'item-3', completed: true },
        { itemId: 'item-4', completed: false, note: 'Найдены просроченные молочные продукты' },
        { itemId: 'item-5', completed: true, photoUrl: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400&h=400&fit=crop' },
        { itemId: 'item-6', completed: true },
        { itemId: 'item-7', completed: true },
        { itemId: 'item-8', completed: true, photoUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=400&fit=crop' },
      ],
      completedBy: 'Иван Петров',
      completedAt: new Date().toISOString(),
    };

    saveCompletedChecklist(sampleCompletedChecklist);
  }
};