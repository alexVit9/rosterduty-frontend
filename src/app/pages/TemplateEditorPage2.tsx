import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Save, Camera, X, Plus, Trash2, MapPin, Clock, Users, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { MainLayout } from '../components/MainLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import apiClient, { LocationData, DepartmentData } from '../lib/api-client';
import { getBadgeColor } from '../lib/badge-colors';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ItemForm {
  id?: string;
  name: string;
  description: string;
  requires_photo: boolean;
  example_photo_urls: string[];
  uploadingPhoto?: boolean;
}

function SortableItem({ id, item, index, onUpdate, onRemove, onUploadPhoto, onRemovePhoto }: {
  id: string;
  item: ItemForm;
  index: number;
  onUpdate: (i: number, patch: Partial<ItemForm>) => void;
  onRemove: (i: number) => void;
  onUploadPhoto: (i: number, file: File) => void;
  onRemovePhoto: (i: number, pi: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="bg-white border-gray-200">
        <CardContent className="p-3">
          <div className="flex items-stretch gap-3">
            <GripVertical
              className="w-4 h-4 text-gray-300 flex-shrink-0 self-center cursor-grab active:cursor-grabbing"
              {...attributes}
              {...listeners}
            />
            <div className="flex-1 min-w-0 space-y-1">
              <input
                className="w-full text-base font-medium text-gray-900 bg-transparent border-0 border-b border-transparent focus:border-gray-300 focus:outline-none transition-colors placeholder:text-gray-300"
                value={item.name}
                onChange={e => onUpdate(index, { name: e.target.value })}
                placeholder="Что нужно сделать?"
              />
              <textarea
                className="w-full text-sm text-gray-500 bg-transparent border-0 border-b border-transparent focus:border-gray-200 focus:outline-none transition-colors placeholder:text-gray-300 resize-none"
                value={item.description}
                onChange={e => onUpdate(index, { description: e.target.value })}
                placeholder="Описание (необязательно)"
                rows={1}
                onInput={e => {
                  const el = e.currentTarget;
                  el.style.height = 'auto';
                  el.style.height = el.scrollHeight + 'px';
                }}
              />
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {item.example_photo_urls.map((url, pi) => (
                <div key={pi} className="relative">
                  <img src={url} alt="Пример" className="h-12 w-12 object-cover rounded-lg border" />
                  <button type="button" onClick={() => onRemovePhoto(index, pi)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
              {item.example_photo_urls.length < 3 && (
                <label className="h-12 w-12 flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors flex-shrink-0">
                  {item.uploadingPhoto
                    ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    : <><Camera className="w-4 h-4 text-gray-400" /><span className="text-[10px] text-gray-400 mt-0.5">Фото</span></>
                  }
                  <input type="file" accept="image/*" className="hidden" disabled={item.uploadingPhoto}
                    onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      e.target.value = '';
                      onUploadPhoto(index, file);
                    }} />
                </label>
              )}
            </div>
            <div className="flex flex-col items-center justify-between gap-2 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <span className={`text-xs ${!item.requires_photo ? 'font-medium text-blue-600' : 'text-gray-400'}`}>Без фото</span>
                <Switch checked={item.requires_photo} onCheckedChange={v => onUpdate(index, { requires_photo: v })} />
                <span className={`text-xs ${item.requires_photo ? 'font-medium text-blue-600' : 'text-gray-400'}`}>Фото</span>
              </div>
              <button type="button" onClick={() => onRemove(index)} className="hover:opacity-70 transition-opacity">
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TemplateEditorPage2() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [locationId, setLocationId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [recurrenceDayOfWeek, setRecurrenceDayOfWeek] = useState<number>(0);
  const [recurrenceDayOfMonth, setRecurrenceDayOfMonth] = useState<number>(1);
  const [items, setItems] = useState<ItemForm[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const locationName = locationId === 'all' ? 'Все' : (locations.find(l => l.id === locationId)?.name || '');
  const departmentName = departments.find(d => d.id === departmentId)?.name || '';

  const monthlyScrollRef = useRef<HTMLDivElement>(null);
  const scrollMonthly = (dir: 'left' | 'right') => {
    monthlyScrollRef.current?.scrollBy({ left: dir === 'right' ? 140 : -140, behavior: 'smooth' });
  };

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      const restaurant = await apiClient.getRestaurant();
      setLocations(restaurant.locations);
      setDepartments(restaurant.departments);

      if (isEditing && id) {
        const template = await apiClient.getTemplate(id);
        setName(template.name);
        setDescription(template.description || '');
        setLocationId(template.location_id || 'all');
        setDepartmentId(template.department_id || '');
        setTimeFrom(template.time_from || '');
        setTimeTo(template.time_to || '');
        setRecurrenceType((template.recurrence_type as any) || 'daily');
        setRecurrenceDayOfWeek(template.recurrence_day_of_week ?? 0);
        setRecurrenceDayOfMonth(template.recurrence_day_of_month ?? 1);
        setItems(template.items.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          requires_photo: item.requires_photo,
          example_photo_urls: item.example_photo_urls || [],
        })));
      }
    } catch {
      toast.error('Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = (index: number, patch: Partial<ItemForm>) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, ...patch } : item));
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems(prev => {
      const oldIndex = prev.findIndex((_, i) => String(i) === active.id);
      const newIndex = prev.findIndex((_, i) => String(i) === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const addItem = () => {
    setItems(prev => [...prev, { name: '', description: '', requires_photo: false, example_photo_urls: [] }]);
  };

  const uploadExamplePhoto = async (index: number, file: File) => {
    updateItem(index, { uploadingPhoto: true });
    try {
      const { photo_url } = await apiClient.uploadPhoto(file);
      setItems(prev => prev.map((item, i) =>
        i === index
          ? { ...item, example_photo_urls: [...item.example_photo_urls, photo_url], uploadingPhoto: false }
          : item
      ));
    } catch (err: any) {
      toast.error(err?.message || 'Ошибка загрузки фото');
      updateItem(index, { uploadingPhoto: false });
    }
  };

  const removeExamplePhoto = (itemIndex: number, photoIndex: number) => {
    setItems(prev => prev.map((item, i) =>
      i === itemIndex
        ? { ...item, example_photo_urls: item.example_photo_urls.filter((_, pi) => pi !== photoIndex) }
        : item
    ));
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Введите название чек-листа'); return; }
    if (locations.length > 0 && !locationId) { toast.error('Выберите локацию или «Все»'); return; }
    if (items.length === 0) { toast.error('Добавьте хотя бы один пункт'); return; }
    if (items.some(item => !item.name.trim())) { toast.error('Заполните название всех пунктов'); return; }

    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        location_id: locationId === 'all' ? undefined : (locationId || undefined),
        department_id: departmentId || undefined,
        time_from: timeFrom || undefined,
        time_to: timeTo || undefined,
        recurrence_type: recurrenceType,
        recurrence_day_of_week: recurrenceType === 'weekly' ? recurrenceDayOfWeek : undefined,
        recurrence_day_of_month: recurrenceType === 'monthly' ? recurrenceDayOfMonth : undefined,
        items: items.map((item, index) => ({
          id: item.id,
          name: item.name.trim(),
          description: item.description.trim() || undefined,
          requires_photo: item.requires_photo,
          order: index,
          example_photo_urls: item.example_photo_urls.length ? item.example_photo_urls : undefined,
        })),
      };

      if (isEditing && id) {
        await apiClient.updateTemplate(id, payload);
        toast.success('Чек-лист обновлен');
      } else {
        await apiClient.createTemplate(payload as any);
        toast.success('Чек-лист создан');
      }
      navigate('/templates');
    } catch {
      toast.error('Ошибка сохранения');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Title & description */}
        <div className="mb-6">
          <input
            className="w-full text-3xl font-bold text-gray-900 bg-transparent border-0 border-b-2 border-transparent focus:border-gray-300 focus:outline-none mb-2 pb-1 transition-colors placeholder:text-gray-300"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Название чек-листа"
          />
          <textarea
            className="w-full text-base text-gray-700 bg-transparent border-0 border-b border-transparent focus:border-gray-200 focus:outline-none resize-none mb-4 pb-1 transition-colors placeholder:text-gray-300 leading-relaxed"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Описание (необязательно)"
            rows={1}
            onInput={e => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = el.scrollHeight + 'px';
            }}
          />

          {/* Badges row */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Location */}
            <Select value={locationId || 'none'} onValueChange={v => setLocationId(v === 'none' ? '' : v)}>
              <SelectTrigger className="w-auto h-auto border-0 p-0 shadow-none focus:ring-0 bg-transparent [&>svg:last-child]:hidden">
                <SelectValue>
                  {locationName ? (
                    <Badge className={`text-sm px-3 py-1.5 cursor-pointer ${locationId === 'all' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : getBadgeColor(locationName, 'location')}`}>
                      <MapPin className="w-4 h-4 mr-1.5" />{locationName}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-sm px-3 py-1.5 cursor-pointer border-dashed text-gray-400">
                      <MapPin className="w-4 h-4 mr-1.5" />Локация<span className="text-orange-500 ml-0.5">*</span>
                    </Badge>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                {locations.map(loc => <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Department */}
            <Select value={departmentId || 'none'} onValueChange={v => setDepartmentId(v === 'none' ? '' : v)}>
              <SelectTrigger className="w-auto h-auto border-0 p-0 shadow-none focus:ring-0 bg-transparent [&>svg:last-child]:hidden">
                <SelectValue>
                  {departmentName ? (
                    <Badge className={`text-sm px-3 py-1.5 cursor-pointer ${getBadgeColor(departmentName, 'department')}`}>
                      <Users className="w-4 h-4 mr-1.5" />{departmentName}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-sm px-3 py-1.5 cursor-pointer border-dashed text-gray-400">
                      <Users className="w-4 h-4 mr-1.5" />Отдел
                    </Badge>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Без отдела</SelectItem>
                {departments.map(dept => <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Time */}
            <Badge variant="outline" className="text-sm px-3 py-1.5 gap-1.5">
              <Clock className="w-4 h-4" />
              <input
                type="time"
                value={timeFrom}
                onChange={e => setTimeFrom(e.target.value)}
                className="bg-transparent border-0 outline-none w-[46px] text-sm"
              />
              <span>—</span>
              <input
                type="time"
                value={timeTo}
                onChange={e => setTimeTo(e.target.value)}
                className="bg-transparent border-0 outline-none w-[46px] text-sm"
              />
            </Badge>
          </div>

          {/* Recurrence */}
          <div className="mt-4">
            <div className="flex gap-2 items-center flex-wrap">
              {(['daily', 'weekly', 'monthly'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setRecurrenceType(type)}
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                    recurrenceType === type
                      ? 'bg-orange-50 text-orange-700 border-orange-200'
                      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {type === 'daily' ? 'Каждый день' : type === 'weekly' ? 'Раз в неделю' : 'Раз в месяц'}
                </button>
              ))}
              {recurrenceType === 'weekly' && (
                <div className="flex gap-1.5 flex-wrap">
                  {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map((day, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRecurrenceDayOfWeek(i)}
                      className={`w-7 h-7 rounded-full text-xs font-medium border transition-colors ${
                        recurrenceDayOfWeek === i
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}
                    >{day}</button>
                  ))}
                </div>
              )}
              {recurrenceType === 'monthly' && (
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => scrollMonthly('left')}
                    className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 flex-shrink-0 transition-colors">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <div ref={monthlyScrollRef} className="flex gap-1.5 overflow-x-hidden flex-shrink-0" style={{ width: '304px' }}>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setRecurrenceDayOfMonth(day)}
                        className={`w-7 h-7 rounded-full text-xs font-medium border flex-shrink-0 transition-colors ${
                          recurrenceDayOfMonth === day
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                      >{day}</button>
                    ))}
                  </div>
                  <button type="button" onClick={() => scrollMonthly('right')}
                    className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 flex-shrink-0 transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((_, i) => String(i))} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {items.map((item, index) => (
                <SortableItem
                  key={index}
                  id={String(index)}
                  item={item}
                  index={index}
                  onUpdate={updateItem}
                  onRemove={removeItem}
                  onUploadPhoto={uploadExamplePhoto}
                  onRemovePhoto={removeExamplePhoto}
                />
              ))}

            </div>
          </SortableContext>
        </DndContext>

        {/* Add item */}
        <button
          type="button"
          onClick={addItem}
          className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors mt-3"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">Добавить пункт</span>
        </button>
      </main>
    </MainLayout>
  );
}
