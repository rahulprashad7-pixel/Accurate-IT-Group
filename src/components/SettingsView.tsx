import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Clock,
  Building2,
  RefreshCw,
  CheckCircle2,
  Database,
  Sliders,
  BellRing,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export const SettingsView: React.FC = () => {
  const { currentUser, isFirebaseConfigured } = useAuth();
  const { resetToDemoData, companies } = useData();

  const [slaCriticalHours, setSlaCriticalHours] = useState(1);
  const [slaHighHours, setSlaHighHours] = useState(4);
  const [slaMediumHours, setSlaMediumHours] = useState(24);
  const [slaLowHours, setSlaLowHours] = useState(48);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = async () => {
    if (confirm('Reset entire environment to initial enterprise baseline data for AGIPL, ASSPL, and ONYX Precision?')) {
      setIsResetting(true);
      await resetToDemoData();
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            System & Enterprise Portal Settings
          </h1>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            Admin Controls
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure SLA target thresholds, notification dispatch rules, and multi-tenant security policies.
        </p>
      </div>

      {savedSuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3 text-emerald-800 text-xs font-semibold">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>SLA policy rules and configuration parameters saved successfully.</span>
        </div>
      )}

      {/* SLA Policies Bento Box */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Help Desk SLA Response Targets</h2>
            <p className="text-xs text-slate-500">Maximum resolution time before SLA violation trigger</p>
          </div>
        </div>

        <form onSubmit={handleSavePolicies} className="mt-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-3.5">
              <span className="font-bold text-rose-700 block mb-1">CRITICAL Priority</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={slaCriticalHours}
                  onChange={(e) => setSlaCriticalHours(Number(e.target.value))}
                  className="w-16 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-slate-800 font-bold focus:outline-none"
                />
                <span className="text-slate-600 font-medium">Hours</span>
              </div>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-orange-50/40 p-3.5">
              <span className="font-bold text-orange-700 block mb-1">HIGH Priority</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={slaHighHours}
                  onChange={(e) => setSlaHighHours(Number(e.target.value))}
                  className="w-16 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-slate-800 font-bold focus:outline-none"
                />
                <span className="text-slate-600 font-medium">Hours</span>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-3.5">
              <span className="font-bold text-amber-700 block mb-1">MEDIUM Priority</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="72"
                  value={slaMediumHours}
                  onChange={(e) => setSlaMediumHours(Number(e.target.value))}
                  className="w-16 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-slate-800 font-bold focus:outline-none"
                />
                <span className="text-slate-600 font-medium">Hours</span>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-3.5">
              <span className="font-bold text-blue-700 block mb-1">LOW Priority</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={slaLowHours}
                  onChange={(e) => setSlaLowHours(Number(e.target.value))}
                  className="w-16 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-slate-800 font-bold focus:outline-none"
                />
                <span className="text-slate-600 font-medium">Hours</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlertsEnabled}
                onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700 font-medium">
                Dispatch automated email notification on critical priority breaches
              </span>
            </label>

            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 shadow-sm"
            >
              Save SLA Policies
            </button>
          </div>
        </form>
      </div>

      {/* Role Permissions Matrix Bento Box */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Role-Based Access Control (RBAC) Matrix</h2>
            <p className="text-xs text-slate-500">Enforced by Firestore Security Rules</p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                <th className="pb-2">Portal Role</th>
                <th className="pb-2">Company Scope</th>
                <th className="pb-2">Asset Privileges</th>
                <th className="pb-2">Ticket Privileges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              <tr>
                <td className="py-2.5 font-bold text-purple-700">Super Admin</td>
                <td className="py-2.5">All 3 (AGIPL, ASSPL, ONYX)</td>
                <td className="py-2.5">Full Create, Edit, Audit, Delete</td>
                <td className="py-2.5">Full Triage, Assign, Resolve, Close</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-blue-700">Company Admin</td>
                <td className="py-2.5">Single Company Unit</td>
                <td className="py-2.5">Full Unit Inventory Control</td>
                <td className="py-2.5">Full Unit Helpdesk Management</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-emerald-700">IT Staff</td>
                <td className="py-2.5">Single Company Unit</td>
                <td className="py-2.5">Update Status, Audit & Tag</td>
                <td className="py-2.5">Claim, Work, Resolve & Comment</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-700">Employee</td>
                <td className="py-2.5">Single Company Unit</td>
                <td className="py-2.5">Read-Only Assigned Assets</td>
                <td className="py-2.5">Raise Tickets & Submit Ratings</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Database State & Demo Reset Bento Box */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 border border-slate-200">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Demo Data & State Re-Seeder</h3>
            <p className="text-xs text-slate-500">
              Restore default mock assets, tickets, and user personas for live testing.
            </p>
          </div>
        </div>

        <button
          onClick={handleResetData}
          disabled={isResetting}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{isResetting ? 'Resetting Data...' : 'Reset to Demo Baseline'}</span>
        </button>
      </div>
    </div>
  );
};
