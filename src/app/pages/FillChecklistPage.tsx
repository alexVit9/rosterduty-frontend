import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, MapPin, Clock, Users, Camera, Pencil } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { MainLayout } from '../components/MainLayout';
import apiClient, { TemplateData } from '../lib/api-client';
import { getBadgeColor } from '../lib/badge-colors';
import { toast } from 'sonner';
import { useAuth } from '../lib/auth-context';
import { Navigate } from 'react-router';

export default function FillChecklistPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  const templateId = searchParams.get('template') || '';
  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationName, setLocationName] = useState('');
  const [departmentName, setDepartmentName] = useState('');

  useEffect(() => {
    if (!authLoading && user && templateId) {
      loadTemplate();
    }
  }, [authLoading, user, templateId]);

  const loadTemplate = async () => {
    try {
      const [templateData, restaurantData] = await Promise.all([
        apiClient.getTemplate(templateId),
        apiClient.getRestaurant(),
      ]);
      setTemplate(templateData);

      if (templateData.location_id) {
        const loc = restaurantData.locations.find(l => l.id === templateData.location_id);
        if (loc) setLocationName(loc.name);
      }
      if (templateData.department_id) {
        const dept = restaurantData.departments.find(d => d.id === templateData.department_id);
        if (dept) setDepartmentName(dept.name);
      }
    } catch (err) {
      toast.error('Ошибка загрузки чек-листа');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <MainLayout>
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !template ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Чек-лист не найден</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
                <Button variant="outline" size="sm" onClick={() => navigate(`/templates/edit/${template.id}`)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Редактировать
                </Button>
              </div>
              {template.description && (
                <p className="text-gray-700 text-base leading-relaxed mb-3">{template.description}</p>
              )}
              <div className="flex flex-wrap gap-3">
                {locationName && (
                  <Badge className={`text-sm px-3 py-1.5 ${getBadgeColor(locationName, 'location')}`}>
                    <MapPin className="w-4 h-4 mr-1.5" />
                    {locationName}
                  </Badge>
                )}
                {departmentName && (
                  <Badge className={`text-sm px-3 py-1.5 ${getBadgeColor(departmentName, 'department')}`}>
                    <Users className="w-4 h-4 mr-1.5" />
                    {departmentName}
                  </Badge>
                )}
                {template.time_from && template.time_to && (
                  <Badge variant="outline" className="text-sm px-3 py-1.5">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {template.time_from} - {template.time_to}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {template.items.map((item, index) => (
                <Card key={item.id} className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-stretch gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-medium text-gray-900">{item.name}</p>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        )}
                      </div>
                      {item.example_photo_urls && item.example_photo_urls.length > 0 && (
                        <div className="flex gap-2 flex-shrink-0">
                          {item.example_photo_urls.map((url, i) => (
                            <img key={i} src={url} alt="Пример" className="h-full max-h-16 w-auto object-cover rounded-lg border" />
                          ))}
                        </div>
                      )}
                      {item.requires_photo ? (
                        <Camera className="w-9 h-9 text-gray-400 flex-shrink-0 self-center stroke-[1]" />
                      ) : (
                        <div className="w-9 h-9 border border-gray-300 rounded flex items-center justify-center flex-shrink-0 self-center">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="3 2.5" strokeLinecap="round" className="w-5 h-5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </MainLayout>
  );
}
