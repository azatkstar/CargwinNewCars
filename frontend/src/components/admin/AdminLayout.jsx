import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Car, Package, Settings, FileText, LogOut, User, Users, FileCheck, DollarSign, TrendingUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';

const AdminLayout = ({ children }) => {
  const { user, role, logout, hasPermission } = useAuth();
  const { t } = useI18n();
  const location = useLocation();

  const navItems = [
    {
      id: 'lots',
      label: 'Lots Management',
      icon: Package,
      path: '/admin/lots',
      requiredRole: 'viewer'
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      path: '/admin/users',
      requiredRole: 'admin'
    },
    {
      id: 'applications',
      label: 'Applications',
      icon: FileCheck,
      path: '/admin/applications',
      requiredRole: 'admin'
    },
    {
      id: 'finance-manager',
      label: 'Finance Manager',
      icon: DollarSign,
      path: '/admin/finance-manager',
      requiredRole: 'finance_manager'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      path: '/admin/analytics',
      requiredRole: 'finance_manager'
    },
    {
      id: 'settings', 
      label: 'Settings',
      icon: Settings,
      path: '/admin/settings',
      requiredRole: 'admin'
    },
    {
      id: 'audit',
      label: 'Audit Log',
      icon: FileText,
      path: '/admin/audit',
      requiredRole: 'viewer'
    }
  ];

  const getRoleBadgeColor = (userRole) => {
    switch (userRole) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-red-600 p-2 rounded-lg">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CargwinNewCar</h1>
                <p className="text-sm text-gray-500">Админ-панель</p>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{user?.email}</span>
                </div>
                <Badge className={getRoleBadgeColor(role)}>
                  {role}
                </Badge>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-gray-700 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('admin.nav.logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)]">
          <div className="p-6">
            <ul className="space-y-2">
              {navItems.map((item) => {
                if (!hasPermission(item.requiredRole)) return null;
                
                const IconComponent = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                
                return (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                        isActive
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;