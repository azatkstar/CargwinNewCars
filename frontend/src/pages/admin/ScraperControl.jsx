import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Play, RefreshCw, Download, FileText, Clock } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function ScraperControl() {
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedBrands, setSelectedBrands] = useState(['all']);

  const brands = [
    { value: 'all', label: 'All Brands' },
    { value: 'toyota', label: 'Toyota' },
    { value: 'lexus', label: 'Lexus' },
    { value: 'honda', label: 'Honda' },
    { value: 'hyundai', label: 'Hyundai' },
    { value: 'kia', label: 'Kia' },
    { value: 'nissan', label: 'Nissan' },
    { value: 'bmw', label: 'BMW' },
    { value: 'mercedes', label: 'Mercedes-Benz' },
    { value: 'subaru', label: 'Subaru' }
  ];

  useEffect(() => {
    loadStatus();
    
    // Poll every 5 seconds
    const interval = setInterval(() => {
      loadStatus();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BACKEND_URL}/api/admin/scraper/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        setLogs(data.recentLogs || []);
      }
    } catch (err) {
      console.error('Error loading scraper status:', err);
    } finally {
      setLoading(false);
    }
  };

  const runScraper = async (force = false) => {
    setRunning(true);

    try {
      const token = localStorage.getItem('access_token');
      
      // Prepare brands parameter
      const brandsParam = selectedBrands.includes('all') 
        ? 'all' 
        : selectedBrands.join(',');
      
      const response = await fetch(
        `${BACKEND_URL}/api/admin/scraper/run?force=${force}&brands=${brandsParam}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const data = await response.json();
      
      if (data.ok) {
        alert(`Scraper запущен для брендов: ${brandsParam}\n${data.message || 'Success'}`);
        setTimeout(loadStatus, 2000);
      } else {
        alert('Ошибка запуска scraper');
      }
    } catch (err) {
      console.error('Scraper run error:', err);
      alert('Ошибка запуска scraper');
    } finally {
      setRunning(false);
    }
  };

  const toggleBrand = (brandValue) => {
    if (brandValue === 'all') {
      setSelectedBrands(['all']);
    } else {
      const newSelection = selectedBrands.filter(b => b !== 'all');
      
      if (newSelection.includes(brandValue)) {
        const updated = newSelection.filter(b => b !== brandValue);
        setSelectedBrands(updated.length > 0 ? updated : ['all']);
      } else {
        setSelectedBrands([...newSelection, brandValue]);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Scraper Control</h1>
          <p className="text-gray-600">AutoBandit scraper management</p>
        </div>
        <Button onClick={loadStatus} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Status</div>
            <div>
              {status?.running ? (
                <Badge className="bg-green-600">Running</Badge>
              ) : (
                <Badge variant="secondary">Idle</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Last Run</div>
            <div className="font-semibold text-sm">
              {status?.lastRun ? new Date(status.lastRun).toLocaleString() : 'Never'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Offers Scraped</div>
            <div className="text-2xl font-bold text-blue-600">
              {status?.totalScraped || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Imported</div>
            <div className="text-2xl font-bold text-green-600">
              {status?.totalImported || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {brands.map(brand => (
              <button
                key={brand.value}
                onClick={() => toggleBrand(brand.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedBrands.includes(brand.value)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {brand.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Selected: {selectedBrands.includes('all') ? 'All Brands' : selectedBrands.join(', ')}
          </p>
        </CardContent>
      </Card>

      {/* Run Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => runScraper(false)}
            disabled={running}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {running ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Smart Scrape
              </>
            )}
          </Button>

          <Button
            onClick={() => runScraper(true)}
            disabled={running}
            variant="outline"
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Force Full Scrape
          </Button>

          <div className="text-xs text-gray-500 mt-2">
            Smart: Scrapes only changed offers<br />
            Force: Full scrape of all offers
          </div>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No scraper activity yet
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log, idx) => (
                <div key={idx} className="text-sm p-3 bg-gray-50 rounded border">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="mt-1">{log.message}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-sm text-gray-700">
            <p className="font-semibold mb-2">📌 Scraper Location:</p>
            <code className="text-xs bg-white p-2 rounded block">/app/scraper/</code>
            <p className="mt-3 text-xs text-gray-600">
              To run manually: <code>cd /app/scraper && node run.js</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
