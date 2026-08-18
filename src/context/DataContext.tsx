import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, testFirestoreConnection } from '../lib/firebase';
import { Company, Asset, Ticket, UserProfile, ActivityLog, TicketComment, SelectedCompanyFilter, CompanyCode } from '../types';
import {
  INITIAL_COMPANIES,
  INITIAL_USERS,
  INITIAL_ASSETS,
  INITIAL_TICKETS,
  INITIAL_ACTIVITY_LOGS,
} from '../data/mockEnterpriseData';
import { useAuth } from './AuthContext';

interface DataContextType {
  companies: Company[];
  assets: Asset[];
  tickets: Ticket[];
  users: UserProfile[];
  activityLogs: ActivityLog[];
  isFirestoreConnected: boolean;
  isLoadingData: boolean;
  // Asset operations
  addAsset: (assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Asset>;
  updateAsset: (assetId: string, updates: Partial<Asset>) => Promise<void>;
  deleteAsset: (assetId: string) => Promise<void>;
  auditAsset: (assetId: string, notes?: string) => Promise<void>;
  assignAsset: (assetId: string, userId: string, handoverNotes?: string, location?: string) => Promise<void>;
  returnAsset: (assetId: string, condition?: Asset['condition'], notes?: string) => Promise<void>;
  // Ticket operations
  createTicket: (ticketData: Omit<Ticket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'comments'>) => Promise<Ticket>;
  updateTicketStatus: (ticketId: string, status: Ticket['status'], resolutionSummary?: string) => Promise<void>;
  assignTicket: (ticketId: string, assignedToId: string, assignedToName: string) => Promise<void>;
  addTicketComment: (ticketId: string, comment: Omit<TicketComment, 'id' | 'timestamp'>) => Promise<void>;
  rateTicket: (ticketId: string, rating: number, feedback?: string) => Promise<void>;
  // User operations
  addUser: (userData: Omit<UserProfile, 'id'>) => Promise<UserProfile>;
  updateUser: (userId: string, updates: Partial<UserProfile>) => Promise<void>;
  // Reset & Seed
  resetToEnterpriseSeedData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, firebaseUser } = useAuth();
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(true);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Initialize and test connection if authenticated
  useEffect(() => {
    const init = async () => {
      if (firebaseUser) {
        const connected = await testFirestoreConnection();
        setIsFirestoreConnected(connected);
      }
    };
    init();
  }, [firebaseUser]);

