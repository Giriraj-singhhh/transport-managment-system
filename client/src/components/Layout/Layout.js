import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Bus, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  BarChart3,
  Users,
  Navigation,
  ClipboardList
} from 'lucide-react';

const Layout = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navigation = [
    { name: 'Dashboard', path: '/app/dashboard', icon: Home, roles: ['student', 'staff', 'admin', 'driver'] },
    { name: 'Bookings', path: '/app/bookings', icon: BookOpen, roles: ['student', 'staff', 'admin'] },
    { name: 'Buses', path: '/app/buses', icon: Bus, roles: ['student', 'staff', 'admin'] },
    { name: 'Routes', path: '/app/routes', icon: Navigation, roles: ['student', 'staff', 'admin'] },
    { name: 'Schedules', path: '/app/schedules', icon: Calendar, roles: ['student', 'staff', 'admin'] },
    { name: 'Live Tracking', path: '/app/tracking', icon: MapPin, roles: ['student', 'staff', 'admin'] },
    { name: 'Notifications', path: '/app/notifications', icon: Bell, roles: ['student', 'staff', 'admin', 'driver'] },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', path: '/app/admin', icon: BarChart3 },
    { name: 'Users', path: '/app/admin/users', icon: Users },
    { name: 'Buses', path: '/app/admin/buses', icon: Bus },
    { name: 'Drivers', path: '/app/admin/drivers', icon: Users },
    { name: 'Routes', path: '/app/admin/routes', icon: Navigation },
    { name: 'Schedules', path: '/app/admin/schedules', icon: Calendar },
    { name: 'Bookings', path: '/app/admin/bookings', icon: ClipboardList },
    { name: 'Reports', path: '/app/admin/reports', icon: BarChart3 },
    { name: 'Settings', path: '/app/admin/settings', icon: Settings },
  ];

  const driverNavigation = [
    { name: 'Driver Dashboard', path: '/app/driver', icon: Home },
    { name: 'My Schedule', path: '/app/driver/schedule', icon: Calendar },
    { name: 'Update Location', path: '/app/driver/location', icon: MapPin },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.some(role => hasRole(role))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link to="/app/dashboard" className="flex items-center space-x-2">
              <Bus className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Transport</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-2 space-y-1">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}

              {/* Admin Section */}
              {hasRole('admin') && (
                <>
                  <div className="px-4 py-2 mt-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Administration
                    </h3>
                  </div>
                  {adminNavigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                          isActive(item.path)
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </>
              )}

              {/* Driver Section */}
              {hasRole('driver') && (
                <>
                  <div className="px-4 py-2 mt-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Driver
                    </h3>
                  </div>
                  {driverNavigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                          isActive(item.path)
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </>
              )}
            </div>
          </nav>

          {/* User Section */}
          <div className="border-t p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <Link
                to="/app/profile"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User className="mr-3 h-4 w-4" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center space-x-4">
              <Link
                to="/app/notifications"
                className="relative p-2 text-gray-500 hover:text-gray-700"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

