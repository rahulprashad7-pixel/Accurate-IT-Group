import React, { useState } from 'react';
import {
  X,
  Laptop,
  Shield,
  Building2,
  User,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  Tag,
  MapPin,
  Briefcase,
  Store,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Asset, AssetCategory, AssetCondition, AssetStatus, CompanyCode } from '../types';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, activeCompanyFilter } = useAuth();
  const { addAsset, companies, users, assets } = useData();

  const defaultComp: CompanyCode =
    currentUser?.role === 'COMPANY_ADMIN'
      ? (currentUser.companyCode as CompanyCode)
      : activeCompanyFilter !== 'ALL'
      ? activeCompanyFilter
      : 'AGIPL';

  const [companyCode, setCompanyCode] = useState<CompanyCode>(defaultComp);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('LAPTOP');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [customAssetTag, setCustomAssetTag] = useState('');
  const [isAutoTag, setIsAutoTag] = useState(true);
  const [vendor, setVendor] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [status, setStatus] = useState<AssetStatus>('AVAILABLE');
  const [condition, setCondition] = useState<AssetCondition>('EXCELLENT');
  const [assignedToUserId, setAssignedToUserId] = useState<string>('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [purchaseCost, setPurchaseCost] = useState<number | string>(1450);
  const [currency, setCurrency] = useState('USD');
  const [warrantyExpiry, setWarrantyExpiry] = useState(
    new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const currentCompanyUsers = users.filter(
    u => u.companyCode === 'ALL' || u.companyCode === companyCode
  );

  // Suggested vendor list
  const VENDOR_SUGGESTIONS = [
    'Dell Enterprise Direct',
    'Lenovo Premier Commercial',
    'HP Commercial Systems',
    'Apple Business Enterprise',
    'Cisco Gold Partner Networks',
    'Zebra Premier Partner',
    'CDW Enterprise Supply',
    'Amazon Web Services / Microsoft',
  ];

  const handleSetWarrantyYears = (years: number) => {
    const d = new Date(purchaseDate || new Date());
    d.setFullYear(d.getFullYear() + years);
    setWarrantyExpiry(d.toISOString().slice(0, 10));
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!name.trim()) errors.name = 'Asset name is required.';
    if (!manufacturer.trim()) errors.manufacturer = 'Manufacturer is required.';
    if (!model.trim()) errors.model = 'Model is required.';
    if (!serialNumber.trim()) {
      errors.serialNumber = 'Serial number is required.';
    } else {
      // Check if serial already exists
      const duplicate = assets.find(
        a => a.serialNumber.toLowerCase() === serialNumber.trim().toLowerCase()
      );
      if (duplicate) {
        errors.serialNumber = `Serial number already exists in ${duplicate.companyCode} (${duplicate.assetTag}).`;
      }
    }
    if (Number(purchaseCost) < 0) {
      errors.purchaseCost = 'Purchase cost cannot be negative.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const assignedUser = users.find(u => u.id === assignedToUserId);
      const compInfo = companies.find(c => c.code === companyCode);

      let finalAssetTag = customAssetTag.trim();
      if (isAutoTag || !finalAssetTag) {
        const catCode =
          category === 'LAPTOP'
            ? 'LT'
            : category === 'DESKTOP'
            ? 'WS'
            : category === 'SERVER'
            ? 'SRV'
            : category === 'NETWORKING'
            ? 'NET'
            : category === 'PRINTER'
            ? 'PRN'
            : category === 'MOBILE'
            ? 'MOB'
            : category === 'SOFTWARE_LICENSE'
            ? 'LIC'
            : 'AST';
        const randomNum = Math.floor(100 + Math.random() * 900);
        finalAssetTag = `${companyCode}-${catCode}-${randomNum}`;
      }

      const today = new Date().toISOString().slice(0, 10);
      const resolvedStatus = assignedToUserId ? 'ASSIGNED' : status;

      await addAsset({
        assetTag: finalAssetTag,
        name: name.trim(),
        category,
        companyCode,
        companyName: compInfo?.fullName || companyCode,
        manufacturer: manufacturer.trim(),
        model: model.trim(),
        serialNumber: serialNumber.trim(),
        vendor: vendor.trim() || undefined,
        specifications: specifications.trim(),
        status: resolvedStatus,
        condition,
        assignedToUserId: assignedUser?.id,
        assignedToName: assignedUser?.name,
        assignedToEmail: assignedUser?.email,
        assignmentDate: assignedUser ? today : undefined,
        department: department.trim() || assignedUser?.department || 'IT Operations',
        location:
          location.trim() ||
          (compInfo ? `${compInfo.headquarters.split(',')[0]} Facility` : 'Main Facility'),
        purchaseDate,
        purchaseCost: Number(purchaseCost) || 0,
        currency,
        warrantyExpiry,
        notes: notes.trim() || undefined,
        history: [
          {
            id: `aud-${Date.now()}`,
            date: today,
            action: assignedUser ? 'REGISTERED_AND_ASSIGNED' : 'REGISTERED_IN_STOCK',
            performedBy: currentUser?.name || 'IT Administrator',
            notes: `Enrolled asset into ${companyCode} inventory. ${
              assignedUser ? `Custody allocated to ${assignedUser.name}.` : 'Stored in available inventory.'
            }`,
          },
        ],
      });

      onClose();
    } catch (err) {
      console.error('Failed to create asset:', err);
      setFormErrors({ form: 'An error occurred while saving asset. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="add-asset-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all my-8 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Laptop className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Register New IT Asset</h2>
              <p className="text-xs text-slate-500">
                Enroll hardware, software licenses, serial numbers, and custody
              </p>
            </div>
          </div>
          <button
            id="close-add-asset-modal-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {formErrors.form && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formErrors.form}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Company & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Entity *</label>
              <select
                id="asset-company-select"
                value={companyCode}
                onChange={e => setCompanyCode(e.target.value as CompanyCode)}
                disabled={currentUser?.role === 'COMPANY_ADMIN'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              >
                {companies.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Asset Category *</label>
              <select
                id="asset-category-select"
                value={category}
                onChange={e => setCategory(e.target.value as AssetCategory)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="LAPTOP">Laptop / Notebook</option>
                <option value="DESKTOP">Desktop / Workstation</option>
                <option value="PRINTER">Printer / Scanner</option>
                <option value="SERVER">Server / Rack Unit</option>
                <option value="NETWORKING">Network Device (Switch, Firewall, Router)</option>
                <option value="MOBILE">Mobile Phone / Tablet</option>
                <option value="SOFTWARE_LICENSE">Software License / SaaS Subscription</option>
                <option value="MONITOR">Monitor / Display Panel</option>
                <option value="OTHER">Other Enterprise Asset</option>
              </select>
            </div>
          </div>

          {/* Asset Title / Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Asset Title / Name *</label>
            <input
              type="text"
              id="asset-name-input"
              required
              placeholder="e.g. Dell Precision 5820 CAD Tower"
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }));
              }}
              className={`w-full rounded-xl border px-3 py-2 text-slate-800 focus:bg-white focus:outline-none ${
                formErrors.name ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-slate-50 focus:border-blue-500'
              }`}
            />
            {formErrors.name && <p className="text-[11px] text-rose-600 mt-1 font-medium">{formErrors.name}</p>}
          </div>

          {/* Make, Model, Serial Number */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Manufacturer *</label>
              <input
                type="text"
                id="asset-manufacturer-input"
                required
                placeholder="e.g. Dell, HP, Apple, Cisco"
                value={manufacturer}
                onChange={e => {
                  setManufacturer(e.target.value);
                  if (formErrors.manufacturer) setFormErrors(prev => ({ ...prev, manufacturer: '' }));
                }}
                className={`w-full rounded-xl border px-3 py-2 text-slate-800 focus:bg-white focus:outline-none ${
                  formErrors.manufacturer
                    ? 'border-rose-300 bg-rose-50/50'
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500'
                }`}
              />
              {formErrors.manufacturer && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{formErrors.manufacturer}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Model Name / Number *</label>
              <input
                type="text"
                id="asset-model-input"
                required
                placeholder="e.g. Latitude 7440"
                value={model}
                onChange={e => {
                  setModel(e.target.value);
                  if (formErrors.model) setFormErrors(prev => ({ ...prev, model: '' }));
                }}
                className={`w-full rounded-xl border px-3 py-2 text-slate-800 focus:bg-white focus:outline-none ${
                  formErrors.model
                    ? 'border-rose-300 bg-rose-50/50'
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500'
                }`}
              />
              {formErrors.model && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{formErrors.model}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Serial Number *</label>
              <input
                type="text"
                id="asset-serial-input"
                required
                placeholder="e.g. SN-8821-XYZ"
                value={serialNumber}
                onChange={e => {
                  setSerialNumber(e.target.value);
                  if (formErrors.serialNumber) setFormErrors(prev => ({ ...prev, serialNumber: '' }));
                }}
                className={`w-full rounded-xl border px-3 py-2 text-slate-800 font-mono focus:bg-white focus:outline-none ${
                  formErrors.serialNumber
                    ? 'border-rose-300 bg-rose-50/50'
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500'
                }`}
              />
              {formErrors.serialNumber && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{formErrors.serialNumber}</p>
              )}
            </div>
          </div>

          {/* Vendor & Asset Tag */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Vendor / Supplier</label>
              <input
                type="text"
                id="asset-vendor-input"
                list="vendor-datalist"
                placeholder="e.g. Dell Enterprise Direct"
                value={vendor}
                onChange={e => setVendor(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
              <datalist id="vendor-datalist">
                {VENDOR_SUGGESTIONS.map(v => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700">Asset Tag ID</label>
                <button
                  type="button"
                  onClick={() => setIsAutoTag(!isAutoTag)}
                  className="text-[11px] text-blue-600 hover:underline font-semibold"
                >
                  {isAutoTag ? 'Customize Tag' : 'Auto-Generate Tag'}
                </button>
              </div>
              {isAutoTag ? (
                <div className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-slate-500 font-mono text-xs flex items-center justify-between">
                  <span>Auto: {companyCode}-{category.slice(0, 2)}-[AutoNumber]</span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-sans font-bold">Auto</span>
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. AGIPL-LT-999"
                  value={customAssetTag}
                  onChange={e => setCustomAssetTag(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 font-mono focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              )}
            </div>
          </div>

          {/* Specifications */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hardware / Technical Specifications</label>
            <textarea
              id="asset-specs-input"
              rows={2}
              placeholder="e.g. Intel Core i9-13900H, 32GB DDR5 RAM, 1TB NVMe Gen4 SSD, NVIDIA RTX 4060 GPU"
              value={specifications}
              onChange={e => setSpecifications(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Assignment, Status & Condition */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assign to Employee</label>
              <select
                id="asset-assignee-select"
                value={assignedToUserId}
                onChange={e => setAssignedToUserId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- Unassigned (In IT Stock) --</option>
                {currentCompanyUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                id="asset-status-select"
                value={assignedToUserId ? 'ASSIGNED' : status}
                disabled={!!assignedToUserId}
                onChange={e => setStatus(e.target.value as AssetStatus)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="AVAILABLE">AVAILABLE (In Stock)</option>
                <option value="ASSIGNED">ASSIGNED (In Custody)</option>
                <option value="UNDER_REPAIR">UNDER REPAIR / MAINTENANCE</option>
                <option value="LOST">LOST / MISSING</option>
                <option value="RETIRED">RETIRED / DECOMMISSIONED</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Condition</label>
              <select
                id="asset-condition-select"
                value={condition}
                onChange={e => setCondition(e.target.value as AssetCondition)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="EXCELLENT">EXCELLENT (New/Mint)</option>
                <option value="GOOD">GOOD (Normal operational)</option>
                <option value="FAIR">FAIR (Functional with wear)</option>
                <option value="POOR">POOR (Requires maintenance)</option>
              </select>
            </div>
          </div>

          {/* Location & Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Facility / Physical Location</label>
              <input
                type="text"
                id="asset-location-input"
                placeholder="e.g. Pune Plant 1 Floor 2, Server Room Rack 3"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                id="asset-department-input"
                placeholder="e.g. Design & R&D / IT Operations"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Purchase Date, Cost & Warranty Expiry */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Purchase Date</label>
              <input
                type="date"
                id="asset-purchase-date-input"
                value={purchaseDate}
                onChange={e => setPurchaseDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Purchase Cost (USD)</label>
              <input
                type="number"
                id="asset-cost-input"
                min="0"
                value={purchaseCost}
                onChange={e => setPurchaseCost(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700">Warranty Expiry</label>
                <div className="flex gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => handleSetWarrantyYears(1)}
                    className="text-blue-600 hover:underline"
                  >
                    +1y
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => handleSetWarrantyYears(3)}
                    className="text-blue-600 hover:underline"
                  >
                    +3y
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => handleSetWarrantyYears(5)}
                    className="text-blue-600 hover:underline"
                  >
                    +5y
                  </button>
                </div>
              </div>
              <input
                type="date"
                id="asset-warranty-input"
                value={warrantyExpiry}
                onChange={e => setWarrantyExpiry(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Administrative Notes</label>
            <textarea
              id="asset-notes-input"
              rows={2}
              placeholder="e.g. Purchase order PO-9924. Includes 3-year onsite premier support."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
              id="submit-register-asset-btn"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isSubmitting ? 'Registering Asset...' : 'Save & Register Asset'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
