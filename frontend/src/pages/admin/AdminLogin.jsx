import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Mail, Car, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { login } = useAuth();
  const { t } = useI18n();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (useMagicLink) {
        // Magic link flow
        const result = await login(email);
        if (result.ok) {
          setSent(true);
        } else {
          alert(t('admin.login.error'));
        }
      } else {
        // Password login
        const result = await login(email, password);
        if (result.ok) {
          // Redirect to admin panel
          window.location.href = '/admin';
        } else {
          alert('Invalid email or password');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(t('admin.login.error'));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('admin.login.success')}
            </h2>
            <p className="text-gray-600 mb-4">
              Проверьте email {email} и перейдите по ссылке для входа в админ-панель
            </p>
            <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded">
              💡 If the email did not arrive, please check Spam/Promotions folder.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-red-600 p-2 rounded-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div className="bg-slate-800 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {t('admin.login.title')}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {t('admin.login.subtitle')}
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Login Method Toggle */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setUseMagicLink(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                  !useMagicLink ? 'bg-white shadow' : 'text-gray-600'
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => setUseMagicLink(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                  useMagicLink ? 'bg-white shadow' : 'text-gray-600'
                }`}
              >
                Magic Link
              </button>
            </div>

            <div>
              <Label htmlFor="email">{t('admin.login.email_label')}</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('admin.login.email_placeholder')}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {!useMagicLink && (
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required={!useMagicLink}
                />
              </div>
            )}
            <Button
              type="submit"
              disabled={!email || loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 py-3 text-lg font-semibold"
            >
              {loading ? t('admin.login.sending') : t('admin.login.send_link')}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <div className="text-sm text-gray-500">
              <p>Демо доступы:</p>
              <p><strong>admin@cargwin.com</strong> - Администратор</p>
              <p><strong>editor@cargwin.com</strong> - Редактор</p>
              <p><strong>viewer@cargwin.com</strong> - Просмотр</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;