import React, { useState, useMemo } from 'react';
import {
  TicketCheck,
  Search,
  Filter,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  User,
  MessageSquare,
  Sparkles,
  Building2,
  Layers,
  ArrowRight,
  Shield,
  Star,
  ChevronRight,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Ticket, TicketPriority, TicketStatus, TicketCategory, Role } from '../types';

interface HelpDeskViewProps {
  onOpenNewTicketModal: () => void;
  onSelectTicket: (ticket: Ticket) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const HelpDeskView: React.FC<HelpDeskViewProps> = ({
  onOpenNewTicketModal,
  onSelectTicket,
  searchQuery,
  setSearchQuery,
}) => {
  const { currentUser, activeCompanyFilter } = useAuth();
  const { tickets, updateTicketStatus, assignTicket } = useData();

  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE'>('KANBAN');

  // Filtered tickets based on role and filters
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Role scope
      if (currentUser?.role === 'EMPLOYEE') {
        if (ticket.requesterId !== currentUser.id && ticket.requesterEmail !== currentUser.email) {
          return false;
        }
      } else if (currentUser?.role === 'COMPANY_ADMIN') {
        if (ticket.companyCode !== currentUser.companyCode) {
          return false;
        }
      } else if (activeCompanyFilter !== 'ALL') {
        if (ticket.companyCode !== activeCompanyFilter) {
          return false;
        }
      }

      if (priorityFilter !== 'ALL' && ticket.priority !== priorityFilter) {
        return false;
      }
      if (categoryFilter !== 'ALL' && ticket.category !== categoryFilter) {
        return false;
      }
      if (statusFilter !== 'ALL' && ticket.status !== statusFilter) {
        return false;
      }

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesNum = ticket.ticketNumber.toLowerCase().includes(q);
        const matchesTitle = ticket.title.toLowerCase().includes(q);
        const matchesDesc = ticket.description.toLowerCase().includes(q);
        const matchesReq = ticket.requesterName.toLowerCase().includes(q);
        const matchesAsset = (ticket.assetTag || '').toLowerCase().includes(q);
        return matchesNum || matchesTitle || matchesDesc || matchesReq || matchesAsset;
      }

