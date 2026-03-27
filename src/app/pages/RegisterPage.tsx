import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../lib/auth-context';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { CheckSquare, ClipboardList, Users, TrendingUp } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    restaurant_name: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(formData);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-orange-500 to-orange-700 text-white relative overflow-hidden">
        {/* Decorative bg circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-12 w-72 h-72 bg-white/10 rounded-full pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/25 rounded-xl flex items-center justify-center">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">RosterDuty</span>
        </div>

        {/* Main content */}
        <div className="relative">
          <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
            Начните работу<br />с RosterDuty
          </h2>
          <p className="text-orange-100 text-lg mb-10 leading-relaxed">
            Зарегистрируйтесь бесплатно и начните автоматизировать проверки в вашем ресторане
          </p>
          <div className="space-y-4">
            {[
              { icon: ClipboardList, text: 'Умные чек-листы с фотоподтверждением' },
              { icon: Users, text: 'Управление командой и локациями' },
              { icon: TrendingUp, text: 'История выполнения и аналитика' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-orange-50 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-orange-200 text-sm">© 2025 RosterDuty · CY/EU</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-white p-8 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">RosterDuty</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-1">Создать аккаунт</h1>
          <p className="text-gray-500 mb-8">Заполните данные для регистрации</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Ваше имя</Label>
              <Input
                id="name"
                type="text"
                placeholder="Иван Иванов"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="restaurant_name" className="text-sm font-medium text-gray-700">Название ресторана</Label>
              <Input
                id="restaurant_name"
                type="text"
                placeholder="Мой ресторан"
                value={formData.restaurant_name}
                onChange={(e) => setFormData({ ...formData, restaurant_name: e.target.value })}
                required
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Регистрация...
                </span>
              ) : 'Зарегистрироваться'}
            </Button>
            <p className="text-center text-sm text-gray-500">
              Уже есть аккаунт?{' '}
              <a href="/login" className="text-orange-600 hover:text-orange-700 font-medium">
                Войти
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
