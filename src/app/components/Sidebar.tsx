import { Link, useLocation, useNavigate } from 'react-router';
import { Home, History, ClipboardList, Store, CreditCard, CheckSquare, ChevronLeft, LogOut } from 'lucide-react';
import { useAuth } from '../lib/auth-context';

interface SidebarProps {
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Главная',       path: '/',            icon: Home },
    { name: 'История',       path: '/history',     icon: History },
    { name: 'Мои чек-листы', path: '/templates',   icon: ClipboardList },
    { name: 'Мой ресторан',  path: '/restaurant',  icon: Store },
    { name: 'Подписка',      path: '/subscription', icon: CreditCard },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const expand = () => {
    if (collapsed) onToggle(false);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden ${
        collapsed ? 'w-20 cursor-pointer' : 'w-[270px]'
      }`}
      onClick={expand}
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between flex-shrink-0">
        {/* Logo */}
        <Link
          to="/"
          onClick={(e) => {
            if (collapsed) {
              e.preventDefault();
            }
          }}
          className={`flex items-center gap-3 min-w-0 ${collapsed ? 'w-full justify-center' : ''}`}
        >
          <div className="bg-orange-500 p-2 rounded-lg flex-shrink-0">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <span
            className={`text-xl font-semibold text-gray-900 whitespace-nowrap overflow-hidden transition-all duration-300 ${
              collapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'
            }`}
          >
            RosterDuty
          </span>
        </Link>

        {/* Collapse button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(true);
          }}
          className={`p-1.5 rounded-md text-gray-400 hover:text-gray-600 transition-all duration-300 flex-shrink-0 overflow-hidden ${
            collapsed ? 'max-w-0 opacity-0 pointer-events-none px-0' : 'max-w-[40px] opacity-100'
          }`}
          title="Свернуть"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pt-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={(e) => e.stopPropagation()}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                    active ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  } ${collapsed ? 'justify-center' : ''}`}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0 stroke-[1.5]" />
                  <span
                    className={`text-[15px] whitespace-nowrap overflow-hidden transition-all duration-300 ${
                      collapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 flex-shrink-0 border-t border-gray-100 pt-2">
        {/* User info */}
        <div className={`flex items-center gap-3 px-3 py-2 mb-1 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-orange-700">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          <div className={`overflow-hidden transition-all duration-300 ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
            <p className="text-sm font-medium text-gray-900 whitespace-nowrap truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 whitespace-nowrap truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleLogout();
          }}
          className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-gray-500 hover:text-red-600 hover:bg-red-50 ${
            collapsed ? 'w-full justify-center' : 'w-full'
          }`}
        >
          <LogOut className="w-5 h-5 stroke-[1.5] flex-shrink-0" />
          <span
            className={`text-[15px] whitespace-nowrap overflow-hidden transition-all duration-300 ${
              collapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'
            }`}
          >
            Выйти
          </span>
        </button>
      </div>
    </aside>
  );
}
