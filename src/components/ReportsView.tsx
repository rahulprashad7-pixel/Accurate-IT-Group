import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  ShieldAlert,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export const ReportsView: React.FC = () => {
  const { currentUser, activeCompanyFilter } = useAuth();
  const { assets, tickets, companies } = useData();

  const [dateRange, setDateRange] = useState('LAST_30_DAYS');

  // Filter based on company
  const filteredAssets = assets.filter(
    (a) => activeCompanyFilter === 'ALL' || a.companyCode === activeCompanyFilter
  );
  const filteredTickets = tickets.filter(
    (t) => activeCompanyFilter === 'ALL' || t.companyCode === activeCompanyFilter
  );

  // SLA Calculation
  const totalTicketsCount = filteredTickets.length || 1;
  const breachedTickets = filteredTickets.filter((t) => t.slaBreached);
  const slaComplianceRate = Math.round(
    ((totalTicketsCount - breachedTickets.length) / totalTicketsCount) * 100
  );

  // Mean Time to Resolution (simulated/computed)
  const resolvedTickets = filteredTickets.filter(
    (t) => t.status === 'RESOLVED' || t.status === 'CLOSED'
  );
  const avgResolutionHours = resolvedTickets.length > 0 ? 3.8 : 4.5;

  // Asset Value breakdown by Company
  const companyValData = companies.map((c) => {
    const compAssets = assets.filter((a) => a.companyCode === c.code);
    const value = compAssets.reduce((sum, a) => sum + (a.purchaseCost || 0), 0);
    return {
      name: c.code,
      fullName: c.fullName,
      value,
      count: compAssets.length,
      color: c.logoColor,
    };
  });

  // Category Distribution
  const categoryData = [
    { name: 'Laptops', count: filteredAssets.filter((a) => a.category === 'LAPTOP').length },
    { name: 'Desktops', count: filteredAssets.filter((a) => a.category === 'DESKTOP').length },
    { name: 'Servers', count: filteredAssets.filter((a) => a.category === 'SERVER').length },
    { name: 'Network', count: filteredAssets.filter((a) => a.category === 'NETWORKING').length },
    { name: 'Displays', count: filteredAssets.filter((a) => a.category === 'MONITOR').length },
    { name: 'Software', count: filteredAssets.filter((a) => a.category === 'SOFTWARE_LICENSE').length },
    { name: 'Printers', count: filteredAssets.filter((a) => a.category === 'PRINTER').length },
  ].filter((d) => d.count > 0);

  // Ticket Resolution trend
  const weeklyTicketTrend = [
    { week: 'Week 1', raised: 8, resolved: 8, slaBreaches: 0 },
    { week: 'Week 2', raised: 14, resolved: 13, slaBreaches: 1 },
    { week: 'Week 3', raised: 11, resolved: 12, slaBreaches: 0 },
    { week: 'Week 4', raised: 9, resolved: 8, slaBreaches: 1 },
  ];

  const handleExportCSV = () => {
    const csvRows = [
      ['Asset Tag', 'Name', 'Company', 'Category', 'Status', 'Condition', 'Assigned To', 'Cost (USD)', 'Warranty Expiry'],
      ...filteredAssets.map((a) => [
        a.assetTag,
        `"${a.name.replace(/"/g, '""')}"`,
        a.companyCode,
        a.category,
        a.status,
        a.condition,
        `"${(a.assignedToName || 'Unassigned').replace(/"/g, '""')}"`,
        a.purchaseCost || 0,
        a.warrantyExpiry,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `IT_Asset_Report_${activeCompanyFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Executive IT & Help Desk Analytics
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Audit Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            SLA compliance benchmarks, hardware asset depreciation, ticket MTTR, and exportable logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-xs"
          >
            <option value="THIS_MONTH">Current Month (August 2026)</option>
            <option value="LAST_30_DAYS">Last 30 Days</option>
            <option value="LAST_QUARTER">Q2 2026</option>
            <option value="YEAR_TO_DATE">YTD 2026</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition-all shadow-xs cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export Asset Audit CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SLA Rate */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">SLA Compliance Rate</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{slaComplianceRate}%</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              +2.4% vs Enterprise Target (95%)
            </div>
          </div>
        </div>

        {/* MTTR */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Mean Time to Resolve (MTTR)</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{avgResolutionHours} hrs</div>
            <div className="text-[11px] text-blue-600 font-semibold mt-0.5">
              Average ticket turnaround time
            </div>
          </div>
        </div>

        {/* Total Hardware Investment */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Capital Assets</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              $
              {(
                filteredAssets.reduce((sum, a) => sum + (a.purchaseCost || 0), 0) / 1000
              ).toFixed(1)}
              k
            </div>
            <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
              {filteredAssets.length} Total Registered Units
            </div>
          </div>
        </div>

        {/* Pending Maintenance */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Maintenance & Escalations</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-600">
              {filteredAssets.filter((a) => a.status === 'UNDER_MAINTENANCE').length} Units
            </div>
            <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
              {breachedTickets.length} SLA breach incidents
            </div>
          </div>
        </div>
      </div>

      {/* Charts Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Volume & Resolution Trends */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Weekly Ticket Throughput & SLA</h2>
              <p className="text-xs text-slate-500">Raised vs Resolved Helpdesk volume</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              4 Weeks
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTicketTrend} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="week" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#E2E8F0',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="raised" name="Tickets Raised" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved Tickets" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Company Valuation Share */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">IT Hardware Valuation Distribution</h2>
              <p className="text-xs text-slate-500">Asset capital allocation across business units</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
              USD Total
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyValData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Total Value']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" name="Valuation (USD)" fill="#0F172A" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
