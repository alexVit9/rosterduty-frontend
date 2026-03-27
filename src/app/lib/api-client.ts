// API Client for RosterDuty backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface LocationData {
  id: string;
  name: string;
  restaurant_id: string;
}

export interface DepartmentData {
  id: string;
  name: string;
  restaurant_id: string;
}

export interface EmployeeData {
  id: string;
  name: string;
  email: string;
  position?: string;
  access_level: 'manager' | 'employee';
  invite_accepted: boolean;
  created_at: string;
}

export interface RestaurantData {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  locations: LocationData[];
  departments: DepartmentData[];
  employees: EmployeeData[];
}

export interface TemplateItemData {
  id: string;
  template_id: string;
  name: string;
  description?: string;
  requires_photo: boolean;
  order: number;
  example_photo_urls?: string[];
}

export interface TemplateData {
  id: string;
  name: string;
  description?: string;
  location_id?: string;
  department_id?: string;
  time_from?: string;
  time_to?: string;
  recurrence_type?: 'daily' | 'weekly' | 'monthly';
  recurrence_day_of_week?: number;   // 0=Mon..6=Sun
  recurrence_day_of_month?: number;  // 1-31
  created_by: string;
  restaurant_id: string;
  created_at: string;
  items: TemplateItemData[];
}

export interface DashboardTemplateEntry {
  id: string;
  name: string;
  description?: string;
  location_id?: string;
  department_id?: string;
  department_name?: string;
  time_from?: string;
  time_to?: string;
  recurrence_type?: 'daily' | 'weekly' | 'monthly';
  recurrence_day_of_week?: number;
  recurrence_day_of_month?: number;
  is_completed: boolean;
  completed_by_name?: string;
  total_items: number;
  completed_items: number;
}

export interface DashboardLocationGroup {
  location_name: string;
  templates: DashboardTemplateEntry[];
}

export interface CompletedChecklistItemData {
  id: string;
  checklist_item_id: string;
  name: string;
  requires_photo: boolean;
  completed: boolean;
  photo_url?: string;
  comment?: string;
}

export interface CompletedChecklistData {
  id: string;
  template_id: string;
  template_name: string;
  date: string;
  completed_by: string;
  completed_by_name?: string;
  restaurant_id: string;
  location_id?: string;
  department_id?: string;
  created_at: string;
  total_items: number;
  completed_items: number;
  items: CompletedChecklistItemData[];
}

interface ApiError {
  message: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const text = await response.text();
      let message = text;
      try {
        const json = JSON.parse(text);
        if (json.detail) message = json.detail;
      } catch {}
      const error: ApiError = { message, status: response.status };
      throw error;
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // --- HEALTH ---
  async checkHealth() {
    return this.request<{ status: string }>('/health');
  }

