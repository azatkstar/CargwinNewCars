import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BACKEND_URL}/api/admin/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      setSettings(data || getDefaultSettings());
    } catch (err) {
      console.error('Load settings error:', err);
      setSettings(getDefaultSettings());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSettings = () => ({
    default_region: 'California',
    default_tax_rate: 0.0925,
    default_term_months: 36,
    default_annual_mileage: 10000,
    seo_templates: {
      title_template: '{year} {brand} {model} {trim} lease – ${payment}/mo, ${driveoff} down | Hunter.Lease {region}',
      meta_template: 'Лизинг {year} {brand} {model} от ${payment} в месяц...',
      slug_template: '{year}-{brand}-{model}-lease-{payment}mo'
    },
    auto_sync: {
      enabled: true,
      recalc_on_program_update: true,
      log_retention_days: 90
    },
    global_disclaimer: 'All payments are estimates...',
    contact_telegram: 'https://t.me/SalesAzatAuto',
    contact_email: 'info@hunter.lease'
  });

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BACKEND_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Save failed');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (path, value) => {
    const parts = path.split('.');
    const newSettings = { ...settings };
    
    if (parts.length === 1) {
      newSettings[parts[0]] = value;
    } else if (parts.length === 2) {
      newSettings[parts[0]] = { ...newSettings[parts[0]], [parts[1]]: value };
    }
    
    setSettings(newSettings);
  };

  if (loading) {
    return <div className="text-center py-12">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">System Settings</h1>
          <p className="text-gray-600">Global configuration for Hunter.Lease</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Defaults */}
      <Card>
        <CardHeader>
          <CardTitle>Defaults</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Default Region</Label>
              <Input
                value={settings?.default_region || ''}
                onChange={(e) => updateField('default_region', e.target.value)}
              />
            </div>

            <div>
              <Label>Default Tax Rate (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={((settings?.default_tax_rate || 0) * 100).toFixed(2)}
                onChange={(e) => updateField('default_tax_rate', parseFloat(e.target.value) / 100)}
              />
            </div>

            <div>
              <Label>Default Term (months)</Label>
              <Input
                type="number"
                value={settings?.default_term_months || 36}
                onChange={(e) => updateField('default_term_months', parseInt(e.target.value))}
              />
            </div>

            <div>
              <Label>Default Mileage (annual)</Label>
              <Input
                type="number"
                value={settings?.default_annual_mileage || 10000}
                onChange={(e) => updateField('default_annual_mileage', parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Templates */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Title Template</Label>
            <Input
              value={settings?.seo_templates?.title_template || ''}
              onChange={(e) => updateField('seo_templates.title_template', e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Variables: {'{year}'}, {'{brand}'}, {'{model}'}, {'{trim}'}, {'${payment}'}, {'${driveoff}'}, {'{region}'}
            </p>
          </div>

          <div>
            <Label>Meta Description Template</Label>
            <Textarea
              value={settings?.seo_templates?.meta_template || ''}
              onChange={(e) => updateField('seo_templates.meta_template', e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label>Slug Template</Label>
            <Input
              value={settings?.seo_templates?.slug_template || ''}
              onChange={(e) => updateField('seo_templates.slug_template', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* AutoSync */}
      <Card>
        <CardHeader>
          <CardTitle>AutoSync Engine</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enabled</Label>
            <Switch
              checked={settings?.auto_sync?.enabled || false}
              onCheckedChange={(checked) => updateField('auto_sync.enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Recalc on Program Update</Label>
            <Switch
              checked={settings?.auto_sync?.recalc_on_program_update || false}
              onCheckedChange={(checked) => updateField('auto_sync.recalc_on_program_update', checked)}
            />
          </div>

          <div>
            <Label>Log Retention (days)</Label>
            <Input
              type="number"
              value={settings?.auto_sync?.log_retention_days || 90}
              onChange={(e) => updateField('auto_sync.log_retention_days', parseInt(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Global Text */}
      <Card>
        <CardHeader>
          <CardTitle>Global Text & Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Global Disclaimer</Label>
            <Textarea
              value={settings?.global_disclaimer || ''}
              onChange={(e) => updateField('global_disclaimer', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Contact Telegram</Label>
              <Input
                value={settings?.contact_telegram || ''}
                onChange={(e) => updateField('contact_telegram', e.target.value)}
              />
            </div>

            <div>
              <Label>Contact Email</Label>
              <Input
                type="email"
                value={settings?.contact_email || ''}
                onChange={(e) => updateField('contact_email', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription>Settings saved successfully!</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription>Error: {error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
