import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { FileText, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AuditLog = () => {
  const { getApiClient } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    resource_type: 'all',
    action: 'all',
    user_email: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchLogs();
  }, [filters, pagination.page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        resource_type: filters.resource_type === 'all' ? undefined : filters.resource_type,
        action: filters.action === 'all' ? undefined : filters.action,
        user_email: filters.user_email || undefined
      };

      const response = await api.get('/api/admin/audit-logs', { params });
      
      setLogs(response.data.logs || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        pages: response.data.pages || 0
      }));
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getActionBadge = (action) => {
    const actionConfig = {
      create: { color: 'bg-green-100 text-green-800', label: 'Create' },
      update: { color: 'bg-blue-100 text-blue-800', label: 'Update' },
      delete: { color: 'bg-red-100 text-red-800', label: 'Delete' },
      publish: { color: 'bg-purple-100 text-purple-800', label: 'Publish' },
      archive: { color: 'bg-yellow-100 text-yellow-800', label: 'Archive' },
      import: { color: 'bg-indigo-100 text-indigo-800', label: 'Import' },
      export: { color: 'bg-cyan-100 text-cyan-800', label: 'Export' }
    };

    const config = actionConfig[action] || { color: 'bg-gray-100 text-gray-800', label: action };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getResourceTypeBadge = (type) => {
    const typeConfig = {
      lot: { color: 'bg-blue-50 text-blue-700', label: 'Lot' },
      user: { color: 'bg-green-50 text-green-700', label: 'User' },
      application: { color: 'bg-purple-50 text-purple-700', label: 'Application' },
      settings: { color: 'bg-orange-50 text-orange-700', label: 'Settings' }
    };

    const config = typeConfig[type] || { color: 'bg-gray-50 text-gray-700', label: type };
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-gray-600 mt-1">Complete history of system actions</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by email..."
                value={filters.user_email}
                onChange={(e) => handleFilterChange('user_email', e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filters.resource_type} onValueChange={(value) => handleFilterChange('resource_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Resource Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="lot">Lots</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="application">Applications</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="publish">Publish</SelectItem>
                <SelectItem value="archive">Archive</SelectItem>
                <SelectItem value="import">Import</SelectItem>
                <SelectItem value="export">Export</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={fetchLogs}>
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Action History ({pagination.total} total)
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No audit logs found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource Type</TableHead>
                      <TableHead>Resource ID</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{log.user_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getActionBadge(log.action)}
                        </TableCell>
                        <TableCell>
                          {getResourceTypeBadge(log.resource_type)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.resource_id?.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {log.changes && Object.keys(log.changes).length > 0 && (
                            <div className="text-xs text-gray-500">
                              {Object.keys(log.changes).length} field(s) changed
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.pages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLog;