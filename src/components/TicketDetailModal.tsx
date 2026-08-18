import React, { useState } from 'react';
import {
  X,
  TicketCheck,
  CheckCircle2,
  Clock,
  User,
  MessageSquare,
  Send,
  AlertTriangle,
  Building2,
  Laptop,
  Shield,
  Star,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Ticket, TicketStatus } from '../types';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  onClose: () => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ ticket, onClose }) => {
  const { currentUser } = useAuth();
  const { updateTicketStatus, assignTicket, addTicketComment, rateTicket, users } = useData();

  const [commentText, setCommentText] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>(ticket?.status || 'OPEN');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>(ticket?.assignedToId || '');
  const [ratingVal, setRatingVal] = useState<number>(ticket?.rating || 5);
  const [feedbackText, setFeedbackText] = useState(ticket?.feedback || '');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  if (!ticket) return null;

  const currentCompanyStaff = users.filter(
    (u) =>
      (u.role === 'IT_STAFF' || u.role === 'COMPANY_ADMIN' || u.role === 'SUPER_ADMIN') &&
      (u.companyCode === 'ALL' || u.companyCode === ticket.companyCode)
  );

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      await addTicketComment(ticket.id, {
        authorName: currentUser?.name || 'Support Agent',
        authorRole: currentUser?.role || 'EMPLOYEE',
        content: commentText.trim(),
        isInternalNote: false,
      });
      setCommentText('');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    setSelectedStatus(newStatus);
    await updateTicketStatus(ticket.id, newStatus, resolutionSummary || undefined);
  };

  const handleAssigneeChange = async (newUserId: string) => {
    setSelectedAssigneeId(newUserId);
    const assignedUser = users.find((u) => u.id === newUserId);
    if (assignedUser) {
      await assignTicket(ticket.id, assignedUser.id, assignedUser.name);
    }
  };

  const handleSaveResolution = async () => {
    if (!resolutionSummary) return;
    await updateTicketStatus(ticket.id, 'RESOLVED', resolutionSummary);
  };

  const handleSubmitRating = async () => {
    await rateTicket(ticket.id, ratingVal, feedbackText);
  };

  const isRequester =
    currentUser?.id === ticket.requesterId || currentUser?.email === ticket.requesterEmail;
  const canManage =
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'COMPANY_ADMIN' ||
    currentUser?.role === 'IT_STAFF';

  return (
    <div
      id="ticket-detail-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100 font-bold">
              <TicketCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-600 px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                  {ticket.ticketNumber}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {ticket.companyCode}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  {ticket.category}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">{ticket.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="mt-5 space-y-5 text-xs">
          {/* Key Metric Bento Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <div className="text-[11px] font-medium text-slate-500">Status</div>
              <div className="mt-1 font-bold text-slate-900 capitalize">
                {ticket.status.replace('_', ' ')}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <div className="text-[11px] font-medium text-slate-500">Priority</div>
              <div
                className={`mt-1 font-bold ${
                  ticket.priority === 'CRITICAL'
                    ? 'text-rose-600'
                    : ticket.priority === 'HIGH'
                    ? 'text-orange-600'
                    : 'text-amber-600'
                }`}
              >
                {ticket.priority}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <div className="text-[11px] font-medium text-slate-500">Requester</div>
              <div className="mt-1 font-bold text-slate-900 truncate">{ticket.requesterName}</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <div className="text-[11px] font-medium text-slate-500">SLA Target</div>
              <div className="mt-1 font-mono font-bold text-blue-600">
                {new Date(ticket.slaDueTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Description & Asset Reference */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
            <div className="font-semibold text-slate-700">Problem Description:</div>
            <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>

            {ticket.assetTag && (
              <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center gap-2 text-[11px] text-slate-600">
                <Laptop className="h-3.5 w-3.5 text-blue-500" />
                <span>
                  Linked Asset: <strong className="font-mono text-blue-600">{ticket.assetTag}</strong> ({ticket.assetName})
                </span>
              </div>
            )}
          </div>

          {/* IT Management Actions (if staff/admin) */}
          {canManage && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-3">
              <div className="font-bold text-blue-900 flex items-center justify-between">
                <span>IT Technician Workflow & Triage</span>
                <span className="text-[11px] font-normal text-blue-700">Role: {currentUser?.role}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Assign Technician
                  </label>
                  <select
                    value={selectedAssigneeId}
                    onChange={(e) => handleAssigneeChange(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Unassigned --</option>
                    {currentCompanyStaff.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role.replace('_', ' ')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Update Workflow Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="OPEN">OPEN (Queue)</option>
                    <option value="IN_PROGRESS">IN PROGRESS (Work Started)</option>
                    <option value="PENDING_VENDOR">PENDING VENDOR</option>
                    <option value="PENDING_USER">PENDING USER FEEDBACK</option>
                    <option value="RESOLVED">RESOLVED (Fix Applied)</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              </div>

              {selectedStatus === 'RESOLVED' && !ticket.resolutionSummary && (
                <div className="pt-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Resolution Summary / Solution Details *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Replaced swollen battery module under warranty."
                      value={resolutionSummary}
                      onChange={(e) => setResolutionSummary(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={handleSaveResolution}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
                    >
                      Certify Resolution
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Resolution Details View (if already resolved) */}
          {ticket.resolutionSummary && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Certified Resolution</span>
              </div>
              <p className="text-emerald-800 leading-relaxed">{ticket.resolutionSummary}</p>
              {ticket.resolvedAt && (
                <div className="text-[10px] text-emerald-600 pt-1">
                  Resolved on: {new Date(ticket.resolvedAt).toLocaleString()}
                </div>
              )}
            </div>
          )}

          {/* Requester Rating (if ticket resolved and is requester or admin) */}
          {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 space-y-2">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
                <span>Service Satisfaction Rating</span>
              </div>

              {ticket.rating ? (
                <div>
                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= ticket.rating! ? 'text-amber-500 fill-amber-400' : 'text-slate-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-slate-800">({ticket.rating}/5 Stars)</span>
                  </div>
                  {ticket.feedback && <p className="text-slate-600 italic mt-1">"{ticket.feedback}"</p>}
                </div>
              ) : isRequester ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-700 font-medium">Rate the IT support experience:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingVal(star)}
                          className="cursor-pointer"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              star <= ratingVal ? 'text-amber-500 fill-amber-400' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Optional feedback..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800"
                    />
                    <button
                      onClick={handleSubmitRating}
                      className="rounded-lg bg-amber-600 px-3 py-1.5 font-semibold text-white hover:bg-amber-700"
                    >
                      Submit Rating
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 italic">Awaiting requester rating feedback.</div>
              )}
            </div>
          )}

          {/* Live Activity & Comments Feed */}
          <div className="space-y-3">
            <div className="font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <span>Updates & Activity Log ({ticket.comments?.length || 0})</span>
              </span>
            </div>

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {(ticket.comments || []).map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{comment.authorName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{comment.content}</p>
                </div>
              ))}
            </div>

            {/* Post Comment Input */}
            <form onSubmit={handlePostComment} className="flex gap-2 pt-1">
              <input
                type="text"
                required
                placeholder="Add a reply, diagnostic finding, or status update..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSubmittingComment}
                className="flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 shadow-sm disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Reply</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
