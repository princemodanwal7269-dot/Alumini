import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { AlumniDirectory } from './components/AlumniDirectory';
import { MyNetwork } from './components/MyNetwork';
import { MentorshipPortal } from './components/MentorshipPortal';
import { EventsManagement } from './components/EventsManagement';
import { CareerPortal } from './components/CareerPortal';
import { ContributionsPortal } from './components/ContributionsPortal';
import { RoleDashboard } from './components/RoleDashboard';
import { StudentModule } from './components/StudentModule';
import { AlumniModule } from './components/AlumniModule';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { DocumentationModal } from './components/DocumentationModal';
import { JavaSourceViewerModal } from './components/JavaSourceViewerModal';
import { MessagingModal } from './components/MessagingModal';
import { StorageService } from './services/storageService';
import {
  User,
  Connection,
  MentorshipRequest,
  EventItem,
  CareerOpportunity,
  JobApplication,
  AlumniContribution,
  DirectMessage,
  NotificationItem,
  SystemStats,
  UserRole,
} from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(StorageService.getCurrentUser());
  const [currentTab, setCurrentTab] = useState<string>('home');

  // App dataset states
  const [users, setUsers] = useState<User[]>(StorageService.getUsers());
  const [connections, setConnections] = useState<Connection[]>(StorageService.getConnections());
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>(
    StorageService.getMentorshipRequests()
  );
  const [events, setEvents] = useState<EventItem[]>(StorageService.getEvents());
  const [opportunities, setOpportunities] = useState<CareerOpportunity[]>(
    StorageService.getOpportunities()
  );
  const [applications, setApplications] = useState<JobApplication[]>(
    StorageService.getApplications()
  );
  const [contributions, setContributions] = useState<AlumniContribution[]>(
    StorageService.getContributions()
  );
  const [messages, setMessages] = useState<DirectMessage[]>(StorageService.getMessages());
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    StorageService.getNotifications()
  );
  const [stats, setStats] = useState<SystemStats>(StorageService.getSystemStats());

  // Modal triggers
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isJavaModalOpen, setIsJavaModalOpen] = useState(false);
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [messagingTargetUserId, setMessagingTargetUserId] = useState<string | undefined>(undefined);

  // Sync data refresh across all child components
  const refreshAllData = useCallback(() => {
    setUsers(StorageService.getUsers());
    setConnections(StorageService.getConnections());
    setMentorshipRequests(StorageService.getMentorshipRequests());
    setEvents(StorageService.getEvents());
    setOpportunities(StorageService.getOpportunities());
    setApplications(StorageService.getApplications());
    setContributions(StorageService.getContributions());
    setMessages(StorageService.getMessages());
    setNotifications(StorageService.getNotifications());
    setStats(StorageService.getSystemStats());

    // Also update currentUser if modified
    const current = StorageService.getCurrentUser();
    setCurrentUser(current);
  }, []);

  const handleSwitchUser = (userId: string) => {
    StorageService.setCurrentUserId(userId);
    refreshAllData();
    const switchedUser = StorageService.getUserById(userId);
    if (switchedUser?.role === 'STUDENT') {
      setCurrentTab('student');
    } else if (switchedUser?.role === 'ALUMNI') {
      setCurrentTab('alumni');
    }
  };

  const handleOpenMessages = (targetUserId?: string) => {
    setMessagingTargetUserId(targetUserId);
    setIsMessagingOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Universal Top Navigation */}
      <Navbar
        currentUser={currentUser}
        allUsers={users}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onSwitchUser={handleSwitchUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenDocs={() => setIsDocModalOpen(true)}
        onOpenJavaSource={() => setIsJavaModalOpen(true)}
        onOpenMessages={() => handleOpenMessages()}
        notifications={notifications}
        messages={messages}
        onRefreshData={refreshAllData}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {(currentTab === 'home' || currentTab === 'landing') && (
          <LandingPage
            stats={stats}
            featuredAlumni={users.filter((u) => u.role === 'ALUMNI')}
            upcomingEvents={events}
            recentJobs={opportunities}
            setCurrentTab={setCurrentTab}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenDocs={() => setIsDocModalOpen(true)}
            onOpenJavaSource={() => setIsJavaModalOpen(true)}
          />
        )}

        {currentTab === 'student' && (
          <StudentModule
            currentUser={currentUser}
            users={users}
            connections={connections}
            mentorshipRequests={mentorshipRequests}
            events={events}
            opportunities={opportunities}
            applications={applications}
            onRefreshData={refreshAllData}
            onOpenMessages={handleOpenMessages}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentTab === 'alumni' && (
          <AlumniModule
            currentUser={currentUser}
            users={users}
            connections={connections}
            mentorshipRequests={mentorshipRequests}
            events={events}
            opportunities={opportunities}
            applications={applications}
            contributions={contributions}
            onRefreshData={refreshAllData}
            onOpenMessages={handleOpenMessages}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentTab === 'directory' && (
          <AlumniDirectory
            currentUser={currentUser}
            users={users}
            connections={connections}
            onRefreshData={refreshAllData}
            onOpenMessages={handleOpenMessages}
          />
        )}

        {currentTab === 'network' && (
          <MyNetwork
            currentUser={currentUser}
            users={users}
            connections={connections}
            onRefreshData={refreshAllData}
            onOpenMessages={handleOpenMessages}
            onViewProfile={() => setCurrentTab('directory')}
          />
        )}

        {currentTab === 'mentorship' && (
          <MentorshipPortal
            currentUser={currentUser}
            users={users}
            mentorshipRequests={mentorshipRequests}
            onRefreshData={refreshAllData}
            onOpenMessages={handleOpenMessages}
          />
        )}

        {currentTab === 'events' && (
          <EventsManagement
            currentUser={currentUser}
            users={users}
            events={events}
            onRefreshData={refreshAllData}
          />
        )}

        {currentTab === 'careers' && (
          <CareerPortal
            currentUser={currentUser}
            users={users}
            opportunities={opportunities}
            applications={applications}
            onRefreshData={refreshAllData}
            onOpenMessages={handleOpenMessages}
          />
        )}

        {currentTab === 'contributions' && (
          <ContributionsPortal
            currentUser={currentUser}
            users={users}
            contributions={contributions}
            stats={stats}
            onRefreshData={refreshAllData}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard
            currentUser={currentUser}
            users={users}
            connections={connections}
            mentorshipRequests={mentorshipRequests}
            events={events}
            opportunities={opportunities}
            applications={applications}
            contributions={contributions}
            stats={stats}
            onRefreshData={refreshAllData}
            setCurrentTab={setCurrentTab}
            onOpenMessages={handleOpenMessages}
          />
        )}

        {currentTab === 'dashboard' && (
          <RoleDashboard
            currentUser={currentUser}
            users={users}
            connections={connections}
            mentorshipRequests={mentorshipRequests}
            events={events}
            opportunities={opportunities}
            applications={applications}
            contributions={contributions}
            stats={stats}
            onRefreshData={refreshAllData}
            setCurrentTab={setCurrentTab}
            onOpenMessages={handleOpenMessages}
          />
        )}
      </main>

      {/* Universal Footer */}
      <Footer
        onOpenDocs={() => setIsDocModalOpen(true)}
        onOpenJavaSource={() => setIsJavaModalOpen(true)}
        setCurrentTab={setCurrentTab}
      />

      {/* MODALS */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            refreshAllData();
            if (user.role === 'STUDENT') {
              setCurrentTab('student');
            } else if (user.role === 'ALUMNI') {
              setCurrentTab('alumni');
            } else if (user.role === 'ADMIN') {
              setCurrentTab('admin');
            } else {
              setCurrentTab('dashboard');
            }
          }}
        />
      )}

      {isDocModalOpen && (
        <DocumentationModal onClose={() => setIsDocModalOpen(false)} />
      )}

      {isJavaModalOpen && (
        <JavaSourceViewerModal onClose={() => setIsJavaModalOpen(false)} />
      )}

      {isMessagingOpen && (
        <MessagingModal
          currentUser={currentUser}
          users={users}
          connections={connections}
          messages={messages}
          initialTargetUserId={messagingTargetUserId}
          onClose={() => {
            setIsMessagingOpen(false);
            setMessagingTargetUserId(undefined);
          }}
          onRefreshData={refreshAllData}
        />
      )}
    </div>
  );
}
