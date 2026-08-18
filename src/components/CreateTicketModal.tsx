import React, { useState } from 'react';
import { X, TicketCheck, AlertCircle, Building2, Laptop, Send, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { TicketCategory, TicketPriority, CompanyCode } from '../types';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, activeCompanyFilter } = useAuth();
  const { createTicket, assets, companies } = useData();

  const defaultComp: CompanyCode =
    currentUser?.role === 'EMPLOYEE' || currentUser?.role === 'COMPANY_ADMIN'
      ? (currentUser.companyCode as CompanyCode)
      : activeCompanyFilter !== 'ALL'
      ? activeCompanyFilter
      : 'AGIPL';

  const [companyCode, setCompanyCode] = useState<CompanyCode>(defaultComp);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>('HARDWARE');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Filter available assets for company / employee
  const relevantAssets = assets.filter((a) => {
    if (currentUser?.role === 'EMPLOYEE') {
      return a.assignedToUserId === currentUser.id || a.assignedToEmail === currentUser.email;
    }
    return a.companyCode === companyCode;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setIsSubmitting(true);
    try {
      const selectedAsset = assets.find((a) => a.id === selectedAssetId);
      const comp = companies.find((c) => c.code === companyCode);

      // Compute SLA deadline based on priority
      const slaHours = priority === 'CRITICAL' ? 1 : priority === 'HIGH' ? 4 : priority === 'MEDIUM' ? 24 : 48;
      const slaDueDate = new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();

      await createTicket({
        title,
        description,
        category,
        priority,
        status: 'OPEN',
        companyCode,
        companyName: comp?.fullName || companyCode,
        department: currentUser?.department || 'General',
        requesterId: currentUser?.id || 'guest',
        requesterName: currentUser?.name || 'Authorized Requester',
        requesterEmail: currentUser?.email || 'user@example.com',
        assetTag: selectedAsset?.assetTag,
        assetName: selectedAsset?.name,
        slaDueTime: slaDueDate,
        slaBreached: false,
      });

      onClose();
    } catch (err) {
      console.error('Failed to create ticket:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="create-ticket-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <TicketCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {currentUser?.role === 'EMPLOYEE' ? 'Raise IT Support Request' : 'Create Help Desk Incident Ticket'}
              </h2>
              <p className="text-xs text-slate-500">
                Guaranteed SLA response from AGIPL, ASSPL & ONYX IT Teams
              </p>
            </div>
          </div>
          <button
            id="close-ticket-modal-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Company & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Entity *</label>
              <select
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value as CompanyCode)}
                disabled={currentUser?.role === 'EMPLOYEE' || currentUser?.role === 'COMPANY_ADMIN'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              >
                {companies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Issue Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="HARDWARE">Hardware Failure / Peripheral</option>
                <option value="SOFTWARE">Software Crash / License Issue</option>
                <option value="NETWORK">Network, Wi-Fi & VPN</option>
                <option value="ACCESS_PERMISSION">Account & Role Permissions</option>
                <option value="EMAIL_CLOUD">Email & Cloud SSO</option>
                <option value="PRINTER">Printer / Label Scanner</option>
                <option value="SECURITY">Security / Suspicious Alert</option>
                <option value="OTHER">Other Operational Request</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Incident Summary / Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Dual monitor flickering and HDMI port disconnected"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Detailed Description & Error Logs *</label>
            <textarea
              rows={3}
              required
              placeholder="Provide exact symptoms, error codes, steps to reproduce, or affected software versions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Priority & Associated Asset */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Urgency / Severity Level *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="CRITICAL">CRITICAL (Production Down • 1h SLA)</option>
                <option value="HIGH">HIGH (Major Impairment • 4h SLA)</option>
                <option value="MEDIUM">MEDIUM (Normal Operational • 24h SLA)</option>
                <option value="LOW">LOW (Minor Inquiry • 48h SLA)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Associated IT Asset (Optional)</label>
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- No Specific Asset --</option>
                {relevantAssets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.assetTag} ({a.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Requester preview badge */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 flex items-center justify-between text-[11px] text-slate-600">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              <span>
                Raising as <strong className="text-slate-800">{currentUser?.name}</strong> ({currentUser?.email})
              </span>
            </div>
            <span className="font-semibold text-blue-600">{currentUser?.department}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              id="submit-create-ticket-btn"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? 'Submitting...' : 'Dispatch Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
