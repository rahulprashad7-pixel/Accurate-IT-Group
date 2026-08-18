import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AssetManagementView } from './components/AssetManagementView';
import { HelpDeskView } from './components/HelpDeskView';
import { UsersView } from './components/UsersView';
import { CompaniesView } from './components/CompaniesView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';

import { AddAssetModal } from './components/AddAssetModal';
import { AssetDetailModal } from './components/AssetDetailModal';
import { AssetQRModal } from './components/AssetQRModal';
import { AssignAssetModal } from './components/AssignAssetModal';
import { CreateTicketModal } from './components/CreateTicketModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { AddUserModal } from './components/AddUserModal';

import { ViewTab, Asset, Ticket } from './types';

const MainPortalContent: React.FC = () => {
  const { currentUser, isInitialized } = useAuth();
  const { isLoadingData } = useData();

  const [currentTab, setCurrentTab] = useState<ViewTab>('DASHBOARD');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal states
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<Asset | null>(null);
  const [selectedAssetForQR, setSelectedAssetForQR] = useState<Asset | null>(null);
  const [selectedAssetForAssign, setSelectedAssetForAssign] = useState<Asset | null>(null);

  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState<Ticket | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-400">Loading IT Management Portal...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-100 font-sans text-slate-900">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNewTicketModal={() => setIsCreateTicketOpen(true)}
        onOpenNewAssetModal={() => setIsAddAssetOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Workspace Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />

        {/* Content View Container */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {currentTab === 'DASHBOARD' && (
              <DashboardView
                setCurrentTab={setCurrentTab}
                onOpenNewTicketModal={() => setIsCreateTicketOpen(true)}
                onOpenNewAssetModal={() => setIsAddAssetOpen(true)}
              />
            )}

            {currentTab === 'ASSETS' && (
              <AssetManagementView
                onOpenAddModal={() => setIsAddAssetOpen(true)}
                onSelectAsset={asset => setSelectedAssetForDetail(asset)}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            )}

            {currentTab === 'TICKETS' && (
              <HelpDeskView
                onOpenNewTicketModal={() => setIsCreateTicketOpen(true)}
                onSelectTicket={ticket => setSelectedTicketForDetail(ticket)}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            )}

            {currentTab === 'USERS' && (
              <UsersView onOpenAddUserModal={() => setIsAddUserOpen(true)} />
            )}

            {currentTab === 'COMPANIES' && (
              <CompaniesView
                onSelectCompany={() => setCurrentTab('DASHBOARD')}
                onOpenNewAssetModal={() => setIsAddAssetOpen(true)}
                onOpenNewTicketModal={() => setIsCreateTicketOpen(true)}
              />
            )}

            {currentTab === 'REPORTS' && <ReportsView />}

            {currentTab === 'SETTINGS' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Modals Layer */}
      {isAddAssetOpen && (
        <AddAssetModal
          isOpen={isAddAssetOpen}
          onClose={() => setIsAddAssetOpen(false)}
        />
      )}

      {selectedAssetForDetail && (
        <AssetDetailModal
          asset={selectedAssetForDetail}
          onClose={() => setSelectedAssetForDetail(null)}
          onOpenQR={asset => setSelectedAssetForQR(asset)}
          onOpenAssign={asset => setSelectedAssetForAssign(asset)}
        />
      )}

      {selectedAssetForQR && (
        <AssetQRModal
          asset={selectedAssetForQR}
          isOpen={!!selectedAssetForQR}
          onClose={() => setSelectedAssetForQR(null)}
        />
      )}

      {selectedAssetForAssign && (
        <AssignAssetModal
          asset={selectedAssetForAssign}
          isOpen={!!selectedAssetForAssign}
          onClose={() => setSelectedAssetForAssign(null)}
        />
      )}

      {isCreateTicketOpen && (
        <CreateTicketModal
          isOpen={isCreateTicketOpen}
          onClose={() => setIsCreateTicketOpen(false)}
        />
      )}

      {selectedTicketForDetail && (
        <TicketDetailModal
          ticket={selectedTicketForDetail}
          onClose={() => setSelectedTicketForDetail(null)}
        />
      )}

      {isAddUserOpen && (
        <AddUserModal
          isOpen={isAddUserOpen}
          onClose={() => setIsAddUserOpen(false)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainPortalContent />
      </DataProvider>
    </AuthProvider>
  );
}
