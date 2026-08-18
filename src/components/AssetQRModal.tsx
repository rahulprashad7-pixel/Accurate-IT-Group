import React, { useRef } from 'react';
import { X, QrCode, Printer, Download, Copy, Check, Sparkles, Building2, Tag, Shield } from 'lucide-react';
import { Asset } from '../types';

interface AssetQRModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AssetQRModal: React.FC<AssetQRModalProps> = ({ asset, isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !asset) return null;

  // Generate an industrial pseudo QR matrix and Barcode visual using SVG
  const qrDataPayload = JSON.stringify({
    tag: asset.assetTag,
    sn: asset.serialNumber,
    co: asset.companyCode,
    cat: asset.category,
    model: asset.model,
    portal: 'https://it-portal.internal/assets/' + asset.id,
  });

  const handleCopyTag = () => {
    navigator.clipboard.writeText(`${asset.assetTag} | S/N: ${asset.serialNumber}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="asset-qr-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all my-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Asset Hardware Tag</h2>
              <p className="text-xs text-slate-500">Physical barcode & QR label for equipment tagging</p>
            </div>
          </div>
          <button
            id="close-qr-modal-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Physical Asset Sticker */}
        <div className="mt-5 p-4 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center">
          <div
            ref={printAreaRef}
            id="printable-asset-tag"
            className="w-full max-w-xs rounded-xl bg-white border-2 border-slate-900 p-4 text-slate-900 shadow-md relative overflow-hidden"
          >
            {/* Header Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-slate-900" />
                <span className="text-xs font-black tracking-wider uppercase">{asset.companyName || asset.companyCode}</span>
              </div>
              <span className="text-[10px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded">
                IT PROPERTY
              </span>
            </div>

            {/* Main Code Section: SVG Barcode & QR Block */}
            <div className="flex items-center gap-4 my-2">
              {/* High Contrast Procedural QR Mock SVG */}
              <div className="h-24 w-24 bg-white p-1 border border-slate-300 rounded-lg flex items-center justify-center shrink-0">
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  {/* Outer corner finders */}
                  <rect x="5" y="5" width="28" height="28" fill="#0f172a" rx="4" />
                  <rect x="9" y="9" width="20" height="20" fill="white" rx="2" />
                  <rect x="13" y="13" width="12" height="12" fill="#0f172a" rx="2" />

                  <rect x="67" y="5" width="28" height="28" fill="#0f172a" rx="4" />
                  <rect x="71" y="9" width="20" height="20" fill="white" rx="2" />
                  <rect x="75" y="13" width="12" height="12" fill="#0f172a" rx="2" />

                  <rect x="5" y="67" width="28" height="28" fill="#0f172a" rx="4" />
                  <rect x="9" y="71" width="20" height="20" fill="white" rx="2" />
                  <rect x="13" y="75" width="12" height="12" fill="#0f172a" rx="2" />

                  {/* Timing patterns and internal data matrix */}
                  <rect x="38" y="8" width="5" height="5" fill="#0f172a" />
                  <rect x="48" y="8" width="5" height="5" fill="#0f172a" />
                  <rect x="58" y="8" width="5" height="5" fill="#0f172a" />
                  <rect x="8" y="38" width="5" height="5" fill="#0f172a" />
                  <rect x="8" y="48" width="5" height="5" fill="#0f172a" />
                  <rect x="8" y="58" width="5" height="5" fill="#0f172a" />

                  {/* Center data points */}
                  <rect x="38" y="38" width="8" height="8" fill="#0f172a" />
                  <rect x="52" y="38" width="6" height="6" fill="#0f172a" />
                  <rect x="40" y="50" width="16" height="6" fill="#0f172a" />
                  <rect x="62" y="50" width="8" height="8" fill="#0f172a" />
                  <rect x="38" y="62" width="6" height="14" fill="#0f172a" />
                  <rect x="50" y="66" width="12" height="8" fill="#0f172a" />
                  <rect x="68" y="68" width="14" height="14" fill="#0f172a" />
                  <rect x="75" y="40" width="6" height="12" fill="#0f172a" />
                </svg>
              </div>

              {/* Tag Details */}
              <div className="flex-1 min-w-0 text-left space-y-1">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Asset Tag</div>
                <div className="font-mono text-sm font-black text-slate-900 tracking-tight">{asset.assetTag}</div>
                
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">Serial No</div>
                <div className="font-mono text-xs font-bold text-slate-700 truncate">{asset.serialNumber}</div>

                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">Category</div>
                <div className="text-xs font-semibold text-slate-800">{asset.category.replace('_', ' ')}</div>
              </div>
            </div>

            {/* Industrial Barcode representation */}
            <div className="mt-3 pt-2 border-t border-slate-200 text-center">
              <div className="h-8 w-full flex items-center justify-between px-2 bg-white">
                {/* Simulated dynamic barcode stripes */}
                {[4, 2, 6, 1, 5, 2, 4, 3, 7, 2, 5, 1, 4, 2, 6, 3, 5, 2, 4, 1, 6, 3, 5, 2, 4, 2, 6, 1, 5, 3, 4].map((width, idx) => (
                  <div
                    key={idx}
                    className="h-7 bg-slate-900"
                    style={{ width: `${width}px`, opacity: idx % 2 === 0 ? 1 : 0.8 }}
                  />
                ))}
              </div>
              <div className="font-mono text-[10px] tracking-widest text-slate-600 font-semibold mt-1">
                *{asset.assetTag.toUpperCase()}*
              </div>
            </div>

            {/* Security Footer Notice */}
            <div className="mt-2 text-[9px] text-slate-500 text-center border-t border-slate-100 pt-1.5">
              Property of {asset.companyName}. Do Not Remove or Tamper.
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
          <button
            type="button"
            id="copy-asset-tag-btn"
            onClick={handleCopyTag}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Tag Copied!' : 'Copy Tag & SN'}</span>
          </button>
          <button
            type="button"
            id="print-asset-sticker-btn"
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 font-semibold text-white hover:bg-slate-800 transition-all shadow-md"
          >
            <Printer className="h-4 w-4" />
            <span>Print Tag Sheet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
