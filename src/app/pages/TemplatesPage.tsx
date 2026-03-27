import { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Plus, MapPin, Users, Pencil, Trash2, CalendarDays } from 'lucide-react';
import { MainLayout } from '../components/MainLayout';
import { getBadgeColor } from '../lib/badge-colors';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import apiClient, { TemplateData, LocationData, DepartmentData } from '../lib/api-client';
import { useAuth } from '../lib/auth-context';
import { toast } from 'sonner';

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('all');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      loadData();
    }
  }, [authLoading, user]);

  const loadData = async () => {
    try {
      const [templatesData, restaurantData] = await Promise.all([
        apiClient.getTemplates(),
        apiClient.getRestaurant(),
      ]);
      setTemplates(templatesData);
      setLocations(restaurantData.locations);
      setDepartments(restaurantData.departments);
    } catch (err) {
      toast.error('Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;
    try {
      await apiClient.deleteTemplate(templateToDelete);
      setTemplates(prev => prev.filter(t => t.id !== templateToDelete));
      toast.success('Шаблон удален');
    } catch (err) {
      toast.error('Ошибка удаления шаблона');
    } finally {
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const getLocationName = (id?: string) => locations.find(l => l.id === id)?.name;
  const getDepartmentName = (id?: string) => departments.find(d => d.id === id)?.name;

  const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const getRecurrenceLabel = (t: TemplateData) => {
    if (!t.recurrence_type) return null;
    if (t.recurrence_type === 'daily') return 'Каждый день';
    if (t.recurrence_type === 'weekly') return `Каждую ${WEEK_DAYS[t.recurrence_day_of_week ?? 0]}`;
    if (t.recurrence_type === 'monthly') return `${t.recurrence_day_of_month}-го числа`;
    return null;
  };

  const filteredTemplates = templates.filter(t => {
    const locMatch = selectedLocationId === 'all' || t.location_id === selectedLocationId;
    const deptMatch = selectedDepartmentId === 'all' || t.department_id === selectedDepartmentId;
    return locMatch && deptMatch;
  });

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

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <MainLayout>
      <header className="bg-white border-b">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Управление чек-листами</h1>
              <p className="text-sm text-gray-500 mt-1">Создавайте шаблоны чек-листов, настраивайте расписание и задания для сотрудников</p>
            </div>
            <Link to="/templates/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Создать чек-лист
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="px-8 py-8">
        {templates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">Нет созданных шаблонов</p>
              <Link to="/templates/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Создать первый чек-лист
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Filters */}
            {(locations.length > 0 || departments.length > 0) && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    {locations.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Локация
                        </label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge
                            className={`cursor-pointer border ${
                              selectedLocationId === 'all'
                                ? 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedLocationId('all')}
                          >
                            Все
                          </Badge>
                          {locations.map(loc => (
                            <Badge
                              key={loc.id}
                              className={`cursor-pointer border ${
                                selectedLocationId === loc.id
                                  ? getBadgeColor(loc.name, 'location') + ' hover:opacity-80'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                              onClick={() => setSelectedLocationId(loc.id)}
                            >
                              {loc.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {departments.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Отдел
                        </label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge
                            className={`cursor-pointer border ${
                              selectedDepartmentId === 'all'
                                ? 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedDepartmentId('all')}
                          >
                            Все
                          </Badge>
                          {departments.map(dept => (
                            <Badge
                              key={dept.id}
                              className={`cursor-pointer border ${
                                selectedDepartmentId === dept.id
                                  ? getBadgeColor(dept.name, 'department') + ' hover:opacity-80'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                              onClick={() => setSelectedDepartmentId(dept.id)}
                            >
                              {dept.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Templates List */}
            <div className="space-y-4">
              {filteredTemplates.map((template) => {
                const locationName = getLocationName(template.location_id);
                const departmentName = getDepartmentName(template.department_id);

                const recurrenceLabel = getRecurrenceLabel(template);
                return (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-sm transition-all border-gray-200 hover:border-gray-300"
                    onClick={() => navigate(`/fill?date=${today}&template=${template.id}`)}
                  >
                    <CardContent className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Name */}
                        <span className="font-medium text-sm text-gray-900 flex-shrink-0">{template.name}</span>

                        {/* Tags inline */}
                        <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
                          {/* "Все" badge — when template has no location */}
                          {!template.location_id && (
                            <Badge variant="outline" className="text-xs text-gray-500 border-gray-200 flex items-center gap-0.5 flex-shrink-0">
                              <MapPin className="w-3 h-3" />Все
                            </Badge>
                          )}
                          {locationName && (
                            <Badge className={`text-xs flex items-center gap-0.5 flex-shrink-0 ${getBadgeColor(locationName, 'location')}`}>
                              <MapPin className="w-3 h-3" />{locationName}
                            </Badge>
                          )}
                          {departmentName && (
                            <Badge className={`text-xs flex items-center gap-0.5 flex-shrink-0 ${getBadgeColor(departmentName, 'department')}`}>
                              <Users className="w-3 h-3" />{departmentName}
                            </Badge>
                          )}
                          {recurrenceLabel && (
                            <Badge variant="outline" className="text-xs flex items-center gap-0.5 flex-shrink-0 text-gray-500 border-gray-200">
                              <CalendarDays className="w-3 h-3" />{recurrenceLabel}
                            </Badge>
                          )}
                        </div>

                        {/* Edit/Delete buttons */}
                        <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
                          <Link to={`/templates/edit/${template.id}`} onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-gray-100">
                              <Pencil className="w-3.5 h-3.5 text-gray-400" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTemplateToDelete(template.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить шаблон?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Шаблон и вся история его выполнения будут удалены навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
