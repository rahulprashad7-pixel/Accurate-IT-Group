import React, { useState, useMemo } from 'react';
import {
  Laptop,
  Search,
  Filter,
  Plus,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Download,
  Eye,
  Trash2,
  UserCheck,
  Building2,
  Layers,
  Sparkles,
  Server,
  HardDrive,
  Cpu,
  Monitor,
  Printer,
  Shield,
  Clock,
  Smartphone,
  Key,
  HelpCircle,
  FileSpreadsheet,
  RotateCcw,
  Tag,
  MapPin,
  User,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Asset, AssetCategory, AssetStatus, AssetCondition, CompanyCode } from '../types';
import { AssetQRModal } from './AssetQRModal';
import { AssignAssetModal } from './AssignAssetModal';
import { ExportAssetsModal } from './ExportAssetsModal';

interface AssetManagementViewProps {
  onOpenAddModal: () => void;
  onSelectAsset: (asset: Asset) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const AssetManagementView: React.FC<AssetManagementViewProps> = ({
  onOpenAddModal,
  onSelectAsset,
  searchQuery,
  setSearchQuery,
}) => {
  const { currentUser, activeCompanyFilter, setActiveCompanyFilter } = useAuth();
  const { assets, users, deleteAsset, auditAsset } = useData();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [conditionFilter, setConditionFilter] = useState<string>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');

  // Modals state
  const [qrAsset, setQrAsset] = useState<Asset | null>(null);
  const [assignModalAsset, setAssignModalAsset] = useState<Asset | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Extract distinct locations and assignees for dynamic filter dropdowns
  const availableLocations = useMemo(() => {
    const locs = new Set<string>();
    assets.forEach(a => {
      if (a.location) locs.add(a.location);
    });
    return Array.from(locs);
  }, [assets]);

  const availableAssignees = useMemo(() => {
    const list: { id: string; name: string }[] = [];
    const seen = new Set<string>();
    assets.forEach(a => {
      if (a.assignedToUserId && a.assignedToName && !seen.has(a.assignedToUserId)) {
        seen.add(a.assignedToUserId);
        list.push({ id: a.assignedToUserId, name: a.assignedToName });
      }
    });
    return list;
  }, [assets]);

  // Filter logic
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // Role scope check
      if (currentUser?.role === 'EMPLOYEE') {
        if (asset.assignedToUserId !== currentUser.id && asset.assignedToEmail !== currentUser.email) {
          return false;
        }
      } else if (currentUser?.role === 'COMPANY_ADMIN') {
        if (asset.companyCode !== currentUser.companyCode) {
          return false;
        }
      } else if (activeCompanyFilter !== 'ALL') {
        if (asset.companyCode !== activeCompanyFilter) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== 'ALL' && asset.category !== categoryFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'ASSIGNED') {
          if (asset.status !== 'ASSIGNED' && asset.status !== 'IN_USE') return false;
        } else if (statusFilter === 'UNDER_REPAIR') {
          if (asset.status !== 'UNDER_REPAIR' && asset.status !== 'UNDER_MAINTENANCE') return false;
        } else if (asset.status !== statusFilter) {
          return false;
        }
      }

      // Condition filter
      if (conditionFilter !== 'ALL' && asset.condition !== conditionFilter) {
        return false;
      }

      // Location filter
      if (locationFilter !== 'ALL' && asset.location !== locationFilter) {
        return false;
      }

      // Assignee filter
      if (assigneeFilter !== 'ALL') {
        if (assigneeFilter === 'UNASSIGNED') {
          if (asset.assignedToUserId || asset.assignedToName) return false;
        } else if (asset.assignedToUserId !== assigneeFilter) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTag = (asset.assetTag || '').toLowerCase().includes(q);
        const matchesName = (asset.name || '').toLowerCase().includes(q);
        const matchesSerial = (asset.serialNumber || '').toLowerCase().includes(q);
        const matchesModel = (asset.model || '').toLowerCase().includes(q);
        const matchesVendor = (asset.vendor || '').toLowerCase().includes(q);
        const matchesUser = (asset.assignedToName || '').toLowerCase().includes(q);
        const matchesDept = (asset.department || '').toLowerCase().includes(q);
        const matchesLoc = (asset.location || '').toLowerCase().includes(q);
        return (
          matchesTag ||
          matchesName ||
          matchesSerial ||
          matchesModel ||
          matchesVendor ||
          matchesUser ||
          matchesDept ||
          matchesLoc
        );
      }

