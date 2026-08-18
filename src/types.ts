export type Role = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'IT_STAFF' | 'EMPLOYEE';

export type CompanyCode = 'AGIPL' | 'ASSPL' | 'ONYX';

export type SelectedCompanyFilter = 'ALL' | CompanyCode;

export type AssetCategory =
  | 'LAPTOP'
  | 'DESKTOP'
  | 'PRINTER'
  | 'SERVER'
  | 'NETWORKING'
  | 'MOBILE'
  | 'SOFTWARE_LICENSE'
  | 'OTHER'
  | 'MONITOR'
  | 'PERIPHERAL';

export type AssetStatus =
  | 'AVAILABLE'
  | 'ASSIGNED'
  | 'UNDER_REPAIR'
  | 'RETIRED'
  | 'LOST'
  | 'IN_USE'
  | 'UNDER_MAINTENANCE'
  | 'RESERVED';

export type AssetCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

export type TicketCategory =
  | 'HARDWARE'
  | 'SOFTWARE'
  | 'NETWORK'
  | 'ACCESS_PERMISSION'
  | 'EMAIL_CLOUD'
  | 'PRINTER'
  | 'SECURITY'
  | 'OTHER';

export type TicketPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'PENDING_USER'
  | 'PENDING_VENDOR'
  | 'RESOLVED'
  | 'CLOSED';

export type ViewTab =
  | 'DASHBOARD'
  | 'ASSETS'
  | 'TICKETS'
  | 'USERS'
  | 'COMPANIES'
  | 'REPORTS'
  | 'SETTINGS';

export interface Company {
  id: string;
  code: CompanyCode;
  name: string;
  fullName: string;
  industry: string;
  domain: string;
  headquarters: string;
  contactEmail: string;
  contactPhone: string;
  departments: string[];
  logoColor: string;
  totalAssetsCount?: number;
  openTicketsCount?: number;
}

export interface UserProfile {
  id: string;
  uid: string;
  name: string;
  email: string;
  companyCode: SelectedCompanyFilter;
  companyName?: string;
  role: Role;
  department: string;
  designation: string;
  phoneNumber?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  avatarUrl?: string;
  assignedAssetsCount?: number;
  openTicketsCount?: number;
}

export interface AssetAuditRecord {
  id: string;
  date: string;
  action: string;
  performedBy: string;
  notes?: string;
}

export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  category: AssetCategory;
  companyCode: CompanyCode;
  companyName: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  specifications: string;
  status: AssetStatus;
  condition: AssetCondition;
  vendor?: string;
  assignedToUserId?: string;
  assignedToName?: string;
  assignedToEmail?: string;
  assignmentDate?: string;
  handoverNotes?: string;
  department: string;
  location: string;
  purchaseDate: string;
  purchaseCost: number;
  currency: string;
  warrantyExpiry: string;
  ipAddress?: string;
  macAddress?: string;
  os?: string;
  lastAuditDate?: string;
  notes?: string;
  invoiceNumber?: string;
  history?: AssetAuditRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketComment {
  id: string;
  authorName: string;
  authorRole: Role;
  content: string;
  timestamp: string;
  isInternalNote?: boolean;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  companyCode: CompanyCode;
  companyName: string;
  department: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  assignedToId?: string;
  assignedToName?: string;
  assetTag?: string;
  assetName?: string;
  slaDueTime: string;
  slaBreached?: boolean;
  resolutionSummary?: string;
  resolvedAt?: string;
  closedAt?: string;
  rating?: number;
  feedback?: string;
  comments?: TicketComment[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  companyCode: SelectedCompanyFilter;
  action: string;
  entityType: 'ASSET' | 'TICKET' | 'USER' | 'COMPANY' | 'SYSTEM';
  entityId: string;
  entityLabel: string;
  performedBy: string;
  performedByRole: Role;
  details: string;
  timestamp: string;
}

export interface SLAPolicy {
  priority: TicketPriority;
  responseTimeHours: number;
  resolutionTimeHours: number;
}
