import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router';
import { ClipboardList, CheckSquare, Users, Clock, CalendarDays } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { MainLayout } from '../components/MainLayout';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import { useAuth } from '../lib/auth-context';
import apiClient, { DashboardLocationGroup } from '../lib/api-client';
import { getBadgeColor } from '../lib/badge-colors';

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function getRecurrenceLabel(recurrence_type?: string, recurrence_day_of_week?: number, recurrence_day_of_month?: number) {
  if (!recurrence_type) return null;
  if (recurrence_type === 'daily') return 'Каждый день';
  if (recurrence_type === 'weekly') return `Каждую ${WEEK_DAYS[recurrence_day_of_week ?? 0]}`;
  if (recurrence_type === 'monthly') return `${recurrence_day_of_month}-го числа`;
  return null;
}

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [locationGroups, setLocationGroups] = useState<DashboardLocationGroup[]>([]);
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!authLoading && user) {
      loadDashboard();
    }
  }, [authLoading, user]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboard = async () => {
    try {
      const [data, restaurant] = await Promise.all([
        apiClient.getDashboardToday(),
        apiClient.getRestaurant(),
      ]);
      setLocationGroups(data);
      setRestaurantName(restaurant.name);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) { window.location.replace('/landing.html'); return null; }

  const isSingleGroup = locationGroups.length === 1;

  return (
    <MainLayout>
      <header className="bg-white border-b">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Чек-листы на сегодня</h1>
              <p className="text-sm text-gray-500 mt-1">
                {format(currentTime, 'd MMMM yyyy, HH:mm', { locale: ru })}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : locationGroups.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">Нет чек-листов на сегодня</p>
              <Link
                to="/templates/new"
                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm font-medium"
              >
                Создать первый чек-лист
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {locationGroups.map((group) => (
              <div key={group.location_name}>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {isSingleGroup ? restaurantName || group.location_name : group.location_name}
                </h2>

                {group.templates.length === 0 ? (
                  <div className="bg-white rounded-lg border p-8 text-center">
                    <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Нет чек-листов для этой локации</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {group.templates.map((template) => {
                      const progressPercent = template.total_items > 0
                        ? Math.round((template.completed_items / template.total_items) * 100)
                        : 0;
                      const recurrenceLabel = getRecurrenceLabel(
                        template.recurrence_type,
                        template.recurrence_day_of_week,
                        template.recurrence_day_of_month,
                      );

                      const isTimeExpired = !template.is_completed && !!template.time_to && (() => {
                        const [h, m] = template.time_to.split(':').map(Number);
                        const expiry = new Date(currentTime);
                        expiry.setHours(h, m, 0, 0);
                        return currentTime > expiry;
                      })();

                      return (
                        <Link
                          key={`${template.id}-${group.location_name}`}
                          to={`/fill?date=${today}&template=${template.id}`}
                        >
                          <div className={`flex items-center gap-3 px-4 py-3 bg-white rounded-xl border transition-all hover:shadow-sm cursor-pointer ${
                            template.is_completed
                              ? 'border-green-200 bg-green-50 hover:border-green-300'
                              : isTimeExpired
                                ? 'border-red-200 bg-red-50 hover:border-red-300'
                                : 'border-gray-200 hover:border-orange-200'
                          }`}>
                            {/* Status icon */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              template.is_completed ? 'bg-green-500' : isTimeExpired ? 'bg-red-100' : 'bg-gray-100'
                            }`}>
                              {template.is_completed
                                ? <CheckSquare className="w-4 h-4 text-white" />
                                : <ClipboardList className={`w-4 h-4 ${isTimeExpired ? 'text-red-400' : 'text-gray-400'}`} />
                              }
                            </div>

                            {/* Name */}
                            <div className="flex-1 min-w-0">
                              <span className={`font-semibold text-sm ${
                                template.is_completed ? 'text-green-900' : isTimeExpired ? 'text-red-800' : 'text-gray-900'
                              }`}>
                                {template.name}
                              </span>
                              {template.completed_by_name && template.is_completed && (
                                <p className="text-xs text-green-600 mt-0.5">{template.completed_by_name}</p>
                              )}
                            </div>

                            {/* Tags — right side */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {template.department_name && (
                                <Badge className={`text-xs flex items-center gap-0.5 ${getBadgeColor(template.department_name, 'department')}`}>
                                  <Users className="w-3 h-3" />{template.department_name}
                                </Badge>
                              )}
                              {template.time_from && template.time_to && (
                                <Badge variant="outline" className={`text-xs flex items-center gap-0.5 border-gray-200 ${
                                  isTimeExpired ? 'text-red-500 border-red-300 bg-red-50' : 'text-gray-500'
                                }`}>
                                  <Clock className="w-3 h-3" />{template.time_from}–{template.time_to}
                                </Badge>
                              )}
                              {recurrenceLabel && (
                                <Badge variant="outline" className="text-xs flex items-center gap-0.5 text-gray-500 border-gray-200">
                                  <CalendarDays className="w-3 h-3" />{recurrenceLabel}
                                </Badge>
                              )}
                            </div>

                            {/* Progress */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="w-16 bg-gray-200 rounded-full h-1.5 hidden sm:block">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    template.is_completed ? 'bg-green-500' : isTimeExpired ? 'bg-red-400' : 'bg-orange-400'
                                  }`}
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                              <span className={`text-xs font-medium ${
                                template.is_completed ? 'text-green-700' : isTimeExpired ? 'text-red-500' : 'text-gray-500'
                              }`}>
                                {template.completed_items}/{template.total_items}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </MainLayout>
  );
}
