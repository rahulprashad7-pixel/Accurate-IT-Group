import React, { useState } from 'react';
import { X, UserCheck, Building2, MapPin, Calendar, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Asset, UserProfile } from '../types';

interface AssignAssetModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onAssigned?: (assetId: string, userId: string) => void;
}

export const AssignAssetModal: React.FC<AssignAssetModalProps> = ({
  asset,
  isOpen,
  onClose,
  onAssigned,
}) => {
  const { currentUser } = useAuth();
  const { users, assignAsset, returnAsset } = useData();

  const [selectedUserId, setSelectedUserId] = useState<string>(asset?.assignedToUserId || '');
  const [handoverNotes, setHandoverNotes] = useState<string>('');
  const [location, setLocation] = useState<string>(asset?.location || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !asset) return null;

  // Filter users eligible for this asset (same company or Super Admin)
  const eligibleUsers = users.filter(
    u => u.companyCode === 'ALL' || u.companyCode === asset.companyCode
  );

  const selectedUser: UserProfile | undefined = users.find(u => u.id === selectedUserId);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setErrorMsg('Please select an employee to assign this asset.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await assignAsset(asset.id, selectedUserId, handoverNotes, location);
      if (onAssigned) {
        onAssigned(asset.id, selectedUserId);
      }
      onClose();
    } catch (err) {
      console.error('Error assigning asset:', err);
      setErrorMsg('Failed to assign asset. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckInToStock = async () => {
    if (!window.confirm(`Are you sure you want to return ${asset.name} (${asset.assetTag}) back to inventory stock?`)) {
      return;
    }
    setIsSubmitting(true);
    try {
      await returnAsset(asset.id, 'GOOD', handoverNotes || 'Checked back into available stock by IT Lead.');
      onClose();
    } catch (err) {
      console.error('Error checking in asset:', err);
      setErrorMsg('Failed to return asset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="assign-asset-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all my-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Assign Asset Custody</h2>
              <p className="text-xs text-slate-500">Transfer hardware responsibility to corporate employee</p>
            </div>
          </div>
          <button
            id="close-assign-asset-modal-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Asset Summary Pill */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-3 flex items-center justify-between text-xs">
          <div>
            <span className="font-mono text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              {asset.assetTag}
            </span>
            <div className="font-semibold text-slate-900 mt-1">{asset.name}</div>
            <div className="text-slate-500 text-[11px]">{asset.manufacturer} {asset.model} • S/N: {asset.serialNumber}</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Company</span>
            <div className="font-bold text-slate-800">{asset.companyCode}</div>
          </div>
        </div>

        {asset.assignedToName && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3 flex items-start gap-2.5 text-xs text-amber-800">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Currently Assigned to:</p>
              <p className="text-[11px]">{asset.assignedToName} ({asset.assignedToEmail || asset.department})</p>
              <button
                type="button"
                id="unassign-asset-quick-btn"
                onClick={handleCheckInToStock}
                disabled={isSubmitting}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-200/80 hover:bg-amber-300 px-2.5 py-1 rounded-lg transition-colors"
              >
                Return to Stock (Unassign)
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAssign} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Assignee (Employee) *
            </label>
            <select
              id="select-assignee-employee-input"
              value={selectedUserId}
              onChange={e => setSelectedUserId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              required
            >
              <option value="">-- Choose Employee ({asset.companyCode}) --</option>
              {eligibleUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.designation} ({u.department})
                </option>
              ))}
            </select>
          </div>

          {selectedUser && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-xs text-slate-700 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                {selectedUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 truncate">{selectedUser.name}</div>
                <div className="text-slate-500 text-[11px] truncate">{selectedUser.email} • {selectedUser.department}</div>
              </div>
              <span className="text-[10px] bg-white border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {selectedUser.role.replace('_', ' ')}
              </span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Physical Location / Workspace
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                id="assign-asset-location-input"
                placeholder="e.g. Pune Tech Center, Desk 304"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Handover & Custody Notes
            </label>
            <textarea
              id="assign-asset-handover-notes"
              rows={2}
              placeholder="e.g. Issued with power adapter, HDMI cable, laptop sleeve, and verified BitLocker encryption keys."
              value={handoverNotes}
              onChange={e => setHandoverNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="confirm-assign-asset-btn"
              disabled={isSubmitting || !selectedUserId}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isSubmitting ? 'Transferring Custody...' : 'Confirm Assignment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
