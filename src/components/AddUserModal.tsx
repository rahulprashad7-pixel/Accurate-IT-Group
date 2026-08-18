import React, { useState } from 'react';
import { X, UserPlus, Building2, Shield, Mail, Phone, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { CompanyCode, Role, SelectedCompanyFilter } from '../types';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, activeCompanyFilter } = useAuth();
  const { addUser, companies } = useData();

  const defaultComp: SelectedCompanyFilter =
    currentUser?.role === 'COMPANY_ADMIN'
      ? currentUser.companyCode
      : activeCompanyFilter !== 'ALL'
      ? activeCompanyFilter
      : 'AGIPL';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyCode, setCompanyCode] = useState<SelectedCompanyFilter>(defaultComp);
  const [role, setRole] = useState<Role>('EMPLOYEE');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !department) return;

    setIsSubmitting(true);
    try {
      const compInfo = companies.find((c) => c.code === companyCode);
      await addUser({
        uid: `manual-${Date.now()}`,
        name,
        email,
        companyCode,
        companyName: compInfo?.name || (companyCode === 'ALL' ? 'All Companies' : companyCode),
        role,
        department,
        designation: designation || 'Staff Member',
        phoneNumber,
        status: 'ACTIVE',
        assignedAssetsCount: 0,
        openTicketsCount: 0,
      });

      onClose();
    } catch (err) {
      console.error('Failed to add user:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="add-user-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Onboard Employee / Staff</h2>
              <p className="text-xs text-slate-500">Add user profile with role-based portal permissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kulkarni"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Work Email *</label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                placeholder="+91 98000 00000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Entity *</label>
              <select
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value as SelectedCompanyFilter)}
                disabled={currentUser?.role === 'COMPANY_ADMIN'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              >
                {companies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.fullName}
                  </option>
                ))}
                {currentUser?.role === 'SUPER_ADMIN' && <option value="ALL">ALL (Group IT Staff)</option>}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Portal Role *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="EMPLOYEE">Employee (Raise Tickets & View Own Gear)</option>
                <option value="IT_STAFF">IT Staff (Manage Inventory & Tickets)</option>
                <option value="COMPANY_ADMIN">Company Admin (Full Unit Control)</option>
                {currentUser?.role === 'SUPER_ADMIN' && (
                  <option value="SUPER_ADMIN">Super Admin (All 3 Entities)</option>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department *</label>
              <input
                type="text"
                required
                placeholder="e.g. Design & R&D"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Designation / Title</label>
              <input
                type="text"
                placeholder="e.g. Senior Aerodynamics Engineer"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              <span>{isSubmitting ? 'Onboarding...' : 'Onboard User'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
