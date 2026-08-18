import React, { useState } from 'react';
import {
  Building2,
  Bell,
  Search,
  User,
  Shield,
  LogOut,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Laptop,
  TicketCheck,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { CompanyCode, Role, SelectedCompanyFilter, ViewTab } from '../types';

interface NavbarProps {
  currentTab: ViewTab;
  setCurrentTab: (tab: ViewTab) => void;
  onOpenNewTicketModal: () => void;
  onOpenNewAssetModal: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNewTicketModal,
  onOpenNewAssetModal,
  searchQuery,
  setSearchQuery,
}) => {
  const {
    currentUser,
    activeCompanyFilter,
    setActiveCompanyFilter,
    switchRole,
    logout,
    loginAsDemoPersona,
  } = useAuth();
  const { companies, tickets, assets, isFirestoreConnected, resetToEnterpriseSeedData, isLoadingData } = useData();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);

  // Compute urgent notifications
  const criticalTickets = tickets.filter(
    (t) =>
      (activeCompanyFilter === 'ALL' || t.companyCode === activeCompanyFilter) &&
      t.priority === 'CRITICAL' &&
      t.status !== 'CLOSED' &&
      t.status !== 'RESOLVED'
  );

  const maintenanceAssets = assets.filter(
    (a) =>
      (activeCompanyFilter === 'ALL' || a.companyCode === activeCompanyFilter) &&
      a.status === 'UNDER_MAINTENANCE'
  );

  const urgentCount = criticalTickets.length + maintenanceAssets.length;

  const getCompanyBadgeColor = (code: SelectedCompanyFilter) => {
    switch (code) {
      case 'AGIPL':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'ASSPL':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ONYX':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getRoleLabel = (role?: Role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Admin (CIO)';
      case 'COMPANY_ADMIN':
        return 'Company Admin';
      case 'IT_STAFF':
        return 'IT Staff / Support';
      case 'EMPLOYEE':
        return 'Employee / Requester';
      default:
        return 'User';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 md:px-6 backdrop-blur-md">
      {/* Left: Brand & Company Selector */}
      <div className="flex items-center gap-3 md:gap-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-bold shadow-xs">
            <Layers className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-base leading-tight tracking-tight">
              <span>OmniIT</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                Multi-Tenant
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              AGIPL • ASSPL • ONYX Precision
            </p>
          </div>
        </div>

        {/* Company Filter Dropdown */}
        <div className="relative">
          <button
            id="company-selector-btn"
            onClick={() => setShowCompanyMenu(!showCompanyMenu)}
            disabled={currentUser?.role !== 'SUPER_ADMIN'}
            className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
              currentUser?.role === 'SUPER_ADMIN'
                ? 'cursor-pointer hover:shadow-xs'
                : 'cursor-default opacity-90'
            } ${getCompanyBadgeColor(activeCompanyFilter)}`}
            title={currentUser?.role !== 'SUPER_ADMIN' ? 'Company fixed by role' : 'Switch company view'}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span className="font-semibold">
              {activeCompanyFilter === 'ALL'
                ? 'All Companies (Group)'
                : companies.find((c) => c.code === activeCompanyFilter)?.fullName || activeCompanyFilter}
            </span>
            {currentUser?.role === 'SUPER_ADMIN' && (
              <ChevronDown className="h-3 w-3 text-slate-500 ml-1" />
            )}
          </button>

          {showCompanyMenu && currentUser?.role === 'SUPER_ADMIN' && (
            <div
              className="absolute left-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setShowCompanyMenu(false)}
            >
              <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Company View
              </div>
              <button
                onClick={() => setActiveCompanyFilter('ALL')}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-colors ${
                  activeCompanyFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span>All Companies (Consolidated)</span>
                </div>
                <span className="text-[10px] opacity-75 font-semibold">3 Units</span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              {companies.map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => setActiveCompanyFilter(comp.code)}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-colors ${
                    activeCompanyFilter === comp.code
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: comp.logoColor }}
                    />
                    <div className="text-left">
                      <div className="font-semibold">{comp.code}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                        {comp.fullName}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search assets (tags, serial, model) or tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-8 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions, Notifications, Role Switcher, Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Quick Action Button */}
        {currentUser?.role === 'EMPLOYEE' ? (
          <button
            id="nav-raise-ticket-btn"
            onClick={onOpenNewTicketModal}
            className="hidden sm:flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <TicketCheck className="h-3.5 w-3.5" />
            <span>Raise Ticket</span>
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              id="nav-new-asset-btn"
              onClick={onOpenNewAssetModal}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Laptop className="h-3.5 w-3.5 text-blue-600" />
              <span>+ Asset</span>
            </button>
            <button
              id="nav-new-ticket-btn"
              onClick={onOpenNewTicketModal}
              className="flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
            >
              <TicketCheck className="h-3.5 w-3.5" />
              <span>+ Ticket</span>
            </button>
          </div>
        )}

        {/* Demo Role Switcher Quick Pill */}
        <div className="relative">
          <button
            id="role-demo-switcher-btn"
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Switch demo persona/role"
          >
            <Shield className="h-3.5 w-3.5 text-blue-600" />
            <span className="hidden lg:inline">{getRoleLabel(currentUser?.role)}</span>
            <span className="lg:hidden">{currentUser?.role?.replace('_', ' ')}</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showRoleSwitcher && (
            <div
              className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setShowRoleSwitcher(false)}
            >
              <div className="px-2.5 py-1.5">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Role & Demo Persona Switcher
                </div>
                <div className="text-[11px] text-slate-500">
                  Select a persona to test role-based permissions & view constraints
                </div>
              </div>

              <div className="space-y-1 mt-1 border-t border-slate-100 pt-2">
                <button
                  onClick={() => loginAsDemoPersona('usr-super-admin')}
                  className={`flex w-full items-start gap-2.5 rounded-xl p-2 text-left text-xs transition-colors cursor-pointer ${
                    currentUser?.role === 'SUPER_ADMIN'
                      ? 'bg-blue-50 border border-blue-200 text-blue-900'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="mt-0.5 rounded-lg bg-blue-100 p-1 text-blue-700 font-bold text-[10px]">
                    SA
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Super Admin (Rahul Prashad)</div>
                    <div className="text-[11px] text-slate-500">
                      Unrestricted access to AGIPL, ASSPL & ONYX Precision
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => loginAsDemoPersona('usr-agipl-admin')}
                  className={`flex w-full items-start gap-2.5 rounded-xl p-2 text-left text-xs transition-colors cursor-pointer ${
                    currentUser?.role === 'COMPANY_ADMIN' && currentUser.companyCode === 'AGIPL'
                      ? 'bg-blue-50 border border-blue-200 text-blue-900'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="mt-0.5 rounded-lg bg-sky-100 p-1 text-sky-700 font-bold text-[10px]">
                    CA
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Company Admin (Vikramaditya)</div>
                    <div className="text-[11px] text-slate-500">
                      Scoped strictly to AGIPL manufacturing operations
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => loginAsDemoPersona('usr-it-staff-2')}
                  className={`flex w-full items-start gap-2.5 rounded-xl p-2 text-left text-xs transition-colors cursor-pointer ${
                    currentUser?.role === 'IT_STAFF'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="mt-0.5 rounded-lg bg-emerald-100 p-1 text-emerald-700 font-bold text-[10px]">
                    IT
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">IT Staff (Pooja Varma)</div>
                    <div className="text-[11px] text-slate-500">
                      Can audit assets & resolve helpdesk tickets
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => loginAsDemoPersona('usr-emp-onyx-1')}
                  className={`flex w-full items-start gap-2.5 rounded-xl p-2 text-left text-xs transition-colors cursor-pointer ${
                    currentUser?.role === 'EMPLOYEE'
                      ? 'bg-purple-50 border border-purple-200 text-purple-900'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="mt-0.5 rounded-lg bg-purple-100 p-1 text-purple-700 font-bold text-[10px]">
                    EM
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Employee (Dr. Tanya B.)</div>
                    <div className="text-[11px] text-slate-500">
                      Can raise tickets & view assigned ONYX CAD gear
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <div className="relative">
          <button
            id="notifications-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            {urgentCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setShowNotifications(false)}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900">System Alerts & SLA Feed</div>
                <span className="text-[10px] rounded-md bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 font-semibold">
                  {urgentCount} action items
                </span>
              </div>

              <div className="mt-2 space-y-2 max-h-72 overflow-y-auto">
                {criticalTickets.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider">
                      Critical Tickets
                    </div>
                    {criticalTickets.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setCurrentTab('TICKETS')}
                        className="cursor-pointer rounded-xl bg-rose-50/50 border border-rose-100 p-2.5 text-xs hover:bg-rose-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-rose-900">{t.ticketNumber}</span>
                          <span className="text-[10px] text-rose-600 font-bold px-1.5 py-0.2 rounded bg-rose-100">
                            {t.companyCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-700 line-clamp-1 mt-0.5">{t.title}</p>
                      </div>
                    ))}
                  </div>
                )}

                {maintenanceAssets.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">
                      Assets In Maintenance
                    </div>
                    {maintenanceAssets.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => setCurrentTab('ASSETS')}
                        className="cursor-pointer rounded-xl bg-amber-50/50 border border-amber-100 p-2.5 text-xs hover:bg-amber-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-amber-900">{a.assetTag}</span>
                          <span className="text-[10px] text-amber-700">{a.companyCode}</span>
                        </div>
                        <p className="text-[11px] text-slate-700 line-clamp-1 mt-0.5">{a.name}</p>
                      </div>
                    ))}
                  </div>
                )}

                {urgentCount === 0 && (
                  <div className="py-6 text-center text-xs text-slate-500">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
                    All enterprise IT services and SLAs are operational!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Menu */}
        <div className="relative">
          <button
            id="user-profile-avatar-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1 pr-2.5 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="h-7 w-7 rounded-lg object-cover border border-slate-200"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-none truncate max-w-[100px]">
                {currentUser?.name}
              </div>
              <div className="text-[10px] text-slate-500 leading-tight">
                {currentUser?.companyCode}
              </div>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div
              className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setShowProfileMenu(false)}
            >
              <div className="px-2.5 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900">{currentUser?.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{currentUser?.email}</div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {getRoleLabel(currentUser?.role)}
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    {currentUser?.department}
                  </span>
                </div>
              </div>

              <div className="py-1 space-y-0.5">
                <button
                  onClick={() => setCurrentTab('SETTINGS')}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <Shield className="h-3.5 w-3.5 text-slate-400" />
                  <span>Portal Settings & SLA Config</span>
                </button>

                <button
                  onClick={resetToEnterpriseSeedData}
                  disabled={isLoadingData}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-amber-700 hover:bg-amber-50 cursor-pointer"
                  title="Reload default enterprise test data"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
                  <span>Reset Demo Data</span>
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out / Switch User</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
