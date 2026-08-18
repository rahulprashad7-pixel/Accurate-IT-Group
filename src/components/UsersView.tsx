import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Shield,
  Building2,
  Mail,
  Phone,
  Laptop,
  TicketCheck,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Role, SelectedCompanyFilter, UserProfile } from '../types';

interface UsersViewProps {
  onOpenAddUserModal: () => void;
  onSelectUserAssets?: (userId: string) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ onOpenAddUserModal, onSelectUserAssets }) => {
  const { currentUser, activeCompanyFilter, loginAsDemoPersona } = useAuth();
  const { users, assets, tickets } = useData();

  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Company scope
      if (currentUser?.role === 'COMPANY_ADMIN') {
        if (user.companyCode !== 'ALL' && user.companyCode !== currentUser.companyCode) {
          return false;
        }
      } else if (activeCompanyFilter !== 'ALL') {
        if (user.companyCode !== 'ALL' && user.companyCode !== activeCompanyFilter) {
          return false;
        }
      }

      if (roleFilter !== 'ALL' && user.role !== roleFilter) {
        return false;
      }

      if (deptFilter !== 'ALL' && user.department !== deptFilter) {
        return false;
      }

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = user.name.toLowerCase().includes(q);
        const matchesEmail = user.email.toLowerCase().includes(q);
        const matchesDept = user.department.toLowerCase().includes(q);
        const matchesDesig = user.designation.toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesDept || matchesDesig;
      }

      return true;
    });
  }, [users, currentUser, activeCompanyFilter, roleFilter, deptFilter, searchQuery]);

  const uniqueDepartments = Array.from(new Set(users.map((u) => u.department)));

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Super Admin (Group)</span>;
      case 'COMPANY_ADMIN':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Company Admin</span>;
      case 'IT_STAFF':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">IT Specialist</span>;
      case 'EMPLOYEE':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Staff Employee</span>;
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Enterprise User Directory & Custody
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              {filteredUsers.length} Users
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-based authorization, IT hardware custody assignments, and employee contact directory.
          </p>
        </div>

        {currentUser?.role !== 'EMPLOYEE' && (
          <button
            onClick={onOpenAddUserModal}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Onboard New User</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name, email, department, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">All Roles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="COMPANY_ADMIN">Company Admin</option>
          <option value="IT_STAFF">IT Staff</option>
          <option value="EMPLOYEE">Staff Employee</option>
        </select>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">All Departments</option>
          {uniqueDepartments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {(roleFilter !== 'ALL' || deptFilter !== 'ALL' || searchQuery) && (
          <button
            onClick={() => {
              setRoleFilter('ALL');
              setDeptFilter('ALL');
              setSearchQuery('');
            }}
            className="text-xs text-blue-600 hover:underline px-1 font-semibold"
          >
            Reset
          </button>
        )}
      </div>

      {/* Users Bento Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const userAssets = assets.filter(
            (a) => a.assignedToUserId === user.id || a.assignedToEmail === user.email
          );
          const userTickets = tickets.filter(
            (t) => t.requesterId === user.id || t.requesterEmail === user.email
          );

          return (
            <div
              key={user.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Profile Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="h-12 w-12 rounded-xl object-cover border border-slate-100 shadow-xs"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 font-bold text-sm border border-blue-100">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{user.name}</h3>
                      <div className="text-[11px] text-slate-500 font-medium">{user.designation}</div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {user.companyCode}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {getRoleBadge(user.role)}
                  <span className="text-[11px] font-medium text-slate-500">• {user.department}</span>
                </div>

                {/* Contact Information */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{user.phoneNumber}</span>
                    </div>
                  )}
                </div>

                {/* Assigned Gear Badges */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Laptop className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold text-slate-800">{userAssets.length}</span>
                    <span className="text-slate-500">Gear Assigned</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-600">
                    <TicketCheck className="h-4 w-4 text-amber-500" />
                    <span className="font-semibold text-slate-800">{userTickets.length}</span>
                    <span className="text-slate-500">Tickets Raised</span>
                  </div>
                </div>
              </div>

              {/* Action Switch to Persona */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active Account
                </span>

                <button
                  onClick={() => loginAsDemoPersona(user.id)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  title="Simulate session as this user"
                >
                  Switch Persona →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
