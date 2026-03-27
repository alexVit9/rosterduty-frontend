import { ArrowLeft, CreditCard, Check, Zap, Building2, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { MainLayout } from '../components/MainLayout';
import { Badge } from '../components/ui/badge';
import { useState } from 'react';
import { toast } from 'sonner';
import apiClient from '../lib/api-client';

export default function SubscriptionPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (planName: string) => {
    setIsLoading(true);
    try {
      await apiClient.subscriptionRequest({
        plan: planName.toLowerCase(),
        billing: billingPeriod,
      });
      setSelectedPlan(planName);
      toast.success('Мы приняли вашу заявку!', {
        description: 'С вами свяжется менеджер в ближайшее время.',
        duration: 5000,
      });
    } catch (err) {
      toast.error('Ошибка отправки заявки. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <header className="bg-white border-b">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Подписка</h1>
              <p className="text-sm text-gray-500 mt-1">Управляйте тарифным планом и выберите подходящие условия</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Billing Period Toggle */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-4 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Ежемесячно
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all relative ${
                  billingPeriod === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Ежегодно
                <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                  -20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <Card className="border-2 hover:border-gray-200 transition-all">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
                <CardTitle className="text-xl">Бесплатный</CardTitle>
                <CardDescription className="mt-2">Для тестирования</CardDescription>
                <div className="mt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">€0</span>
                    <span className="text-gray-500">/{billingPeriod === 'monthly' ? 'мес' : 'год'}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  {['До 3 шаблонов чек-листов', 'Шаблоны чек-листов', 'До 1 локации', 'До 5 сотрудников', 'Хранение истории за 30 дней', 'Email поддержка'].map(f => (
                    <div key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full" disabled>
                  Текущий план
                </Button>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="border-2 border-blue-500 hover:border-blue-600 transition-all relative shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-4 py-1">Популярный</Badge>
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl">Профессиональный</CardTitle>
                <CardDescription className="mt-2">Для сетей и средних ресторанов</CardDescription>
                <div className="mt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      {billingPeriod === 'monthly' ? '€9' : '€86'}
                    </span>
                    <span className="text-gray-500">/{billingPeriod === 'monthly' ? 'мес' : 'год'}</span>
                  </div>
                  {billingPeriod === 'yearly' && (
                    <p className="text-xs text-green-600 mt-1">Экономия €22 в год</p>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  {['Неограниченное количество чек-листов', 'Шаблоны чек-листов', 'До 5 локаций', 'До 40 сотрудников', 'Хранение истории за 1 год', 'Фото-подтверждения задач', 'Аналитика и отчеты'].map(f => (
                    <div key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  onClick={() => handleSubscribe('Professional')}
                  disabled={isLoading || selectedPlan === 'Professional'}
                >
                  {selectedPlan === 'Professional' ? 'Заявка принята' : 'Выбрать план'}
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-2 hover:border-purple-200 transition-all">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl">Корпоративный</CardTitle>
                <CardDescription className="mt-2">Для крупных сетей</CardDescription>
                <div className="mt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      {billingPeriod === 'monthly' ? '€49' : '€470'}
                    </span>
                    <span className="text-gray-500">/{billingPeriod === 'monthly' ? 'мес' : 'год'}</span>
                  </div>
                  {billingPeriod === 'yearly' && (
                    <p className="text-xs text-green-600 mt-1">Экономия €118 в год</p>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  {['Неограниченное количество чек-листов', 'Шаблоны чек-листов', 'Неограниченное количество локаций', 'Неограниченное количество сотрудников', 'Неограниченное хранение истории', 'Фото-подтверждения задач', 'Расширенная аналитика', 'API интеграция'].map(f => (
                    <div key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  onClick={() => handleSubscribe('Enterprise')}
                  disabled={isLoading || selectedPlan === 'Enterprise'}
                >
                  {selectedPlan === 'Enterprise' ? 'Заявка принята' : 'Выбрать план'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </MainLayout>
  );
}
