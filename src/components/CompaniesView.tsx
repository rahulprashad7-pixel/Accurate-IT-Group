import React from 'react';
import {
  Building2,
  Layers,
  Laptop,
  TicketCheck,
  Users,
  MapPin,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { CompanyCode, ViewTab } from '../types';

interface CompaniesViewProps {
  setCurrentTab: (tab: ViewTab) => void;
}

export const CompaniesView: React.FC<CompaniesViewProps> = ({ setCurrentTab }) => {
  const { currentUser, activeCompanyFilter, setActiveCompanyFilter } = useAuth();
  const { companies, assets, tickets, users } = useData();

  const handleSelectCompany = (code: CompanyCode) => {
    setActiveCompanyFilter(code);
    setCurrentTab('DASHBOARD');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Enterprise Company Portals
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              3 Business Units
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-tenant operational architecture for AGIPL, ASSPL, and ONYX Precision Engineering.
          </p>
        </div>

        {currentUser?.role === 'SUPER_ADMIN' && (
          <button
            onClick={() => {
              setActiveCompanyFilter('ALL');
              setCurrentTab('DASHBOARD');
            }}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeCompanyFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Consolidated Group View (All 3)
          </button>
        )}
      </div>

      {/* Bento Cards for Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {companies.map((comp) => {
          const compAssets = assets.filter((a) => a.companyCode === comp.code);
          const compTickets = tickets.filter((t) => t.companyCode === comp.code);
          const compUsers = users.filter((u) => u.companyCode === comp.code);
          const openTktCount = compTickets.filter(
            (t) => t.status !== 'CLOSED' && t.status !== 'RESOLVED'
          ).length;
          const totalVal = compAssets.reduce((sum, a) => sum + (a.purchaseCost || 0), 0);
          const isSelected = activeCompanyFilter === comp.code;

          return (
            <div
              key={comp.id}
              className={`rounded-3xl border transition-all p-6 bg-white shadow-xs flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div>
                {/* Header with color badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-white font-black text-lg shadow-sm"
                      style={{ backgroundColor: comp.logoColor }}
                    >
                      {comp.code}
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900 text-base">{comp.fullName}</h2>
                      <span className="text-xs font-semibold text-slate-500">{comp.industry}</span>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Active Scope
                    </span>
                  )}
                </div>

                {/* KPI Metrics Bento Grid Inside Card */}
                <div className="grid grid-cols-3 gap-2.5 mt-5">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-center">
                    <div className="text-[11px] text-slate-500 font-medium">IT Assets</div>
                    <div className="text-base font-bold text-slate-900 mt-0.5">{compAssets.length}</div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-center">
                    <div className="text-[11px] text-slate-500 font-medium">Active Tickets</div>
                    <div className="text-base font-bold text-amber-600 mt-0.5">{openTktCount}</div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-center">
                    <div className="text-[11px] text-slate-500 font-medium">Employees</div>
                    <div className="text-base font-bold text-slate-900 mt-0.5">{compUsers.length}</div>
                  </div>
                </div>

                {/* Company Details */}
                <div className="mt-5 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="truncate">{comp.headquarters}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{comp.contactEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{comp.contactPhone}</span>
                  </div>
                </div>

                {/* Departments Pills */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500 mb-2">Operating Departments</div>
                  <div className="flex flex-wrap gap-1.5">
                    {comp.departments.map((dept) => (
                      <span
                        key={dept}
                        className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                      >
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  Inventory: <strong className="text-slate-800">${(totalVal / 1000).toFixed(1)}k USD</strong>
                </div>

                <button
                  onClick={() => handleSelectCompany(comp.code)}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition-all cursor-pointer"
                >
                  <span>Enter {comp.code} Hub</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