  // Sync with Firestore only when user is actively authenticated with Firebase Auth
  useEffect(() => {
    if (!firebaseUser) return;

    let unsubAssets = () => {};
    let unsubTickets = () => {};

    try {
      unsubAssets = onSnapshot(
        collection(db, 'assets'),
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: Asset[] = [];
            snapshot.forEach((d) => {
              fetched.push({ ...d.data(), id: d.id } as Asset);
            });
            setAssets(fetched);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'assets');
        }
      );

      unsubTickets = onSnapshot(
        collection(db, 'tickets'),
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: Ticket[] = [];
            snapshot.forEach((d) => {
              fetched.push({ ...d.data(), id: d.id } as Ticket);
            });
            setTickets(fetched);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'tickets');
        }
      );
    } catch (e) {
      console.warn('Firestore real-time listeners initialized in offline-first mode.');
    }

    return () => {
      unsubAssets();
      unsubTickets();
    };
  }, [firebaseUser]);

  const logActivity = (
    companyCode: SelectedCompanyFilter,
    action: string,
    entityType: ActivityLog['entityType'],
    entityId: string,
    entityLabel: string,
    details: string
  ) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      companyCode,
      action,
      entityType,
      entityId,
      entityLabel,
      performedBy: currentUser?.name || 'System User',
      performedByRole: currentUser?.role || 'SUPER_ADMIN',
      details,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs(prev => [newLog, ...prev]);

    // Optional firestore write for logs
    try {
      setDoc(doc(db, 'activity_logs', newLog.id), newLog).catch(() => {});
    } catch (err) {
      // Non-blocking log persistence
    }
  };

  // ASSET OPERATIONS
  const addAsset = async (assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Asset> => {
    const id = `ast-${assetData.companyCode.toLowerCase()}-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();
    const newAsset: Asset = {
      ...assetData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    setAssets(prev => [newAsset, ...prev]);
    logActivity(
      newAsset.companyCode,
      'ASSET_CREATED',
      'ASSET',
      id,
      newAsset.name,
      `New asset ${newAsset.assetTag} (${newAsset.category}) registered at ${newAsset.location}.`
    );

    try {
      await setDoc(doc(db, 'assets', id), newAsset);
    } catch (error) {
      console.warn('Saved asset locally; Firestore sync pending:', error);
    }

    return newAsset;
  };

  const updateAsset = async (assetId: string, updates: Partial<Asset>): Promise<void> => {
    const now = new Date().toISOString();
    setAssets(prev =>
      prev.map(item => (item.id === assetId ? { ...item, ...updates, updatedAt: now } : item))
    );

    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      logActivity(
        asset.companyCode,
        'ASSET_UPDATED',
        'ASSET',
        assetId,
        asset.name,
        `Asset ${asset.assetTag} updated (${Object.keys(updates).join(', ')}).`
      );
    }

    try {
      await updateDoc(doc(db, 'assets', assetId), { ...updates, updatedAt: now });
    } catch (error) {
      console.warn('Updated asset locally; Firestore sync pending:', error);
    }
  };

  const deleteAsset = async (assetId: string): Promise<void> => {
    const target = assets.find(a => a.id === assetId);
    setAssets(prev => prev.filter(a => a.id !== assetId));

    if (target) {
      logActivity(
        target.companyCode,
        'ASSET_DELETED',
        'ASSET',
        assetId,
        target.name,
        `Asset ${target.assetTag} decommissioned/removed from inventory.`
      );
    }

    try {
      await deleteDoc(doc(db, 'assets', assetId));
    } catch (error) {
      console.warn('Deleted asset locally; Firestore sync pending:', error);
    }
  };

  const auditAsset = async (assetId: string, notes?: string): Promise<void> => {
    const now = new Date().toISOString().split('T')[0];
    const asset = assets.find(a => a.id === assetId);
    const newRecord = {
      id: `aud-${Date.now()}`,
      date: now,
      action: 'PHYSICAL_AUDIT_VERIFIED',
      performedBy: currentUser?.name || 'IT Administrator',
      notes: notes || 'Physical serial and condition verified in inventory.',
    };

    await updateAsset(assetId, {
      lastAuditDate: now,
      condition: 'EXCELLENT',
      history: asset?.history ? [newRecord, ...asset.history] : [newRecord],
    });
  };

  const assignAsset = async (
    assetId: string,
    userId: string,
    handoverNotes?: string,
    location?: string
  ): Promise<void> => {
    const targetAsset = assets.find(a => a.id === assetId);
    const targetUser = users.find(u => u.id === userId);
    if (!targetAsset || !targetUser) return;

    const now = new Date().toISOString();
    const today = now.split('T')[0];

    const auditRecord = {
      id: `aud-${Date.now()}`,
      date: today,
      action: 'ASSIGNED_TO_EMPLOYEE',
      performedBy: currentUser?.name || 'IT Custody Lead',
      notes: `Assigned to ${targetUser.name} (${targetUser.department}). ${handoverNotes || ''}`.trim(),
    };

    await updateAsset(assetId, {
      status: 'ASSIGNED',
      assignedToUserId: targetUser.id,
      assignedToName: targetUser.name,
      assignedToEmail: targetUser.email,
      department: targetUser.department,
      location: location || targetAsset.location,
      assignmentDate: today,
      handoverNotes: handoverNotes || undefined,
      history: targetAsset.history ? [auditRecord, ...targetAsset.history] : [auditRecord],
    });

    // Update user asset count in local state
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, assignedAssetsCount: (u.assignedAssetsCount || 0) + 1 } : u))
    );

    logActivity(
      targetAsset.companyCode,
      'ASSET_ASSIGNED',
      'ASSET',
      assetId,
      targetAsset.name,
      `Asset ${targetAsset.assetTag} assigned to ${targetUser.name} (${targetUser.email}).`
    );
  };

  const returnAsset = async (
    assetId: string,
    condition: Asset['condition'] = 'GOOD',
    notes?: string
  ): Promise<void> => {
    const targetAsset = assets.find(a => a.id === assetId);
    if (!targetAsset) return;

    const previousUser = targetAsset.assignedToName || 'Employee';
    const previousUserId = targetAsset.assignedToUserId;
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    const auditRecord = {
      id: `aud-${Date.now()}`,
      date: today,
      action: 'CHECKED_IN_TO_STOCK',
      performedBy: currentUser?.name || 'IT Custody Lead',
      notes: `Returned from ${previousUser}. Condition: ${condition}. ${notes || ''}`.trim(),
    };

    await updateAsset(assetId, {
      status: 'AVAILABLE',
      condition,
      assignedToUserId: undefined,
      assignedToName: undefined,
      assignedToEmail: undefined,
      assignmentDate: undefined,
      handoverNotes: undefined,
      notes: notes ? `${targetAsset.notes ? targetAsset.notes + ' | ' : ''}Check-in: ${notes}` : targetAsset.notes,
      history: targetAsset.history ? [auditRecord, ...targetAsset.history] : [auditRecord],
    });

    if (previousUserId) {
      setUsers(prev =>
        prev.map(u =>
          u.id === previousUserId
            ? { ...u, assignedAssetsCount: Math.max(0, (u.assignedAssetsCount || 1) - 1) }
            : u
        )
      );
    }

    logActivity(
      targetAsset.companyCode,
      'ASSET_CHECKED_IN',
      'ASSET',
      assetId,
      targetAsset.name,
      `Asset ${targetAsset.assetTag} returned to available inventory stock.`
    );
  };

  // TICKET OPERATIONS
  const createTicket = async (
    ticketData: Omit<Ticket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'comments'>
  ): Promise<Ticket> => {
    const num = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `TKT-${ticketData.companyCode}-${new Date().getFullYear()}-${num}`;
    const id = `tkt-${Date.now()}`;
    const now = new Date().toISOString();

    const newTicket: Ticket = {
      ...ticketData,
      id,
      ticketNumber,
      createdAt: now,
      updatedAt: now,
      comments: [
        {
          id: `c-${Date.now()}`,
          authorName: ticketData.requesterName,
          authorRole: currentUser?.role || 'EMPLOYEE',
          content: ticketData.description,
          timestamp: now,
        },
      ],
    };

    setTickets(prev => [newTicket, ...prev]);
    logActivity(
      newTicket.companyCode,
      'TICKET_RAISED',
      'TICKET',
      id,
      newTicket.title,
      `Support ticket #${ticketNumber} [${newTicket.priority}] submitted by ${newTicket.requesterName}.`
    );

    try {
      await setDoc(doc(db, 'tickets', id), newTicket);
    } catch (error) {
      console.warn('Created ticket locally; Firestore sync pending:', error);
    }

    return newTicket;
  };

  const updateTicketStatus = async (
    ticketId: string,
    status: Ticket['status'],
    resolutionSummary?: string
  ): Promise<void> => {
    const now = new Date().toISOString();
    const updates: Partial<Ticket> = {
      status,
      updatedAt: now,
    };

    if (status === 'RESOLVED') {
      updates.resolvedAt = now;
      if (resolutionSummary) updates.resolutionSummary = resolutionSummary;
    } else if (status === 'CLOSED') {
      updates.closedAt = now;
    }

    setTickets(prev =>
      prev.map(tkt => (tkt.id === ticketId ? { ...tkt, ...updates } : tkt))
    );

    const tkt = tickets.find(t => t.id === ticketId);
    if (tkt) {
      logActivity(
        tkt.companyCode,
        'TICKET_STATUS_CHANGED',
        'TICKET',
        ticketId,
        tkt.title,
        `Status changed to ${status}${resolutionSummary ? `: ${resolutionSummary}` : ''}`
      );
    }

    try {
      await updateDoc(doc(db, 'tickets', ticketId), updates);
    } catch (error) {
      console.warn('Updated ticket locally; Firestore sync pending:', error);
    }
  };

  const assignTicket = async (
    ticketId: string,
    assignedToId: string,
    assignedToName: string
  ): Promise<void> => {
    const now = new Date().toISOString();
    setTickets(prev =>
      prev.map(tkt =>
        tkt.id === ticketId
          ? {
              ...tkt,
              assignedToId,
              assignedToName,
              status: tkt.status === 'OPEN' ? 'IN_PROGRESS' : tkt.status,
              updatedAt: now,
            }
          : tkt
      )
    );

    const tkt = tickets.find(t => t.id === ticketId);
    if (tkt) {
      logActivity(
        tkt.companyCode,
        'TICKET_ASSIGNED',
        'TICKET',
        ticketId,
        tkt.title,
        `Assigned to technician ${assignedToName}.`
      );
    }

    try {
      await updateDoc(doc(db, 'tickets', ticketId), {
        assignedToId,
        assignedToName,
        status: tkt?.status === 'OPEN' ? 'IN_PROGRESS' : tkt?.status,
        updatedAt: now,
      });
    } catch (error) {
      console.warn('Assigned ticket locally; Firestore sync pending:', error);
    }
  };

  const addTicketComment = async (
    ticketId: string,
    commentData: Omit<TicketComment, 'id' | 'timestamp'>
  ): Promise<void> => {
    const newComment: TicketComment = {
      ...commentData,
      id: `c-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    setTickets(prev =>
      prev.map(tkt =>
        tkt.id === ticketId
          ? {
              ...tkt,
              comments: [...(tkt.comments || []), newComment],
              updatedAt: new Date().toISOString(),
            }
          : tkt
      )
    );

    try {
      const target = tickets.find(t => t.id === ticketId);
      if (target) {
        await updateDoc(doc(db, 'tickets', ticketId), {
          comments: [...(target.comments || []), newComment],
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.warn('Added comment locally; Firestore sync pending:', error);
    }
  };

  const rateTicket = async (ticketId: string, rating: number, feedback?: string): Promise<void> => {
    setTickets(prev =>
      prev.map(tkt =>
        tkt.id === ticketId
          ? {
              ...tkt,
              rating,
              feedback,
              status: 'CLOSED',
              closedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : tkt
      )
    );

    try {
      await updateDoc(doc(db, 'tickets', ticketId), {
        rating,
        feedback,
        status: 'CLOSED',
        closedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('Rated ticket locally; Firestore sync pending:', error);
    }
  };

  // USER OPERATIONS
  const addUser = async (userData: Omit<UserProfile, 'id'>): Promise<UserProfile> => {
    const id = `usr-${Date.now()}`;
    const newUser: UserProfile = {
      ...userData,
      id,
    };
    setUsers(prev => [newUser, ...prev]);

    logActivity(
      newUser.companyCode,
      'USER_ONBOARDED',
      'USER',
      id,
      newUser.name,
      `Employee ${newUser.name} added under ${newUser.department} (${newUser.role}).`
    );

    try {
      await setDoc(doc(db, 'users', id), newUser);
    } catch (error) {
      console.warn('Added user locally; Firestore sync pending:', error);
    }

    return newUser;
  };

  const updateUser = async (userId: string, updates: Partial<UserProfile>): Promise<void> => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, ...updates } : u))
    );

    try {
      await updateDoc(doc(db, 'users', userId), updates);
    } catch (error) {
      console.warn('Updated user locally; Firestore sync pending:', error);
    }
  };

  // RESET & SEED ALL
  const resetToEnterpriseSeedData = async () => {
    setIsLoadingData(true);
    setCompanies(INITIAL_COMPANIES);
    setAssets(INITIAL_ASSETS);
    setTickets(INITIAL_TICKETS);
    setUsers(INITIAL_USERS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);

    // Push to firestore
    try {
      for (const asset of INITIAL_ASSETS) {
        await setDoc(doc(db, 'assets', asset.id), asset).catch(() => {});
      }
      for (const tkt of INITIAL_TICKETS) {
        await setDoc(doc(db, 'tickets', tkt.id), tkt).catch(() => {});
      }
      for (const user of INITIAL_USERS) {
        await setDoc(doc(db, 'users', user.id), user).catch(() => {});
      }
      for (const comp of INITIAL_COMPANIES) {
        await setDoc(doc(db, 'companies', comp.id), comp).catch(() => {});
      }
    } catch (err) {
      console.warn('Batch seed finished:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  return (
    <DataContext.Provider
      value={{
        companies,
        assets,
        tickets,
        users,
        activityLogs,
        isFirestoreConnected,
        isLoadingData,
        addAsset,
        updateAsset,
        deleteAsset,
        auditAsset,
        assignAsset,
        returnAsset,
        createTicket,
        updateTicketStatus,
        assignTicket,
        addTicketComment,
        rateTicket,
        addUser,
        updateUser,
        resetToEnterpriseSeedData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
