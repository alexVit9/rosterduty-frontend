import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ChevronLeft, ChevronRight, FileText, MapPin, Users, Square, Clock, CalendarDays, Check } from 'lucide-react';
import { MainLayout } from '../components/MainLayout';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isSameMonth, startOfWeek, endOfWeek } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import apiClient, { CompletedChecklistData, LocationData, DepartmentData, TemplateData } from '../lib/api-client';
import { useAuth } from '../lib/auth-context';
import { getBadgeColor } from '../lib/badge-colors';
import { toast } from 'sonner';


export default function HistoryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [checklists, setChecklists] = useState<CompletedChecklistData[]>([]);
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedChecklist, setSelectedChecklist] = useState<CompletedChecklistData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [monthSummary, setMonthSummary] = useState<Record<string, { total: number; all_done: number }>>({});

  useEffect(() => {
    if (!authLoading && user) loadData();
  }, [authLoading, user]);

  useEffect(() => {
    if (!authLoading && user) loadHistoryForDate();
  }, [selectedDate, selectedLocationId, authLoading, user]);

  useEffect(() => {
    if (!authLoading && user) loadMonthSummary();
  }, [currentMonth, selectedLocationId, authLoading, user]);

  const loadData = async () => {
    try {
      const [restaurantData, templatesData] = await Promise.all([
        apiClient.getRestaurant(),
        apiClient.getTemplates(),
      ]);
      setLocations(restaurantData.locations);
      setDepartments(restaurantData.departments);
      setTemplates(templatesData);
    } catch {
      toast.error('Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistoryForDate = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const locationId = selectedLocationId !== 'all' ? selectedLocationId : undefined;
      const data = await apiClient.getChecklistHistory(dateStr, locationId);
      setChecklists(data);
      setSelectedChecklist(null);
      setSelectedTemplate(null);
    } catch {
      console.error('Failed to load history');
    }
  };

  const loadMonthSummary = async () => {
    try {
      const locationId = selectedLocationId !== 'all' ? selectedLocationId : undefined;
      const data = await apiClient.getMonthSummary(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        locationId,
      );
      const map: Record<string, { total: number; all_done: number }> = {};
      data.forEach(d => { map[d.date] = { total: d.total, all_done: d.all_done }; });
      setMonthSummary(map);
    } catch {
      console.error('Failed to load month summary');
    }
  };

  const getLocationName = (id?: string | null) => locations.find(l => l.id === id)?.name;
  const getDepartmentName = (id?: string | null) => departments.find(d => d.id === id)?.name;

  const completedTemplateIds = new Set(checklists.map(c => c.template_id));
  const unfilledTemplates = templates.filter(t => {
    if (completedTemplateIds.has(t.id)) return false;
    if (selectedLocationId !== 'all' && t.location_id !== selectedLocationId) return false;
    return true;
  });

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <MainLayout>
      <header className="bg-white border-b">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">История проверок</h1>
          <p className="text-sm text-gray-500 mt-1">Просматривайте выполненные чек-листы, фильтруйте по дате и локации</p>
        </div>
      </header>

      <main className="px-8 py-8">
        <div className="grid grid-cols-[280px_1fr] gap-6 items-start">

          {/* Left: Location Filter + Calendar */}
          <div className="flex flex-col gap-4">
            {locations.length > 0 && (
              <Card className="flex-shrink-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-gray-900">Локации</span>
                    <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все</SelectItem>
                        {locations.map(loc => (
                          <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Calendar */}
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="h-8 w-8 p-0">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {format(currentMonth, 'LLLL yyyy', { locale: ru })}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="h-8 w-8 p-0">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-0.5 mb-1">
                  {weekDays.map(day => (
                    <div key={day} className="text-center text-[10px] font-medium text-gray-500 py-0.5">{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    const isSelected = isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isToday = isSameDay(day, new Date());
                    const dayKey = format(day, 'yyyy-MM-dd');
                    const summary = monthSummary[dayKey];
                    const isFuture = !isSameDay(day, new Date()) && day > new Date();
                    const hasSummary = isCurrentMonth && summary && summary.total > 0;
                    const circleAllDone = hasSummary && summary!.all_done === summary!.total;
                    const circlePartial = hasSummary && !circleAllDone;

                    return (
                      <div key={index} className="flex flex-col items-center p-0.5">
                        <button
                          onClick={() => { setSelectedDate(day); setSelectedChecklist(null); setSelectedTemplate(null); }}
                          className={`w-7 h-7 rounded-full text-xs font-medium transition-all flex items-center justify-center
                            ${!isCurrentMonth ? 'text-gray-300' : ''}
                            ${isSelected
                              ? 'bg-blue-600 text-white'
                              : circleAllDone
                                ? 'ring-2 ring-green-400 text-green-700 font-semibold hover:ring-green-500'
                                : circlePartial
                                  ? 'ring-2 ring-red-400 text-red-600 hover:ring-red-500'
                                  : isToday
                                    ? 'bg-blue-100 text-blue-900'
                                    : isCurrentMonth && !isFuture
                                      ? 'hover:bg-gray-100 text-gray-700'
                                      : isCurrentMonth
                                        ? 'text-gray-500'
                                        : ''
                            }
                          `}
                        >
                          {format(day, 'd')}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Checklist list */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">
                {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              {checklists.length > 0 && (
                <div className="space-y-3 mb-4">
                  {checklists.map(checklist => {
                    const isFullyDone = checklist.completed_items === checklist.total_items;
                    const isActive = selectedChecklist?.id === checklist.id;
                    const locName = getLocationName(checklist.location_id);
                    const deptName = getDepartmentName(checklist.department_id);
                    return (
                      <Card
                        key={checklist.id}
                        className={`cursor-pointer transition-all border-2 ${
                          isActive ? 'border-blue-400 shadow-md' :
                          isFullyDone ? 'bg-green-50 border-green-200 hover:border-green-300' :
                          'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                        onClick={async () => {
                          try {
                            const details = await apiClient.getChecklistDetails(checklist.id);
                            setSelectedChecklist(details);
                            setSelectedTemplate(null);
                          } catch {
                            toast.error('Ошибка загрузки деталей');
                          }
                        }}
                      >
                        <div className="px-4 py-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className={`font-medium text-sm truncate flex-1 min-w-0 ${isFullyDone ? 'text-green-900' : 'text-gray-900'}`}>
                              {checklist.template_name}
                            </p>
                            {locName ? (
                              <Badge className={`text-xs px-1.5 py-0.5 flex-shrink-0 ${getBadgeColor(locName, 'location')}`}>
                                <MapPin className="w-2.5 h-2.5 mr-0.5" />{locName}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs px-1.5 py-0.5 flex-shrink-0 text-gray-500 border-gray-300">
                                <MapPin className="w-2.5 h-2.5 mr-0.5" />Все
                              </Badge>
                            )}
                            {deptName && (
                              <Badge className={`text-xs px-1.5 py-0.5 flex-shrink-0 ${getBadgeColor(deptName, 'department')}`}>
                                <Users className="w-2.5 h-2.5 mr-0.5" />{deptName}
                              </Badge>
                            )}
                            <Badge className={`flex-shrink-0 text-xs ${isFullyDone ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'}`}>
                              {checklist.completed_items}/{checklist.total_items}
                            </Badge>
                          </div>
                          {checklist.completed_by_name && (
                            <p className={`text-xs mt-1 ${isFullyDone ? 'text-green-600' : 'text-gray-400'}`}>
                              {checklist.completed_by_name}
                            </p>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              {unfilledTemplates.length > 0 && (
                <div className="space-y-3">
                  {unfilledTemplates.map(template => {
                    const locName = getLocationName(template.location_id);
                    const deptName = getDepartmentName(template.department_id);
                    return (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-all border-2 ${
                          selectedTemplate?.id === template.id
                            ? 'border-blue-400 shadow-md'
                            : 'border-orange-200 bg-orange-50/30 hover:border-orange-300 hover:shadow-sm'
                        }`}
                        onClick={() => { setSelectedTemplate(template); setSelectedChecklist(null); }}
                      >
                        <div className="px-4 py-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate flex-1 min-w-0">{template.name}</p>
                            {locName ? (
                              <Badge className={`text-xs px-1.5 py-0.5 flex-shrink-0 ${getBadgeColor(locName, 'location')}`}>
                                <MapPin className="w-2.5 h-2.5 mr-0.5" />{locName}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs px-1.5 py-0.5 flex-shrink-0 text-gray-500 border-gray-300">
                                <MapPin className="w-2.5 h-2.5 mr-0.5" />Все
                              </Badge>
                            )}
                            {deptName && (
                              <Badge className={`text-xs px-1.5 py-0.5 flex-shrink-0 ${getBadgeColor(deptName, 'department')}`}>
                                <Users className="w-2.5 h-2.5 mr-0.5" />{deptName}
                              </Badge>
                            )}
                            <Badge variant="outline" className="border-orange-600 text-orange-600 flex-shrink-0 text-xs">
                              0/{template.items.length}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              {checklists.length === 0 && unfilledTemplates.length === 0 && (
                <div className="py-12 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-base font-medium text-gray-900 mb-1">Нет чек-листов</h3>
                  <p className="text-sm text-gray-500 mb-3">На эту дату нет ни заполненных, ни запланированных чек-листов</p>
                  <Link to="/templates"><Button size="sm">Создать чек-лист</Button></Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Unfilled Template Detail */}
        {selectedTemplate && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl mb-2">{selectedTemplate.name}</CardTitle>
                  {selectedTemplate.description && (
                    <p className="text-sm text-gray-500 mb-2">{selectedTemplate.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.location_id && getLocationName(selectedTemplate.location_id) && (
                      <Badge className={`text-sm px-3 py-1 ${getBadgeColor(getLocationName(selectedTemplate.location_id)!, 'location')}`}>
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        {getLocationName(selectedTemplate.location_id)}
                      </Badge>
                    )}
                    {selectedTemplate.department_id && getDepartmentName(selectedTemplate.department_id) && (
                      <Badge className={`text-sm px-3 py-1 ${getBadgeColor(getDepartmentName(selectedTemplate.department_id)!, 'department')}`}>
                        <Users className="w-3.5 h-3.5 mr-1" />
                        {getDepartmentName(selectedTemplate.department_id)}
                      </Badge>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="border-orange-600 text-orange-600 flex-shrink-0">
                  0/{selectedTemplate.items.length} выполнено
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedTemplate.items.map(item => (
                  <div key={item.id} className="p-4 rounded-lg border bg-white border-gray-200 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      {item.description && (
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      )}
                    </div>
                    <Square className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completed Checklist Detail — appears below the grid when a card is clicked */}
        {selectedChecklist && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <CardTitle className="text-xl">{selectedChecklist.template_name}</CardTitle>
                    {selectedChecklist.completed_by_name && (
                      <span className="text-sm text-gray-500 font-normal">· {selectedChecklist.completed_by_name}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedChecklist.location_id && getLocationName(selectedChecklist.location_id) && (
                      <Badge className={`text-sm px-2.5 py-1 ${getBadgeColor(getLocationName(selectedChecklist.location_id)!, 'location')}`}>
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        {getLocationName(selectedChecklist.location_id)}
                      </Badge>
                    )}
                    {selectedChecklist.department_id && getDepartmentName(selectedChecklist.department_id) && (
                      <Badge className={`text-sm px-2.5 py-1 ${getBadgeColor(getDepartmentName(selectedChecklist.department_id)!, 'department')}`}>
                        <Users className="w-3.5 h-3.5 mr-1" />
                        {getDepartmentName(selectedChecklist.department_id)}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-sm px-2.5 py-1">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {format(new Date(selectedChecklist.created_at), 'HH:mm', { locale: ru })}
                    </Badge>
                    <Badge variant="outline" className="text-sm px-2.5 py-1">
                      <CalendarDays className="w-3.5 h-3.5 mr-1" />
                      {format(new Date(selectedChecklist.created_at), 'd MMMM yyyy', { locale: ru })}
                    </Badge>
                  </div>
                </div>
                <Badge className={`flex-shrink-0 mt-1 ${selectedChecklist.completed_items === selectedChecklist.total_items ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'}`}>
                  {selectedChecklist.completed_items}/{selectedChecklist.total_items} выполнено
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedChecklist.items.map(item => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border flex items-start justify-between gap-4 ${
                      item.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex-1">
                      <p className={`font-medium ${item.completed ? 'text-green-900' : 'text-gray-900'}`}>
                        {item.name}
                      </p>
                      {item.comment && (
                        <p className="text-sm text-gray-600 mt-1">{item.comment}</p>
                      )}
                      {item.photo_url && (
                        <img src={item.photo_url} alt="Фото" className="w-32 h-32 object-cover rounded-lg border border-gray-200 mt-2" />
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {item.completed ? (
                        <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 border-2 border-gray-300 rounded" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </MainLayout>
  );
}
