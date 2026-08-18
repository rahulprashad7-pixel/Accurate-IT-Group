import React from 'react';
import {
  LayoutDashboard,
  Laptop,
  TicketCheck,
  Users,
  Building2,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronRight,
  Database,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { ViewTab } from '../types';

interface SidebarProps {
  currentTab: ViewTab;
  setCurrentTab: (tab: ViewTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isCollapsed,
  setIsCollapsed,
}) => {
  const { currentUser, activeCompanyFilter } = useAuth();
  const { tickets, assets, isFirestoreConnected } = useData();

  // Scoped count
  const openTicketsCount = tickets.filter(
    (t) =>
      (activeCompanyFilter === 'ALL' || t.companyCode === activeCompanyFilter) &&
      t.status !== 'CLOSED' &&
      t.status !== 'RESOLVED'
  ).length;

  const totalAssetsCount = assets.filter(
    (a) => activeCompanyFilter === 'ALL' || a.companyCode === activeCompanyFilter
  ).length;

  const navItems: {
    id: ViewTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
    rolesAllowed: Array<string>;
  }[] = [
    {
      id: 'DASHBOARD',
      label: 'Main Dashboard',
      icon: LayoutDashboard,
      rolesAllowed: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'IT_STAFF', 'EMPLOYEE'],
    },
    {
      id: 'ASSETS',
      label: currentUser?.role === 'EMPLOYEE' ? 'My Assigned Assets' : 'IT Asset Management',
      icon: Laptop,
      badge: totalAssetsCount,
      badgeColor: 'bg-blue-50 text-blue-700 border border-blue-200',
      rolesAllowed: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'IT_STAFF', 'EMPLOYEE'],
    },
    {
      id: 'TICKETS',
      label: currentUser?.role === 'EMPLOYEE' ? 'My Support Tickets' : 'Help Desk Tickets',
      icon: TicketCheck,
      badge: openTicketsCount > 0 ? openTicketsCount : undefined,
      badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200',
      rolesAllowed: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'IT_STAFF', 'EMPLOYEE'],
    },
    {
      id: 'USERS',
      label: 'Employees / Users',
      icon: Users,
      rolesAllowed: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'IT_STAFF'],
    },
    {
      id: 'COMPANIES',
      label: 'Company Portals',
      icon: Building2,
      badge: '3 Units',
      badgeColor: 'bg-purple-50 text-purple-700 border border-purple-200',
      rolesAllowed: ['SUPER_ADMIN', 'COMPANY_ADMIN'],
    },
    {
      id: 'REPORTS',
      label: 'Reports & Audits',
      icon: BarChart3,
      rolesAllowed: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'IT_STAFF'],
    },
    {
      id: 'SETTINGS',
      label: 'Settings & SLA',
      icon: Settings,
      rolesAllowed: ['SUPER_ADMIN', 'COMPANY_ADMIN'],
    },
  ];

  const allowedItems = navItems.filter((item) =>
    currentUser ? item.rolesAllowed.includes(currentUser.role) : true
  );

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-slate-200 bg-white transition-all duration-300 shrink-0 z-20 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Navigation Links */}
      <div className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        <div className="px-2 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {!isCollapsed && 'Navigation'}
        </div>

        {allowedItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-tab-${item.id.toLowerCase()}`}
              onClick={() => setCurrentTab(item.id)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all group cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-900'
                  }`}
                />
                {!isCollapsed && <span>{item.label}</span>}
              </div>

              {!isCollapsed && item.badge !== undefined && (
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                    isActive
                      ? 'bg-slate-800 text-slate-200'
                      : item.badgeColor || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Cloud & RBAC Status Widget in Footer */}
      {!isCollapsed ? (
        <div className="p-3 border-t border-slate-100 m-3 rounded-2xl bg-slate-50 border border-slate-200/60">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
              <Database className="h-3.5 w-3.5 text-emerald-600" />
              <span>Firestore Sync</span>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
          <div className="text-[10px] text-slate-500 leading-tight">
            Role: <span className="text-slate-800 font-semibold">{currentUser?.role.replace('_', ' ')}</span>
          </div>
          <div className="text-[10px] text-slate-500 leading-tight truncate">
            Scope: <span className="text-slate-800 font-semibold">{currentUser?.companyCode}</span>
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-slate-100 flex justify-center">
          <div className="h-2 w-2 rounded-full bg-emerald-500" title="Firestore Connected" />
        </div>
      )}
    </aside>
  );
};
