import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import apiClient from '../lib/api-client';
import { useAuth } from '../lib/auth-context';

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Недействительная ссылка. Попросите менеджера отправить новое приглашение.');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают.');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.acceptInvite({ token, password });
      await refreshUser();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Ошибка активации. Возможно, ссылка устарела.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900">RosterDuty</span>
          </div>
          <CardTitle className="text-2xl">Активация аккаунта</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Придумайте пароль для входа</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {!token && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded text-sm">
                Ссылка не содержит токена. Убедитесь, что вы перешли по ссылке из письма.
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Минимум 6 символов"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Повторите пароль</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !token}>
              {isLoading ? 'Активация...' : 'Активировать аккаунт'}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Уже есть аккаунт?{' '}
              <a href="/login" className="text-orange-600 hover:underline">
                Войти
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