      return true;
    });
  }, [
    assets,
    currentUser,
    activeCompanyFilter,
    categoryFilter,
    statusFilter,
    conditionFilter,
    locationFilter,
    assigneeFilter,
    searchQuery,
  ]);

  // Dashboard summary metrics for currently visible scope
  const summaryMetrics = useMemo(() => {
    const scopedAssets = assets.filter(asset => {
      if (currentUser?.role === 'COMPANY_ADMIN') return asset.companyCode === currentUser.companyCode;
      if (activeCompanyFilter !== 'ALL') return asset.companyCode === activeCompanyFilter;
      return true;
    });

    const total = scopedAssets.length;
    const available = scopedAssets.filter(a => a.status === 'AVAILABLE').length;
    const assigned = scopedAssets.filter(a => a.status === 'ASSIGNED' || a.status === 'IN_USE').length;
    const underRepair = scopedAssets.filter(
      a => a.status === 'UNDER_REPAIR' || a.status === 'UNDER_MAINTENANCE'
    ).length;
    const retired = scopedAssets.filter(a => a.status === 'RETIRED').length;
    const lost = scopedAssets.filter(a => a.status === 'LOST').length;

    const totalCost = scopedAssets.reduce((acc, a) => acc + (Number(a.purchaseCost) || 0), 0);

    // Expiring within 90 days
    const now = new Date();
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;
    const expiringSoon = scopedAssets.filter(a => {
      if (!a.warrantyExpiry) return false;
      const exp = new Date(a.warrantyExpiry).getTime();
      return exp > now.getTime() && exp - now.getTime() <= ninetyDays;
    }).length;

    return {
      total,
      available,
      assigned,
      underRepair,
      retired,
      lost,
      totalCost,
      expiringSoon,
    };
  }, [assets, currentUser, activeCompanyFilter]);

  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case 'IN_USE':
      case 'ASSIGNED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            ASSIGNED
          </span>
        );
      case 'AVAILABLE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            AVAILABLE
          </span>
        );
      case 'UNDER_MAINTENANCE':
      case 'UNDER_REPAIR':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            UNDER REPAIR
          </span>
        );
      case 'LOST':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            LOST
          </span>
        );
      case 'RETIRED':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            RETIRED
          </span>
        );
    }
  };

  const getCategoryIcon = (category: AssetCategory) => {
    switch (category) {
      case 'LAPTOP':
        return <Laptop className="h-4 w-4 text-blue-600" />;
      case 'DESKTOP':
        return <Monitor className="h-4 w-4 text-indigo-600" />;
      case 'PRINTER':
        return <Printer className="h-4 w-4 text-pink-600" />;
      case 'SERVER':
        return <Server className="h-4 w-4 text-purple-600" />;
      case 'NETWORKING':
        return <Cpu className="h-4 w-4 text-emerald-600" />;
      case 'MOBILE':
        return <Smartphone className="h-4 w-4 text-cyan-600" />;
      case 'SOFTWARE_LICENSE':
        return <Key className="h-4 w-4 text-amber-600" />;
      case 'MONITOR':
        return <Monitor className="h-4 w-4 text-blue-500" />;
      default:
        return <HardDrive className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* 1. Top Title & Quick Actions Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              {currentUser?.role === 'EMPLOYEE' ? 'My Assigned Corporate IT Assets' : 'IT Asset Management'}
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {filteredAssets.length} Visible
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise hardware registry, employee custody handovers, barcode tagging, and warranty tracking across AGIPL, ASSPL, and ONYX Precision.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {currentUser?.role !== 'EMPLOYEE' && (
            <>
              <button
                id="open-export-assets-modal-btn"
                onClick={() => setIsExportOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                <span>Export (CSV / PDF)</span>
              </button>

              <button
                id="add-new-asset-top-btn"
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Register New Asset</span>
              </button>
            </>
          )}

          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              id="view-table-mode-btn"
              onClick={() => setViewMode('TABLE')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'TABLE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Table View
            </button>
            <button
              id="view-cards-mode-btn"
              onClick={() => setViewMode('CARDS')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'CARDS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Grid View
            </button>
          </div>
        </div>
      </div>

      {/* 2. Asset Dashboard Summary Bento Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Assets */}
        <div
          onClick={() => {
            setStatusFilter('ALL');
            setCategoryFilter('ALL');
          }}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs cursor-pointer hover:border-blue-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Assets</span>
            <Laptop className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{summaryMetrics.total}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            ${summaryMetrics.totalCost.toLocaleString()} USD valuation
          </div>
        </div>

        {/* Available in Stock */}
        <div
          onClick={() => setStatusFilter('AVAILABLE')}
          className={`rounded-2xl border p-4 shadow-2xs cursor-pointer transition-all ${
            statusFilter === 'AVAILABLE'
              ? 'border-emerald-500 bg-emerald-50/50'
              : 'border-slate-200 bg-white hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Available</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700">{summaryMetrics.available}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">In IT Inventory</div>
        </div>

        {/* Assigned to Employees */}
        <div
          onClick={() => setStatusFilter('ASSIGNED')}
          className={`rounded-2xl border p-4 shadow-2xs cursor-pointer transition-all ${
            statusFilter === 'ASSIGNED'
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-slate-200 bg-white hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Assigned</span>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-blue-700">{summaryMetrics.assigned}</div>
          <div className="text-[10px] text-blue-600 mt-0.5">Active Employee Custody</div>
        </div>

        {/* Under Repair */}
        <div
          onClick={() => setStatusFilter('UNDER_REPAIR')}
          className={`rounded-2xl border p-4 shadow-2xs cursor-pointer transition-all ${
            statusFilter === 'UNDER_REPAIR'
              ? 'border-amber-500 bg-amber-50/50'
              : 'border-slate-200 bg-white hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Under Repair</span>
            <Wrench className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-700">{summaryMetrics.underRepair}</div>
          <div className="text-[10px] text-amber-600 mt-0.5">In Service / RMA</div>
        </div>

        {/* Lost / Missing */}
        <div
          onClick={() => setStatusFilter('LOST')}
          className={`rounded-2xl border p-4 shadow-2xs cursor-pointer transition-all ${
            statusFilter === 'LOST'
              ? 'border-rose-500 bg-rose-50/50'
              : 'border-slate-200 bg-white hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Lost / Missing</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-700">{summaryMetrics.lost}</div>
          <div className="text-[10px] text-rose-600 mt-0.5">Investigation Flagged</div>
        </div>

        {/* Retired / Decommissioned */}
        <div
          onClick={() => setStatusFilter('RETIRED')}
          className={`rounded-2xl border p-4 shadow-2xs cursor-pointer transition-all ${
            statusFilter === 'RETIRED'
              ? 'border-slate-500 bg-slate-100'
              : 'border-slate-200 bg-white hover:border-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Retired</span>
            <HardDrive className="h-4 w-4 text-slate-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-700">{summaryMetrics.retired}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Scrapped / Donated</div>
        </div>
      </div>

      {/* 3. Multi-Company & Category Quick Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Company Selector Pills */}
          {currentUser?.role === 'SUPER_ADMIN' && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-500 mr-1">Company:</span>
              {(['ALL', 'AGIPL', 'ASSPL', 'ONYX'] as const).map(code => (
                <button
                  key={code}
                  onClick={() => setActiveCompanyFilter(code)}
                  className={`rounded-xl px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                    activeCompanyFilter === code
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {code === 'ALL'
                    ? 'All 3 Companies'
                    : code === 'AGIPL'
                    ? 'AGIPL'
                    : code === 'ASSPL'
                    ? 'ASSPL'
                    : 'ONYX Precision'}
                </button>
              ))}
            </div>
          )}

          {/* Warranty Warning Banner Chip */}
          {summaryMetrics.expiringSoon > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              <span>{summaryMetrics.expiringSoon} assets have warranties expiring in next 90 days</span>
            </div>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-bold mr-1 shrink-0">Type:</span>
          {[
            { id: 'ALL', label: 'All Types' },
            { id: 'LAPTOP', label: 'Laptops' },
            { id: 'DESKTOP', label: 'Desktops' },
            { id: 'PRINTER', label: 'Printers' },
            { id: 'SERVER', label: 'Servers' },
            { id: 'NETWORKING', label: 'Network Devices' },
            { id: 'MOBILE', label: 'Mobiles' },
            { id: 'SOFTWARE_LICENSE', label: 'Software Licenses' },
            { id: 'OTHER', label: 'Other' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`rounded-xl px-3 py-1 font-medium transition-all shrink-0 cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Comprehensive Search & Filter Controls Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-wrap items-center gap-3">
        {/* Full Text Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            id="asset-table-search-input"
            placeholder="Search by tag (e.g. AGIPL-LT-101), serial, model, vendor, location, or employee..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>

        {/* Status Dropdown */}
        <select
          id="status-filter-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="AVAILABLE">Available (In Stock)</option>
          <option value="ASSIGNED">Assigned (In Custody)</option>
          <option value="UNDER_REPAIR">Under Repair / RMA</option>
          <option value="LOST">Lost / Missing</option>
          <option value="RETIRED">Retired</option>
        </select>

        {/* Location Dropdown */}
        <select
          id="location-filter-select"
          value={locationFilter}
          onChange={e => setLocationFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">All Locations</option>
          {availableLocations.map(loc => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        {/* Assigned Employee Dropdown */}
        <select
          id="assignee-filter-select"
          value={assigneeFilter}
          onChange={e => setAssigneeFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">All Employees</option>
          <option value="UNASSIGNED">-- Unassigned (In Inventory) --</option>
          {availableAssignees.map(u => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        {/* Reset Filters button */}
        {(categoryFilter !== 'ALL' ||
          statusFilter !== 'ALL' ||
          locationFilter !== 'ALL' ||
          assigneeFilter !== 'ALL' ||
          searchQuery) && (
          <button
            onClick={() => {
              setCategoryFilter('ALL');
              setStatusFilter('ALL');
              setLocationFilter('ALL');
              setAssigneeFilter('ALL');
              setSearchQuery('');
            }}
            className="text-xs text-blue-600 font-semibold hover:underline px-2 cursor-pointer"
          >
            Reset All
          </button>
        )}
      </div>

      {/* 5. Main Content: Table or Grid View */}
      {viewMode === 'TABLE' ? (
        <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Asset Tag & Specifications</th>
                  <th className="px-3 py-3.5">Company</th>
                  <th className="px-3 py-3.5">Type</th>
                  <th className="px-3 py-3.5">Status</th>
                  <th className="px-3 py-3.5">Assigned Employee</th>
                  <th className="px-3 py-3.5">Location & Dept</th>
                  <th className="px-3 py-3.5">Vendor & Warranty</th>
                  <th className="px-5 py-3.5 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssets.map(asset => (
                  <tr
                    key={asset.id}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => onSelectAsset(asset)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-slate-100 p-2 text-slate-700 border border-slate-200/60 shrink-0">
                          {getCategoryIcon(asset.category)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="font-mono text-blue-600">{asset.assetTag}</span>
                            <span>•</span>
                            <span className="truncate max-w-[200px]">{asset.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            SN: <span className="text-slate-700 font-bold">{asset.serialNumber}</span> • {asset.manufacturer} {asset.model}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {asset.companyCode}
                      </span>
                    </td>

                    <td className="px-3 py-3.5">
                      <span className="text-slate-700 font-medium">
                        {asset.category.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-3 py-3.5">{getStatusBadge(asset.status)}</td>

                    <td className="px-3 py-3.5">
                      {asset.assignedToName ? (
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1">
                            <User className="h-3 w-3 text-slate-400" />
                            <span>{asset.assignedToName}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                            {asset.assignedToEmail || asset.department}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic font-medium">Available (In Stock)</span>
                      )}
                    </td>

                    <td className="px-3 py-3.5">
                      <div className="text-slate-800 font-medium truncate max-w-[140px] flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{asset.location}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{asset.department}</div>
                    </td>

                    <td className="px-3 py-3.5">
                      <div className="text-slate-800 font-medium truncate max-w-[120px]">
                        {asset.vendor || 'Direct Purchase'}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>Exp: {asset.warrantyExpiry}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {/* Assign Button */}
                        {currentUser?.role !== 'EMPLOYEE' && (
                          <button
                            id={`assign-asset-${asset.id}`}
                            onClick={() => setAssignModalAsset(asset)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                            title={asset.assignedToName ? 'Transfer Custody' : 'Assign to Employee'}
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}

                        {/* Barcode & QR Label */}
                        <button
                          id={`qr-asset-${asset.id}`}
                          onClick={() => setQrAsset(asset)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          title="Generate Hardware Barcode & QR Tag"
                        >
                          <QrCode className="h-4 w-4" />
                        </button>

                        {/* Detail / Edit View */}
                        <button
                          id={`view-asset-${asset.id}`}
                          onClick={() => onSelectAsset(asset)}
                          className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View Full Asset Specifications"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredAssets.length === 0 && (
              <div className="py-16 text-center text-xs text-slate-400">
                <Laptop className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No IT assets match the current filter criteria.</p>
                <p className="text-slate-400 mt-1">Try resetting search filters or company selection.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Bento Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map(asset => (
            <div
              key={asset.id}
              onClick={() => onSelectAsset(asset)}
              className="cursor-pointer rounded-3xl border border-slate-200 bg-white p-5 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {asset.assetTag}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {asset.companyCode}
                    </span>
                  </div>
                  {getStatusBadge(asset.status)}
                </div>

                <h3 className="mt-3 text-sm font-bold text-slate-900">{asset.name}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  {asset.manufacturer} {asset.model} • SN: {asset.serialNumber}
                </p>

                {asset.specifications && (
                  <p className="mt-2.5 text-[11px] text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    {asset.specifications}
                  </p>
                )}

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Vendor</span>
                    <span className="font-semibold text-slate-800 truncate block">{asset.vendor || 'Direct'}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Warranty</span>
                    <span className="font-semibold text-slate-800 truncate block">{asset.warrantyExpiry}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">Assigned To:</div>
                  <div className="font-bold text-slate-900">
                    {asset.assignedToName || 'Unassigned'}
                  </div>
                </div>

                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setQrAsset(asset)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                    title="Print QR Tag"
                  >
                    <QrCode className="h-4 w-4" />
                  </button>
                  {currentUser?.role !== 'EMPLOYEE' && (
                    <button
                      onClick={() => setAssignModalAsset(asset)}
                      className="p-1.5 text-emerald-600 hover:text-emerald-800 rounded-lg hover:bg-emerald-50"
                      title="Assign Custody"
                    >
                      <UserCheck className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Barcode & QR Label View */}
      <AssetQRModal
        asset={qrAsset}
        isOpen={!!qrAsset}
        onClose={() => setQrAsset(null)}
      />

      {/* Modal: Assign Custody */}
      <AssignAssetModal
        asset={assignModalAsset}
        isOpen={!!assignModalAsset}
        onClose={() => setAssignModalAsset(null)}
      />

      {/* Modal: Export Assets Manifest */}
      <ExportAssetsModal
        assets={filteredAssets}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        activeCompanyTitle={
          activeCompanyFilter === 'ALL'
            ? 'All Companies Group'
            : activeCompanyFilter === 'AGIPL'
            ? 'AGIPL Industries'
            : activeCompanyFilter === 'ASSPL'
            ? 'ASSPL Solutions'
            : 'ONYX Precision Mfg'
        }
      />
    </div>
  );
};
