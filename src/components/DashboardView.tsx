import React from 'react';
import {
  Laptop,
  TicketCheck,
  AlertCircle,
  Clock,
  ShieldCheck,
  TrendingUp,
  Building2,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  Sparkles,
  Layers,
  Wrench,
  UserCheck,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { ViewTab, AssetStatus, TicketPriority } from '../types';

interface DashboardViewProps {
  setCurrentTab: (tab: ViewTab) => void;
  onOpenNewTicketModal: () => void;
  onOpenNewAssetModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setCurrentTab,
  onOpenNewTicketModal,
  onOpenNewAssetModal,
}) => {
  const { currentUser, activeCompanyFilter, setActiveCompanyFilter } = useAuth();
  const { assets, tickets, users, companies, activityLogs } = useData();

  // Filter based on active company selection
  const filteredAssets = assets.filter(
    (a) => activeCompanyFilter === 'ALL' || a.companyCode === activeCompanyFilter
  );

  const filteredTickets = tickets.filter(
    (t) => activeCompanyFilter === 'ALL' || t.companyCode === activeCompanyFilter
  );

  const filteredUsers = users.filter(
    (u) => activeCompanyFilter === 'ALL' || u.companyCode === activeCompanyFilter
  );

  // Key KPI metrics
  const totalAssetsCount = filteredAssets.length;
  const inUseAssetsCount = filteredAssets.filter((a) => a.status === 'IN_USE').length;
  const maintenanceAssetsCount = filteredAssets.filter((a) => a.status === 'UNDER_MAINTENANCE').length;
  const availableAssetsCount = filteredAssets.filter((a) => a.status === 'AVAILABLE').length;

  const totalAssetValueUSD = filteredAssets.reduce((sum, a) => sum + (a.purchaseCost || 0), 0);

  const totalTicketsCount = filteredTickets.length;
  const openTickets = filteredTickets.filter(
    (t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS' || t.status === 'PENDING_VENDOR'
  );
  const resolvedTickets = filteredTickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED');
  const criticalTickets = filteredTickets.filter((t) => t.priority === 'CRITICAL' && t.status !== 'CLOSED');
  const breachedTickets = filteredTickets.filter((t) => t.slaBreached);

  // Asset category data for PieChart
  const categoryCounts = filteredAssets.reduce((acc: Record<string, number>, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(categoryCounts).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
  }));

  const PIE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#64748b'];

  // Company comparison data (for Super Admin)
  const companyComparisonData = companies.map((c) => {
    const cAssets = assets.filter((a) => a.companyCode === c.code);
    const cTickets = tickets.filter((t) => t.companyCode === c.code);
    const cOpen = cTickets.filter((t) => t.status !== 'CLOSED' && t.status !== 'RESOLVED');
    return {
      name: c.code,
      assets: cAssets.length,
      tickets: cTickets.length,
      openTickets: cOpen.length,
    };
  });

  // Ticket Priority Trend
  const priorityData = [
    { priority: 'Critical', count: filteredTickets.filter((t) => t.priority === 'CRITICAL').length, fill: '#ef4444' },
    { priority: 'High', count: filteredTickets.filter((t) => t.priority === 'HIGH').length, fill: '#f97316' },
    { priority: 'Medium', count: filteredTickets.filter((t) => t.priority === 'MEDIUM').length, fill: '#eab308' },
    { priority: 'Low', count: filteredTickets.filter((t) => t.priority === 'LOW').length, fill: '#3b82f6' },
  ];

  // Employee-specific personalized view if logged in as employee
  const myAssignedAssets = assets.filter((a) => a.assignedToUserId === currentUser?.id);
  const myTickets = tickets.filter((t) => t.requesterId === currentUser?.id);

  return (
    <div className="space-y-5 pb-12">
      {/* Welcome Banner Bento Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {activeCompanyFilter === 'ALL' ? 'Group IT Portal' : `${activeCompanyFilter} IT Hub`}
              </span>
              <span className="text-xs text-slate-500">
                • {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {currentUser?.name}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              {currentUser?.role === 'SUPER_ADMIN' && 'Unified overview across AGIPL, ASSPL, and ONYX Precision systems.'}
              {currentUser?.role === 'COMPANY_ADMIN' && `Managing IT infrastructure, assets & SLA performance for ${currentUser.companyCode}.`}
              {currentUser?.role === 'IT_STAFF' && 'Assigned ticket queues, pending asset inspections, and system health status.'}
              {currentUser?.role === 'EMPLOYEE' && 'Your assigned workstations, hardware peripherals, and active support tickets.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {currentUser?.role === 'EMPLOYEE' ? (
              <button
                id="dash-raise-ticket-btn"
                onClick={onOpenNewTicketModal}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all cursor-pointer"
              >
                <TicketCheck className="h-4 w-4" />
                <span>Raise Support Ticket</span>
              </button>
            ) : (
              <>
                <button
                  id="dash-add-asset-btn"
                  onClick={onOpenNewAssetModal}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <Laptop className="h-4 w-4 text-blue-600" />
                  <span>Register Asset</span>
                </button>
                <button
                  id="dash-create-ticket-btn"
                  onClick={onOpenNewTicketModal}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-600 transition-all cursor-pointer"
                >
                  <TicketCheck className="h-4 w-4" />
                  <span>Create Ticket</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Total Assets */}
        <div
          onClick={() => setCurrentTab('ASSETS')}
          className="group cursor-pointer rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total IT Assets</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 group-hover:scale-110 transition-transform">
              <Laptop className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalAssetsCount}</span>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" />
              {inUseAssetsCount} active
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Valuation: ${(totalAssetValueUSD / 1000).toFixed(1)}k USD
          </div>
        </div>

        {/* Active Tickets */}
        <div
          onClick={() => setCurrentTab('TICKETS')}
          className="group cursor-pointer rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Tickets</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100 group-hover:scale-110 transition-transform">
              <TicketCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{openTickets.length}</span>
            {criticalTickets.length > 0 && (
              <span className="text-[11px] text-rose-700 font-bold px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200">
                {criticalTickets.length} Critical
              </span>
            )}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {resolvedTickets.length} resolved this cycle
          </div>
        </div>

        {/* SLA Compliance */}
        <div
          onClick={() => setCurrentTab('REPORTS')}
          className="group cursor-pointer rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">SLA Compliance</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {totalTicketsCount > 0
                ? `${Math.round(((totalTicketsCount - breachedTickets.length) / totalTicketsCount) * 100)}%`
                : '100%'}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Avg MTTR: 3.2h</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {breachedTickets.length} SLA breaches reported
          </div>
        </div>

        {/* Inventory Status */}
        <div
          onClick={() => setCurrentTab('ASSETS')}
          className="group cursor-pointer rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Inventory Status</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100 group-hover:scale-110 transition-transform">
              <Wrench className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{availableAssetsCount}</span>
            <span className="text-[11px] text-slate-500">ready in stock</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-600 font-semibold">
            {maintenanceAssetsCount} in maintenance/repair
          </div>
        </div>
      </div>

      {/* Employee Quick View (if role === EMPLOYEE) */}
      {currentUser?.role === 'EMPLOYEE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* My Assigned Hardware */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Laptop className="h-4 w-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  My Assigned IT Gear ({myAssignedAssets.length})
                </h3>
              </div>
              <button
                onClick={() => setCurrentTab('ASSETS')}
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5 font-semibold"
              >
                View Details <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-2">
              {myAssignedAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">{asset.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Tag: <span className="text-blue-600 font-mono font-semibold">{asset.assetTag}</span> • {asset.model}
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {asset.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
              {myAssignedAssets.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400">
                  No assets currently checked out to your account.
                </div>
              )}
            </div>
          </div>

          {/* My Tickets */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TicketCheck className="h-4 w-4 text-amber-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  My Support Requests ({myTickets.length})
                </h3>
              </div>
              <button
                onClick={() => setCurrentTab('TICKETS')}
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5 font-semibold"
              >
                View All <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-2">
              {myTickets.map((tkt) => (
                <div
                  key={tkt.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5 flex items-center justify-between"
                >
                  <div className="max-w-[70%]">
                    <div className="text-xs font-bold text-slate-900 truncate">{tkt.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {tkt.ticketNumber} • {tkt.category}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                      tkt.status === 'RESOLVED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {tkt.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
              {myTickets.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400">
                  You have no pending helpdesk tickets.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Visual Analytics Bento Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Asset Category Breakdown */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Asset Category Distribution
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">{filteredAssets.length} total</span>
          </div>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 max-h-24 overflow-y-auto">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2 text-xs text-slate-700">
                <div
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                />
                <span className="truncate">{item.name}</span>
                <span className="text-slate-900 ml-auto font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Company Comparison (or Priority Breakdown if single company) */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {activeCompanyFilter === 'ALL'
                  ? 'Multi-Tenant Company Comparison'
                  : `${activeCompanyFilter} Ticket Severity Distribution`}
              </h3>
              <p className="text-[11px] text-slate-500">
                {activeCompanyFilter === 'ALL'
                  ? 'Assets inventory & Help Desk volume across AGIPL, ASSPL, and ONYX Precision'
                  : 'Breakdown of active operational incident tickets by severity'}
              </p>
            </div>
            {activeCompanyFilter === 'ALL' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                3 Portals
              </span>
            )}
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {activeCompanyFilter === 'ALL' ? (
                <BarChart data={companyComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '12px',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="assets" name="Total Assets" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="tickets" name="Total Tickets" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="openTickets" name="Active Open" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="priority" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '12px',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }}
                  />
                  <Bar dataKey="count" name="Tickets Count" radius={[6, 6, 0, 0]}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lower Section: Priority Action Queue & Live Operations Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Priority Action Queue */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Priority Action Queue
              </h3>
            </div>
            <button
              onClick={() => setCurrentTab('TICKETS')}
              className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5 font-semibold cursor-pointer"
            >
              Open Queue <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {openTickets.slice(0, 4).map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setCurrentTab('TICKETS')}
                className="cursor-pointer rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {ticket.ticketNumber}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        ticket.priority === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : ticket.priority === 'HIGH'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {ticket.priority}
                    </span>
                    <span className="text-[10px] text-slate-700 font-semibold px-1.5 py-0.5 rounded bg-slate-200">
                      {ticket.companyCode}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>Due: {new Date(ticket.slaDueTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="mt-1.5 text-xs font-semibold text-slate-900 line-clamp-1">
                  {ticket.title}
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/70">
                  <span>Req: {ticket.requesterName} ({ticket.department})</span>
                  <span>Assignee: {ticket.assignedToName || 'Unassigned'}</span>
                </div>
              </div>
            ))}

            {openTickets.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
                No active tickets in queue. All company systems operational!
              </div>
            )}
          </div>
        </div>

        {/* Live Operations Feed */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Live Operations Feed
            </h3>
            <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Feed
            </span>
          </div>

          <div className="space-y-3.5 overflow-y-auto max-h-80 pr-1">
            {activityLogs
              .filter(
                (log) => activeCompanyFilter === 'ALL' || log.companyCode === 'ALL' || log.companyCode === activeCompanyFilter
              )
              .slice(0, 8)
              .map((log) => (
                <div key={log.id} className="relative pl-4 border-l-2 border-slate-200 text-xs">
                  <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-blue-600" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      {log.performedBy}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{log.details}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
