import React, { useState } from 'react';
import {
  X,
  Laptop,
  CheckCircle2,
  Calendar,
  DollarSign,
  User,
  Building2,
  QrCode,
  Shield,
  Clock,
  Trash2,
  Edit3,
  HardDrive,
  Cpu,
  MapPin,
  FileCheck,
  UserCheck,
  RotateCcw,
  Ticket,
  AlertTriangle,
  History,
  Info,
  Check,
  Tag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Asset, AssetStatus, AssetCondition, AssetCategory } from '../types';

interface AssetDetailModalProps {
  asset: Asset | null;
  onClose: () => void;
  onOpenQR: (asset: Asset) => void;
  onOpenAssign?: (asset: Asset) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  onClose,
  onOpenQR,
  onOpenAssign,
}) => {
  const { currentUser } = useAuth();
  const { updateAsset, deleteAsset, auditAsset, returnAsset, users, tickets } = useData();

  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'tickets'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<AssetStatus>(asset?.status || 'AVAILABLE');
  const [condition, setCondition] = useState<AssetCondition>(asset?.condition || 'EXCELLENT');
  const [location, setLocation] = useState(asset?.location || '');
  const [vendor, setVendor] = useState(asset?.vendor || '');
  const [department, setDepartment] = useState(asset?.department || '');
  const [notes, setNotes] = useState(asset?.notes || '');
  const [auditNotes, setAuditNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!asset) return null;

  // Filter tickets linked to this asset
  const linkedTickets = tickets.filter(
    t => t.assetTag === asset.assetTag || t.id.includes(asset.id)
  );

  // Warranty status calculation
  const today = new Date();
  const warrantyDate = new Date(asset.warrantyExpiry);
  const diffDays = Math.ceil((warrantyDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isWarrantyExpired = diffDays < 0;
  const isWarrantyExpiringSoon = diffDays >= 0 && diffDays <= 90;

  const handleSaveUpdates = async () => {
    setIsSubmitting(true);
    try {
      await updateAsset(asset.id, {
        status,
        condition,
        location,
        vendor: vendor || undefined,
        department,
        notes: notes || undefined,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update asset:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePerformAudit = async () => {
    await auditAsset(asset.id, auditNotes || 'Physical serial number and operational status verified.');
    setAuditNotes('');
  };

  const handleCheckInToStock = async () => {
    if (confirm(`Check ${asset.name} (${asset.assetTag}) back into available inventory stock?`)) {
      await returnAsset(asset.id, condition, 'Returned from employee custody into IT stock.');
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to decommission and delete asset ${asset.assetTag}? This action will remove it from the active database.`)) {
      await deleteAsset(asset.id);
      onClose();
    }
  };

  return (
    <div
      id="asset-detail-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 font-mono font-bold">
              {asset.category.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {asset.assetTag}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {asset.companyCode}
                </span>
                {/* Status Badge */}
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    asset.status === 'AVAILABLE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : asset.status === 'ASSIGNED' || asset.status === 'IN_USE'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : asset.status === 'UNDER_REPAIR' || asset.status === 'UNDER_MAINTENANCE'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : asset.status === 'LOST'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {asset.status.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">{asset.name}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="open-qr-from-detail-btn"
              onClick={() => onOpenQR(asset)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              title="Print Industrial QR & Barcode Tag"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>QR Tag</span>
            </button>
            <button
              id="close-detail-modal-btn"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-100 pt-3 text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 px-2.5 transition-colors border-b-2 font-semibold ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Asset Specifications & Custody
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 px-2.5 transition-colors border-b-2 font-semibold flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Audit Trail & History ({asset.history?.length || 1})</span>
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`pb-2 px-2.5 transition-colors border-b-2 font-semibold flex items-center gap-1.5 ${
              activeTab === 'tickets'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Ticket className="h-3.5 w-3.5" />
            <span>Linked Tickets ({linkedTickets.length})</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="mt-4 space-y-4 text-xs">
            {/* Bento Metric Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
                <div className="text-[11px] font-medium text-slate-500">Condition</div>
                <div className="mt-0.5 font-bold text-emerald-600 capitalize">{asset.condition}</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
                <div className="text-[11px] font-medium text-slate-500">Purchase Value</div>
                <div className="mt-0.5 font-bold text-slate-900">
                  ${asset.purchaseCost?.toLocaleString()} {asset.currency || 'USD'}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
                <div className="text-[11px] font-medium text-slate-500">Purchase Date</div>
                <div className="mt-0.5 font-bold text-slate-800">{asset.purchaseDate || 'N/A'}</div>
              </div>

              <div
                className={`rounded-xl border p-2.5 ${
                  isWarrantyExpired
                    ? 'border-rose-200 bg-rose-50/60'
                    : isWarrantyExpiringSoon
                    ? 'border-amber-200 bg-amber-50/60'
                    : 'border-blue-100 bg-blue-50/40'
                }`}
              >
                <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
                  <span>Warranty Expiry</span>
                  {isWarrantyExpired && <span className="text-[9px] font-bold text-rose-700 uppercase">Expired</span>}
                  {isWarrantyExpiringSoon && <span className="text-[9px] font-bold text-amber-700 uppercase">Soon</span>}
                </div>
                <div className={`mt-0.5 font-bold ${isWarrantyExpired ? 'text-rose-700' : 'text-slate-900'}`}>
                  {asset.warrantyExpiry}
                </div>
              </div>
            </div>

            {/* Hardware & Custody Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Technical Specifications */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2">
                <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Cpu className="h-4 w-4 text-blue-500" />
                  <span>Technical & Procurement</span>
                </h3>
                <div className="space-y-1.5 text-slate-600">
                  <div>
                    <span className="text-slate-400">Make & Model:</span>{' '}
                    <span className="font-semibold text-slate-800">
                      {asset.manufacturer} {asset.model}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Serial Number:</span>{' '}
                    <span className="font-mono font-semibold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {asset.serialNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Vendor / Supplier:</span>{' '}
                    <span className="font-semibold text-slate-800">{asset.vendor || 'Authorized Distributor'}</span>
                  </div>
                  {asset.ipAddress && (
                    <div>
                      <span className="text-slate-400">IP Address:</span>{' '}
                      <span className="font-mono text-slate-800">{asset.ipAddress}</span>
                    </div>
                  )}
                  {asset.os && (
                    <div>
                      <span className="text-slate-400">Operating System:</span>{' '}
                      <span className="text-slate-800">{asset.os}</span>
                    </div>
                  )}
                  {asset.specifications && (
                    <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-700 leading-relaxed">
                      {asset.specifications}
                    </div>
                  )}
                </div>
              </div>

              {/* Custody & Location */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                    <span>Custody & Location</span>
                  </h3>
                  {currentUser?.role !== 'EMPLOYEE' && (
                    <button
                      type="button"
                      id="reassign-asset-btn"
                      onClick={() => onOpenAssign && onOpenAssign(asset)}
                      className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      <UserCheck className="h-3 w-3" />
                      <span>{asset.assignedToName ? 'Transfer' : 'Assign'}</span>
                    </button>
                  )}
                </div>
                <div className="space-y-1.5 text-slate-600">
                  <div>
                    <span className="text-slate-400">Assigned To:</span>{' '}
                    <span className="font-semibold text-slate-800">
                      {asset.assignedToName || 'Unassigned (In IT Inventory)'}
                    </span>
                  </div>
                  {asset.assignedToEmail && (
                    <div>
                      <span className="text-slate-400">Email:</span>{' '}
                      <span className="text-slate-800">{asset.assignedToEmail}</span>
                    </div>
                  )}
                  {asset.assignmentDate && (
                    <div>
                      <span className="text-slate-400">Assigned Date:</span>{' '}
                      <span className="text-slate-800">{asset.assignmentDate}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400">Department:</span>{' '}
                    <span className="text-slate-800">{asset.department || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Physical Location:</span>{' '}
                    <span className="text-slate-800">{asset.location || 'Main Office'}</span>
                  </div>
                  {asset.handoverNotes && (
                    <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 italic">
                      Note: "{asset.handoverNotes}"
                    </div>
                  )}
                </div>

                {asset.assignedToName && currentUser?.role !== 'EMPLOYEE' && (
                  <div className="pt-2 border-t border-slate-200/80">
                    <button
                      type="button"
                      id="check-in-asset-quick-btn"
                      onClick={handleCheckInToStock}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <RotateCcw className="h-3 w-3 text-slate-500" />
                      <span>Return to Stock (Check-in)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Status / Maintenance Edit Section */}
            {currentUser?.role !== 'EMPLOYEE' && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Edit3 className="h-3.5 w-3.5 text-blue-600" />
                    <span>Quick Status & Custody Adjustments</span>
                  </h4>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    {isEditing ? 'Cancel Edit' : 'Edit Details'}
                  </button>
                </div>

                {isEditing ? (
                  <div className="space-y-3 pt-2 border-t border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Asset Status
                        </label>
                        <select
                          value={status}
                          onChange={e => setStatus(e.target.value as AssetStatus)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
                        >
                          <option value="AVAILABLE">AVAILABLE (In Stock)</option>
                          <option value="ASSIGNED">ASSIGNED (In Custody)</option>
                          <option value="UNDER_REPAIR">UNDER REPAIR / MAINTENANCE</option>
                          <option value="LOST">LOST / REPORTED MISSING</option>
                          <option value="RETIRED">RETIRED / DECOMMISSIONED</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Hardware Condition
                        </label>
                        <select
                          value={condition}
                          onChange={e => setCondition(e.target.value as AssetCondition)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
                        >
                          <option value="EXCELLENT">EXCELLENT (Mint)</option>
                          <option value="GOOD">GOOD (Operational)</option>
                          <option value="FAIR">FAIR (Minor wear)</option>
                          <option value="POOR">POOR (Requires servicing)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Vendor / Partner
                        </label>
                        <input
                          type="text"
                          value={vendor}
                          onChange={e => setVendor(e.target.value)}
                          placeholder="e.g. Dell Enterprise Direct"
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Physical Location
                        </label>
                        <input
                          type="text"
                          value={location}
                          onChange={e => setLocation(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Department
                        </label>
                        <input
                          type="text"
                          value={department}
                          onChange={e => setDepartment(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={handleSaveUpdates}
                        disabled={isSubmitting}
                        className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm disabled:opacity-50"
                      >
                        {isSubmitting ? 'Saving...' : 'Save Asset Changes'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>
                      Vendor: <strong className="text-slate-800">{asset.vendor || 'Direct Purchase'}</strong> • Status:{' '}
                      <strong className="text-slate-800">{asset.status.replace('_', ' ')}</strong>
                    </span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      Update
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Audit Verification Stamp */}
            {currentUser?.role !== 'EMPLOYEE' && (
              <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-100 bg-emerald-50/50">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-emerald-600" />
                  <div>
                    <div className="font-bold text-emerald-900">Physical Inventory Audit Stamp</div>
                    <div className="text-[11px] text-emerald-700">
                      Last certified: {asset.lastAuditDate || 'Not yet audited'}
                    </div>
                  </div>
                </div>
                <button
                  id="stamp-audit-detail-btn"
                  onClick={handlePerformAudit}
                  className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Verify Audit Today</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Audit History Trail */}
        {activeTab === 'history' && (
          <div className="mt-4 space-y-3 text-xs max-h-80 overflow-y-auto pr-1">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-2">Custody & Physical Audit Log</h4>
              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {asset.history && asset.history.length > 0 ? (
                  asset.history.map(item => (
                    <div key={item.id} className="relative pl-7">
                      <div className="absolute left-1.5 top-1 h-3 w-3 rounded-full border-2 border-white bg-blue-600 shadow-xs" />
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 capitalize">
                          {item.action.replace(/_/g, ' ').toLowerCase()}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">{item.date}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{item.notes || 'Verified by IT Staff'}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">By: {item.performedBy}</div>
                    </div>
                  ))
                ) : (
                  <div className="relative pl-7">
                    <div className="absolute left-1.5 top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-600 shadow-xs" />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">Asset Registered into Inventory</span>
                      <span className="font-mono text-[10px] text-slate-400">{asset.createdAt?.slice(0, 10) || asset.purchaseDate}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Serial number {asset.serialNumber} enrolled at {asset.location}.
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">By: System Administrator</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Linked Tickets */}
        {activeTab === 'tickets' && (
          <div className="mt-4 space-y-3 text-xs max-h-80 overflow-y-auto pr-1">
            {linkedTickets.length > 0 ? (
              linkedTickets.map(t => (
                <div key={t.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-600">{t.ticketNumber}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-900 mt-1">{t.title}</div>
                  <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">{t.description}</div>
                  <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                    <span>Requester: {t.requesterName}</span>
                    <span>Priority: {t.priority}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 rounded-xl border border-dashed border-slate-200">
                <Ticket className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="font-medium text-slate-700">No helpdesk tickets recorded for this asset.</p>
                <p className="text-[11px] text-slate-400 mt-1">Hardware has maintained uninterrupted operational uptime.</p>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
          {currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'COMPANY_ADMIN' ? (
            <button
              id="decommission-asset-btn"
              onClick={handleDelete}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Decommission Asset</span>
            </button>
          ) : (
            <div />
          )}

          <button
            id="close-asset-detail-btn"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-slate-100 px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