      return true;
    });
  }, [tickets, currentUser, activeCompanyFilter, priorityFilter, categoryFilter, statusFilter, searchQuery]);

  const getPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-ping" />
            CRITICAL (1h SLA)
          </span>
        );
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">HIGH (4h)</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">MEDIUM (24h)</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">LOW (48h)</span>;
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">OPEN</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">IN PROGRESS</span>;
      case 'PENDING_VENDOR':
      case 'PENDING_USER':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">PENDING</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">RESOLVED</span>;
      case 'CLOSED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">CLOSED</span>;
    }
  };

  const kanbanColumns: { id: TicketStatus; label: string; color: string; countBadge: string }[] = [
    { id: 'OPEN', label: 'Open Queue', color: 'text-blue-700', countBadge: 'bg-blue-50 text-blue-700 border border-blue-200' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: 'text-purple-700', countBadge: 'bg-purple-50 text-purple-700 border border-purple-200' },
    { id: 'PENDING_VENDOR', label: 'Pending Vendor / User', color: 'text-amber-700', countBadge: 'bg-amber-50 text-amber-700 border border-amber-200' },
    { id: 'RESOLVED', label: 'Resolved & Closed', color: 'text-emerald-700', countBadge: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* Header Bento Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              {currentUser?.role === 'EMPLOYEE' ? 'My Help Desk Support Requests' : 'Help Desk Ticket Management'}
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {filteredTickets.length} Tickets
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Multi-tier SLA tracking, incident triage, vendor dispatch, and resolution workflows for AGIPL, ASSPL & ONYX.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="raise-ticket-btn-main"
            onClick={onOpenNewTicketModal}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-600 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{currentUser?.role === 'EMPLOYEE' ? 'Raise Support Request' : 'Create New Ticket'}</span>
          </button>

          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'KANBAN' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'TABLE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bento Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets by ID, title, requester, or asset..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">All Priorities</option>
          <option value="CRITICAL">Critical (1h)</option>
          <option value="HIGH">High (4h)</option>
          <option value="MEDIUM">Medium (24h)</option>
          <option value="LOW">Low (48h)</option>
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">All Categories</option>
          <option value="HARDWARE">Hardware</option>
          <option value="SOFTWARE">Software & Apps</option>
          <option value="NETWORK">Network & VPN</option>
          <option value="ACCESS_PERMISSION">Access & Permissions</option>
          <option value="EMAIL_CLOUD">Email & Cloud SSO</option>
          <option value="PRINTER">Printers & Scanners</option>
          <option value="SECURITY">Security Incident</option>
        </select>

        {viewMode === 'TABLE' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="PENDING_VENDOR">Pending Vendor</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        )}

        {(priorityFilter !== 'ALL' || categoryFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery) && (
          <button
            onClick={() => {
              setPriorityFilter('ALL');
              setCategoryFilter('ALL');
              setStatusFilter('ALL');
              setSearchQuery('');
            }}
            className="text-xs text-blue-600 font-semibold hover:underline px-2 cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Main View: Kanban or Table */}
      {viewMode === 'KANBAN' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {kanbanColumns.map((col) => {
            const colTickets = filteredTickets.filter(
              (t) =>
                col.id === 'PENDING_VENDOR'
                  ? t.status === 'PENDING_VENDOR' || t.status === 'PENDING_USER'
                  : col.id === 'RESOLVED'
                  ? t.status === 'RESOLVED' || t.status === 'CLOSED'
                  : t.status === col.id
            );

            return (
              <div
                key={col.id}
                className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col min-h-[480px]"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>{col.label}</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.countBadge}`}>
                    {colTickets.length}
                  </span>
                </div>

                <div className="space-y-3 mt-3 flex-1 overflow-y-auto max-h-[650px] pr-1">
                  {colTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => onSelectTicket(ticket)}
                      className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 hover:border-slate-300 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between space-y-2.5"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {ticket.ticketNumber}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {ticket.companyCode}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-1.5">
                          {getPriorityBadge(ticket.priority)}
                          <span className="text-[10px] text-slate-500 font-medium truncate">
                            {ticket.category}
                          </span>
                        </div>

                        <h4 className="mt-2 text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {ticket.title}
                        </h4>

                        <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                          {ticket.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Req: {ticket.requesterName}</span>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(ticket.slaDueTime).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}</span>
                          </div>
                        </div>

                        {ticket.assignedToName && (
                          <div className="text-[10px] text-purple-700 font-semibold flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>Tech: {ticket.assignedToName}</span>
                          </div>
                        )}

                        {ticket.comments && ticket.comments.length > 0 && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>{ticket.comments.length} updates</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {colTickets.length === 0 && (
                    <div className="py-12 text-center text-xs text-slate-400 italic">
                      No tickets in this column.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Ticket # & Title</th>
                  <th className="px-3 py-3.5">Company</th>
                  <th className="px-3 py-3.5">Priority</th>
                  <th className="px-3 py-3.5">Status</th>
                  <th className="px-3 py-3.5">Requester</th>
                  <th className="px-3 py-3.5">Assignee</th>
                  <th className="px-3 py-3.5">SLA Deadline</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => onSelectTicket(ticket)}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <div>
                        <div className="font-mono text-xs font-bold text-blue-700 flex items-center gap-2">
                          <span>{ticket.ticketNumber}</span>
                          <span className="text-[10px] font-normal text-slate-500">({ticket.category})</span>
                        </div>
                        <div className="font-bold text-slate-900 mt-0.5 truncate max-w-[280px]">
                          {ticket.title}
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {ticket.companyCode}
                      </span>
                    </td>

                    <td className="px-3 py-3.5">{getPriorityBadge(ticket.priority)}</td>

                    <td className="px-3 py-3.5">{getStatusBadge(ticket.status)}</td>

                    <td className="px-3 py-3.5">
                      <div className="font-bold text-slate-900">{ticket.requesterName}</div>
                      <div className="text-[10px] text-slate-500">{ticket.department}</div>
                    </td>

                    <td className="px-3 py-3.5">
                      <div className="font-bold text-slate-900">
                        {ticket.assignedToName || <span className="text-slate-400 italic">Unassigned</span>}
                      </div>
                    </td>

                    <td className="px-3 py-3.5">
                      <div className="text-slate-700 font-mono text-[11px]">
                        {new Date(ticket.slaDueTime).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectTicket(ticket)}
                        className="rounded-lg px-3 py-1.5 text-xs font-bold bg-slate-900 text-white hover:bg-blue-600 transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTickets.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-400">
                <TicketCheck className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                No support tickets matched your query.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
