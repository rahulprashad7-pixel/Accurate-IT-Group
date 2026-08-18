import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, signInWithPopup, signOut as fbSignOut } from '../lib/firebase';
import { UserProfile, Role, SelectedCompanyFilter, CompanyCode } from '../types';
import { INITIAL_USERS } from '../data/mockEnterpriseData';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: User | null;
  activeCompanyFilter: SelectedCompanyFilter;
  setActiveCompanyFilter: (comp: SelectedCompanyFilter) => void;
  loginAsDemoPersona: (personaId: string) => void;
  loginWithGoogle: () => Promise<void>;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (newRole: Role, companyCode?: CompanyCode) => void;
  isLoading: boolean;
  canAccessCompany: (companyCode: CompanyCode) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Super Admin so preview immediately opens to full working dashboard
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(INITIAL_USERS[0]);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [activeCompanyFilter, setActiveCompanyFilter] = useState<SelectedCompanyFilter>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Listen to Firebase auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        // If logged in via Google, match or create user profile
        const existing = INITIAL_USERS.find(u => u.email.toLowerCase() === user.email?.toLowerCase());
        if (existing) {
          setCurrentUser({
            ...existing,
            uid: user.uid,
            avatarUrl: user.photoURL || existing.avatarUrl,
          });
          if (existing.role === 'COMPANY_ADMIN' || existing.role === 'IT_STAFF' || existing.role === 'EMPLOYEE') {
            setActiveCompanyFilter(existing.companyCode);
          }
        } else {
          // Check if bootstrapped admin email
          const isBootstrappedAdmin = user.email === 'rahulprashad7@gmail.com';
          const newUserProfile: UserProfile = {
            id: `usr-${user.uid.slice(0, 8)}`,
            uid: user.uid,
            name: user.displayName || 'Google User',
            email: user.email || 'user@example.com',
            companyCode: isBootstrappedAdmin ? 'ALL' : 'AGIPL',
            companyName: isBootstrappedAdmin ? 'All Companies' : 'AGIPL',
            role: isBootstrappedAdmin ? 'SUPER_ADMIN' : 'EMPLOYEE',
            department: isBootstrappedAdmin ? 'Group IT' : 'General Engineering',
            designation: isBootstrappedAdmin ? 'Enterprise Super Administrator' : 'Staff Engineer',
            status: 'ACTIVE',
            avatarUrl: user.photoURL || undefined,
            assignedAssetsCount: 0,
            openTicketsCount: 0,
          };
          setCurrentUser(newUserProfile);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google sign in error:', error);
      setIsLoading(false);
    }
  };

  const login = async (email: string) => {
    const existing = INITIAL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setCurrentUser(existing);
      if (existing.role === 'SUPER_ADMIN') {
        setActiveCompanyFilter('ALL');
      } else {
        setActiveCompanyFilter(existing.companyCode);
      }
    } else {
      // Create user profile for custom email
      const isBootstrappedAdmin = email.toLowerCase() === 'rahulprashad7@gmail.com';
      const newId = `usr-${Date.now().toString().slice(-6)}`;
      const newUser: UserProfile = {
        id: newId,
        uid: newId,
        name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        email,
        companyCode: isBootstrappedAdmin ? 'ALL' : 'AGIPL',
        companyName: isBootstrappedAdmin ? 'All Companies' : 'AGIPL Engineering',
        role: isBootstrappedAdmin ? 'SUPER_ADMIN' : 'COMPANY_ADMIN',
        department: 'IT Operations',
        designation: isBootstrappedAdmin ? 'Group Super Administrator' : 'IT Administrator',
        status: 'ACTIVE',
        assignedAssetsCount: 0,
        openTicketsCount: 0,
      };
      setCurrentUser(newUser);
      setActiveCompanyFilter(newUser.companyCode);
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
      setFirebaseUser(null);
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const loginAsDemoPersona = (personaId: string) => {
    const found = INITIAL_USERS.find(u => u.id === personaId);
    if (found) {
      setCurrentUser(found);
      if (found.role === 'SUPER_ADMIN') {
        setActiveCompanyFilter('ALL');
      } else {
        setActiveCompanyFilter(found.companyCode);
      }
    }
  };

  const switchRole = (newRole: Role, companyCode: CompanyCode = 'AGIPL') => {
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      role: newRole,
      companyCode: newRole === 'SUPER_ADMIN' ? 'ALL' : companyCode,
      companyName: newRole === 'SUPER_ADMIN' ? 'All Companies (Group IT)' : companyCode,
    };
    setCurrentUser(updated);
    if (newRole === 'SUPER_ADMIN') {
      setActiveCompanyFilter('ALL');
    } else {
      setActiveCompanyFilter(companyCode);
    }
  };

  const canAccessCompany = (companyCode: CompanyCode): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'SUPER_ADMIN') return true;
    return currentUser.companyCode === companyCode;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        activeCompanyFilter,
        setActiveCompanyFilter,
        loginAsDemoPersona,
        loginWithGoogle,
        login,
        logout,
        switchRole,
        isLoading,
        canAccessCompany,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
