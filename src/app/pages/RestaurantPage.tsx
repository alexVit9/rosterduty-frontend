import { useState, useEffect } from 'react';
import { Plus, Trash2, UserPlus, Mail, X, Building2, MapPin, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { MainLayout } from '../components/MainLayout';
import apiClient, { LocationData, DepartmentData, EmployeeData } from '../lib/api-client';
import { toast } from 'sonner';
import { getBadgeColor } from '../lib/badge-colors';
import { useAuth } from '../lib/auth-context';
import { Navigate } from 'react-router';

export default function RestaurantPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [restaurantId, setRestaurantId] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [newLocation, setNewLocation] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '', position: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      loadRestaurant();
    }
  }, [authLoading, user]);

  const loadRestaurant = async () => {
    try {
      const data = await apiClient.getRestaurant();
      setRestaurantId(data.id);
      setRestaurantName(data.name);
      setLocations(data.locations);
      setDepartments(data.departments);
      setEmployees(data.employees);
    } catch (err) {
      toast.error('Ошибка загрузки данных ресторана');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRestaurantName = async () => {
    try {
      await apiClient.updateRestaurantName(restaurantName.trim());
      toast.success('Название сохранено');
    } catch (err) {
      toast.error('Ошибка сохранения названия');
    }
  };

  const handleAddLocation = async () => {
    if (!newLocation.trim()) {
      toast.error('Введите название локации');
      return;
    }
    try {
      const loc = await apiClient.addLocation(newLocation.trim());
      setLocations(prev => [...prev, loc]);
      setNewLocation('');
      toast.success('Локация добавлена');
    } catch (err) {
      toast.error('Ошибка добавления локации');
    }
  };

  const handleRemoveLocation = async (id: string) => {
    try {
      await apiClient.deleteLocation(id);
      setLocations(prev => prev.filter(l => l.id !== id));
      toast.success('Локация удалена');
    } catch (err) {
      toast.error('Ошибка удаления локации');
    }
  };

  const handleAddDepartment = async () => {
    if (!newDepartment.trim()) {
      toast.error('Введите название отдела');
      return;
    }
    try {
      const dept = await apiClient.addDepartment(newDepartment.trim());
      setDepartments(prev => [...prev, dept]);
      setNewDepartment('');
      toast.success('Отдел добавлен');
    } catch (err) {
      toast.error('Ошибка добавления отдела');
    }
  };

  const handleRemoveDepartment = async (id: string) => {
    try {
      await apiClient.deleteDepartment(id);
      setDepartments(prev => prev.filter(d => d.id !== id));
      toast.success('Отдел удален');
    } catch (err) {
      toast.error('Ошибка удаления отдела');
    }
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.name.trim() || !newEmployee.email.trim()) {
      toast.error('Заполните имя и email');
      return;
    }
    try {
      const employee = await apiClient.inviteUser({
        name: newEmployee.name.trim(),
        email: newEmployee.email.trim(),
        position: newEmployee.position.trim() || undefined,
      });
      setEmployees(prev => [...prev, employee]);
      setNewEmployee({ name: '', email: '', position: '' });
      toast.success('Приглашение отправлено на ' + employee.email);
    } catch (err: any) {
      toast.error(err.message || 'Ошибка приглашения сотрудника');
    }
  };

  const handleRemoveEmployee = async (id: string) => {
    try {
      await apiClient.deleteUser(id);
      setEmployees(prev => prev.filter(e => e.id !== id));
      toast.success('Сотрудник удален');
    } catch (err) {
      toast.error('Ошибка удаления сотрудника');
    }
  };

  const handleResendInvitation = async (employee: EmployeeData) => {
    try {
      await apiClient.resendInvite(employee.id);
      toast.success(`Приглашение отправлено на ${employee.email}`);
    } catch (err) {
      toast.error('Ошибка отправки приглашения');
    }
  };

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <MainLayout>
      <header className="bg-white border-b">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Мой ресторан</h1>
          <p className="text-sm text-gray-500 mt-1">Управление локациями, отделами и сотрудниками</p>
        </div>
      </header>

      <main className="px-8 py-8">
        <div className="space-y-6 max-w-6xl">
          {/* Restaurant Name */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <span className="font-semibold flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Название ресторана
                </span>
                <Input
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  onBlur={handleSaveRestaurantName}
                  placeholder="Введите название ресторана"
                  className="flex-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Locations */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Локации
                </span>
                <div className="flex flex-wrap gap-2">
                  {locations.map((loc) => (
                    <Badge
                      key={loc.id}
                      className={`border flex items-center gap-1 pl-2 pr-1 ${getBadgeColor(loc.name, 'location')}`}
                    >
                      <span>{loc.name}</span>
                      <button
                        onClick={() => handleRemoveLocation(loc.id)}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Например: Маркса 7б"
                  onKeyPress={(e) => { if (e.key === 'Enter') handleAddLocation(); }}
                />
                <Button onClick={handleAddLocation}>
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Departments */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Отделы
                </span>
                <div className="flex flex-wrap gap-2">
                  {departments.map((dept) => (
                    <Badge
                      key={dept.id}
                      className={`border flex items-center gap-1 pl-2 pr-1 ${getBadgeColor(dept.name, 'department')}`}
                    >
                      <span>{dept.name}</span>
                      <button
                        onClick={() => handleRemoveDepartment(dept.id)}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="Например: Кухня"
                  onKeyPress={(e) => { if (e.key === 'Enter') handleAddDepartment(); }}
                />
                <Button onClick={handleAddDepartment}>
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employees Section */}
        <Card className="mt-6 max-w-6xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Сотрудники
            </CardTitle>
            <CardDescription>Пригласите сотрудников — они получат email со ссылкой для входа</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Employee Form */}
            <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-[150px]">
                <Label className="text-sm">Имя</Label>
                <Input
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  placeholder="Иван Иванов"
                  className="mt-1"
                />
              </div>
              <div className="flex-1 min-w-[180px]">
                <Label className="text-sm">Email</Label>
                <Input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  placeholder="ivan@example.com"
                  className="mt-1"
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <Label className="text-sm">Должность</Label>
                <Input
                  value={newEmployee.position}
                  onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                  placeholder="Повар"
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddEmployee} className="whitespace-nowrap">
                  <Plus className="w-4 h-4 mr-2" />
                  Пригласить
                </Button>
              </div>
            </div>

            {/* Employees List */}
            <div className="space-y-3">
              {employees.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">
                  Нет добавленных сотрудников
                </p>
              ) : (
                employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">{employee.name}</p>
                          <Badge variant={employee.access_level === 'manager' ? 'default' : 'secondary'}>
                            {employee.access_level === 'manager' ? 'Управляющий' : 'Сотрудник'}
                          </Badge>
                          {!employee.invite_accepted && (
                            <Badge variant="outline" className="text-orange-600 border-orange-300">
                              Не активирован
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{employee.email}</span>
                          {employee.position && (
                            <>
                              <span>•</span>
                              <span>{employee.position}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!employee.invite_accepted && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResendInvitation(employee)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Отправить повторно
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveEmployee(employee.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </MainLayout>
  );
}