  // --- AUTH ---
  async registerManager(data: { email: string; password: string; name: string; restaurant_name: string }) {
    const response = await this.request<{ access_token: string; token_type: string }>('/auth/register/manager', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    localStorage.setItem('auth_token', response.access_token);
    return response;
  }

  async login(data: { email: string; password: string }) {
    const response = await this.request<{ access_token: string; token_type: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    localStorage.setItem('auth_token', response.access_token);
    return response;
  }

  async getMe() {
    return this.request<{
      id: string;
      email: string;
      name: string;
      access_level: 'manager' | 'employee';
      restaurant_id?: string;
      position?: string;
      invite_accepted: boolean;
      created_at: string;
    }>('/auth/me');
  }

  async acceptInvite(data: { token: string; password: string }) {
    const response = await this.request<{ access_token: string; token_type: string }>('/auth/invite/accept', {
      method: 'POST',
      body: JSON.stringify({ invite_token: data.token, password: data.password }),
    });
    localStorage.setItem('auth_token', response.access_token);
    return response;
  }

  logout() {
    localStorage.removeItem('auth_token');
  }

  // --- USERS (manager only) ---
  async getUsers() {
    return this.request<EmployeeData[]>('/users');
  }

  async inviteUser(data: { email: string; name: string; position?: string }) {
    return this.request<EmployeeData>('/users/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(employeeId: string, data: Partial<{ name: string; position?: string }>) {
    return this.request<EmployeeData>(`/users/${employeeId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(employeeId: string) {
    return this.request<void>(`/users/${employeeId}`, {
      method: 'DELETE',
    });
  }

  async resendInvite(employeeId: string) {
    return this.request<{ detail: string }>(`/users/${employeeId}/resend-invite`, {
      method: 'POST',
    });
  }

  // --- RESTAURANT (manager only) ---
  async getRestaurant() {
    return this.request<RestaurantData>('/restaurant');
  }

  async updateRestaurantName(name: string) {
    return this.request<any>('/restaurant', {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
  }

  async addLocation(name: string) {
    return this.request<LocationData>('/restaurant/locations', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async deleteLocation(id: string) {
    return this.request<void>(`/restaurant/locations/${id}`, {
      method: 'DELETE',
    });
  }

  async addDepartment(name: string) {
    return this.request<DepartmentData>('/restaurant/departments', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async deleteDepartment(id: string) {
    return this.request<void>(`/restaurant/departments/${id}`, {
      method: 'DELETE',
    });
  }

  // --- CHECKLIST TEMPLATES (manager only) ---
  async getTemplates(locationId?: string, departmentId?: string) {
    const params = new URLSearchParams();
    if (locationId) params.append('location_id', locationId);
    if (departmentId) params.append('department_id', departmentId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<TemplateData[]>(`/templates${query}`);
  }

  async createTemplate(data: {
    name: string;
    description?: string;
    location_id?: string;
    department_id?: string;
    time_from?: string;
    time_to?: string;
    recurrence_type?: string;
    recurrence_day_of_week?: number;
    recurrence_day_of_month?: number;
    items: { name: string; description?: string; requires_photo: boolean; order: number }[];
  }) {
    return this.request<TemplateData>('/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTemplate(templateId: string) {
    return this.request<TemplateData>(`/templates/${templateId}`);
  }

  async updateTemplate(templateId: string, data: {
    name?: string;
    description?: string;
    location_id?: string | null;
    department_id?: string | null;
    time_from?: string | null;
    time_to?: string | null;
    recurrence_type?: string | null;
    recurrence_day_of_week?: number | null;
    recurrence_day_of_month?: number | null;
    items?: { id?: string; name: string; description?: string; requires_photo: boolean; order: number }[];
  }) {
    return this.request<TemplateData>(`/templates/${templateId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTemplate(templateId: string) {
    return this.request<void>(`/templates/${templateId}`, {
      method: 'DELETE',
    });
  }

  // --- CHECKLISTS ---
  async getActiveChecklistsToday() {
    return this.request<any[]>('/checklists/active/today');
  }

  async completeChecklist(data: {
    template_id: string;
    items: { checklist_item_id: string; completed: boolean; photo_url?: string; comment?: string }[];
  }) {
    const localDate = new Date();
    const client_date = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
    return this.request<any>('/checklists/complete', {
      method: 'POST',
      body: JSON.stringify({ ...data, client_date }),
    });
  }

  async getMyChecklistHistory() {
    return this.request<CompletedChecklistData[]>('/checklists/history/my');
  }

  async getMonthSummary(year: number, month: number, locationId?: string): Promise<{ date: string; total: number; all_done: number }[]> {
    const params = new URLSearchParams({ year: String(year), month: String(month) });
    if (locationId) params.append('location_id', locationId);
    return this.request(`/checklists/history/month-summary?${params.toString()}`);
  }

  async getChecklistHistory(date?: string, locationId?: string) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (locationId) params.append('location_id', locationId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<CompletedChecklistData[]>(`/checklists/history${query}`);
  }

  async getChecklistDetails(id: string) {
    return this.request<CompletedChecklistData>(`/checklists/history/${id}`);
  }

  // --- DASHBOARD ---
  async getDashboardToday() {
    return this.request<DashboardLocationGroup[]>('/dashboard/today');
  }

  // --- PHOTOS ---
  async uploadPhoto(file: File): Promise<{ photo_url: string }> {
    const token = this.getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/photos/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      let message = text;
      try { const json = JSON.parse(text); if (json.detail) message = json.detail; } catch {}
      throw { message, status: response.status };
    }

    return response.json();
  }

  // --- SUBSCRIPTION ---
  async subscriptionRequest(data: { plan: string; billing: string }) {
    return this.request<{ detail: string }>('/subscription/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
