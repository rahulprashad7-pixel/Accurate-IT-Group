import React, { useRef } from 'react';
import { X, Download, Printer, FileSpreadsheet, FileText, CheckCircle2, Building2, Shield } from 'lucide-react';
import { Asset } from '../types';

interface ExportAssetsModalProps {
  assets: Asset[];
  isOpen: boolean;
  onClose: () => void;
  activeCompanyTitle: string;
}

export const ExportAssetsModal: React.FC<ExportAssetsModalProps> = ({
  assets,
  isOpen,
  onClose,
  activeCompanyTitle,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const totalValue = assets.reduce((sum, a) => sum + (Number(a.purchaseCost) || 0), 0);
  const inUseCount = assets.filter(a => a.status === 'ASSIGNED' || a.status === 'IN_USE').length;
  const availableCount = assets.filter(a => a.status === 'AVAILABLE').length;
  const maintenanceCount = assets.filter(a => a.status === 'UNDER_REPAIR' || a.status === 'UNDER_MAINTENANCE').length;
  const lostCount = assets.filter(a => a.status === 'LOST').length;

  const handleDownloadCSV = () => {
    const headers = [
      'Asset Tag',
      'Name',
      'Category',
      'Company',
      'Manufacturer',
      'Model',
      'Serial Number',
      'Vendor',
      'Status',
      'Condition',
      'Assigned Employee',
      'Employee Email',
      'Department',
      'Location',
      'Purchase Date',
      'Purchase Cost',
      'Currency',
      'Warranty Expiry',
      'Last Audit Date',
      'Notes',
    ];

    const rows = assets.map(a => [
      `"${a.assetTag || ''}"`,
      `"${(a.name || '').replace(/"/g, '""')}"`,
      `"${a.category || ''}"`,
      `"${a.companyCode || ''}"`,
      `"${a.manufacturer || ''}"`,
      `"${a.model || ''}"`,
      `"${a.serialNumber || ''}"`,
      `"${a.vendor || ''}"`,
      `"${a.status || ''}"`,
      `"${a.condition || ''}"`,
      `"${(a.assignedToName || '').replace(/"/g, '""')}"`,
      `"${a.assignedToEmail || ''}"`,
      `"${a.department || ''}"`,
      `"${(a.location || '').replace(/"/g, '""')}"`,
      `"${a.purchaseDate || ''}"`,
      a.purchaseCost || 0,
      `"${a.currency || 'USD'}"`,
      `"${a.warrantyExpiry || ''}"`,
      `"${a.lastAuditDate || ''}"`,
      `"${(a.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `IT_Assets_Inventory_${activeCompanyTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div
      id="export-assets-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all my-8 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Export IT Inventory Roster</h2>
              <p className="text-xs text-slate-500">
                Generate CSV datasets or printable executive audit manifests ({assets.length} items)
              </p>
            </div>
          </div>
          <button
            id="close-export-modal-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Format Action Cards */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            id="download-csv-action-btn"
            onClick={handleDownloadCSV}
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50/50 hover:border-blue-200 text-left transition-all group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Download className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                Download Raw CSV Spreadsheet
              </div>
              <div className="text-[11px] text-slate-500">
                Includes all 20+ columns for Excel, PowerBI, and ERP imports.
              </div>
            </div>
          </button>

          <button
            type="button"
            id="print-pdf-action-btn"
            onClick={handlePrintPDF}
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50/50 hover:border-blue-200 text-left transition-all group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Printer className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                Print Executive Audit Manifest (PDF)
              </div>
              <div className="text-[11px] text-slate-500">
                Formatted printable layout with executive KPI totals.
              </div>
            </div>
          </button>
        </div>

        {/* Printable Preview Container */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-100 p-4">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Report Preview ({activeCompanyTitle})</span>
            <span>Generated: {new Date().toLocaleDateString()}</span>
          </div>

          <div
            ref={reportRef}
            id="printable-report-area"
            className="rounded-xl bg-white border border-slate-200 p-5 shadow-xs text-slate-900"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">
                  {activeCompanyTitle} — IT Asset Inventory Manifest
                </h3>
                <p className="text-[10px] text-slate-500">
                  Multi-Company Group Portal (AGIPL • ASSPL • ONYX Precision)
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                  OFFICIAL IT ROSTER
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-4 gap-2 mb-3 text-[11px]">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <div className="text-slate-500 text-[10px]">Total Assets</div>
                <div className="font-bold text-slate-900">{assets.length} units</div>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <div className="text-slate-500 text-[10px]">Active In Custody</div>
                <div className="font-bold text-blue-700">{inUseCount} units</div>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <div className="text-slate-500 text-[10px]">Available Stock</div>
                <div className="font-bold text-emerald-700">{availableCount} units</div>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <div className="text-slate-500 text-[10px]">Total Valuation</div>
                <div className="font-bold text-slate-900">${totalValue.toLocaleString()} USD</div>
              </div>
            </div>

            {/* Sample Table */}
            <div className="overflow-x-auto max-h-56 overflow-y-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-[10px]">
                <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                  <tr>
                    <th className="p-2">Tag ID</th>
                    <th className="p-2">Name & Model</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Serial Number</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Assigned To</th>
                    <th className="p-2">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {assets.slice(0, 15).map(a => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="p-2 font-mono font-bold text-blue-700">{a.assetTag}</td>
                      <td className="p-2 font-semibold text-slate-800">{a.name}</td>
                      <td className="p-2">{a.category}</td>
                      <td className="p-2 font-mono text-slate-600">{a.serialNumber}</td>
                      <td className="p-2 font-bold">{a.status}</td>
                      <td className="p-2 text-slate-700">{a.assignedToName || 'Unassigned'}</td>
                      <td className="p-2 text-slate-600 truncate max-w-[120px]">{a.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {assets.length > 15 && (
              <div className="text-center text-[10px] text-slate-400 mt-2">
                ... plus {assets.length - 15} additional inventory assets included in full export.
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            id="close-export-bottom-btn"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
