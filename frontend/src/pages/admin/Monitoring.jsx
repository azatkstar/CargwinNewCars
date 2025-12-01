import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { RefreshCw, Activity, Clock, CheckCircle, XCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function Monitoring() {
  const [syncStatus, setSyncStatus] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const loadMonitoringData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Get sync stats
      const statsRes = await fetch(`${BACKEND_URL}/api/admin/sync/stats`, { headers });
      const statsData = await statsRes.json();
      setSyncStatus(statsData);

      // Get recent logs
      const logsRes = await fetch(`${BACKEND_URL}/api/admin/sync/logs?limit=100`, { headers });
      const logsData = await logsRes.json();
      setRecentLogs(logsData.logs || []);

    } catch (err) {
      console.error('Monitoring error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMonitoringData();
  }, []);

  // Auto-refresh every 10 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadMonitoringData();
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const runSyncNow = async () => {
    setIsRunning(true);
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${BACKEND_URL}/api/admin/sync/run`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Reload data after sync
      setTimeout(() => {
        loadMonitoringData();
        setIsRunning(false);
      }, 2000);

    } catch (err) {
      console.error('Sync error:', err);
      setIsRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading monitoring dashboard...</p>
      </div>
    );
  }

  const lastSyncTime = syncStatus?.last_sync_time 
    ? new Date(syncStatus.last_sync_time).toLocaleString()
    : 'Never';

  const syncHealthy = syncStatus?.last_sync_deals_updated >= 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Realtime Monitoring</h1>
          <p className="text-gray-600">AutoSync Engine status and logs</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
          >
            {autoRefresh ? 'Auto-Refresh: ON' : 'Auto-Refresh: OFF'}
          </Button>
          <Button onClick={loadMonitoringData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Sync Status</div>
                <div className="flex items-center gap-2">
                  {syncHealthy ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-600">Healthy</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="font-semibold text-red-600">Unknown</span>
                    </>
                  )}
                </div>
              </div>
              <Activity className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Last Sync</div>
            <div className="font-semibold text-gray-900">{lastSyncTime}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Deals Updated</div>
            <div className="text-2xl font-bold text-blue-600">
              {syncStatus?.last_sync_deals_updated || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Total Programs</div>
            <div className="text-2xl font-bold text-purple-600">
              {syncStatus?.total_programs || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Now */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Sync Trigger</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={runSyncNow}
            disabled={isRunning}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Sync Running...
              </>
            ) : (
              <>
                <Activity className="w-4 h-4 mr-2" />
                Run Sync Now
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent AutoSync Logs ({recentLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No sync logs available yet. Run your first sync!
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded border"
                >
                  <div className="flex-shrink-0 mt-1">
                    {log.brand && (
                      <Badge>{log.brand}</Badge>
                    )}
                  </div>
                  <div className="flex-1 text-sm">
                    <div className="font-medium text-gray-900">
                      {log.brand} {log.model || 'All Models'}
                    </div>
                    <div className="text-gray-600 text-xs mt-1">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      MF Changes: {Object.keys(log.changes?.mf_changes || {}).length},
                      RV Changes: {Object.keys(log.changes?.rv_changes || {}).length},
                      Deals Updated: {log.deals_count || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
