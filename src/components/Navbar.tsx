import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  Calendar,
  Briefcase,
  Award,
  BookOpen,
  Code,
  Bell,
  MessageSquare,
  LogOut,
  ChevronDown,
  UserCheck,
  Shield,
  Search,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { User, NotificationItem, DirectMessage } from '../types';
import { StorageService } from '../services/storageService';

interface NavbarProps {
  currentUser: User;
  allUsers: User[];
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onSwitchUser: (userId: string) => void;
  onOpenAuth: () => void;
  onOpenDocs: () => void;
  onOpenJavaSource: () => void;
  onOpenMessages: (targetUserId?: string) => void;
  notifications: NotificationItem[];
  messages: DirectMessage[];
  onRefreshData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers,
  currentTab,
  setCurrentTab,
  onSwitchUser,
  onOpenAuth,
  onOpenDocs,
  onOpenJavaSource,
  onOpenMessages,
  notifications,
  messages,
  onRefreshData,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const unreadNotifs = notifications.filter((n) => n.userId === currentUser.id && !n.isRead);
  const unreadMessages = messages.filter((m) => m.receiverId === currentUser.id && !m.isRead);

  const handleMarkAllNotifsRead = () => {
    StorageService.markAllNotificationsRead(currentUser.id);
    onRefreshData();
  };

  const navItems = [
    { id: 'landing', label: 'Home', icon: GraduationCap },
    { id: 'student', label: 'Student Portal', icon: Sparkles },
    { id: 'alumni', label: 'Alumni Portal', icon: Award },
    { id: 'admin', label: 'Admin Portal', icon: Shield },
    { id: 'directory', label: 'Directory', icon: Search },
    { id: 'network', label: 'My Network', icon: Users },
    { id: 'mentorship', label: 'Mentorship', icon: UserCheck },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'careers', label: 'Careers', icon: Briefcase },
    { id: 'contributions', label: 'Contributions', icon: Award },
    { id: 'dashboard', label: 'Role View', icon: UserCheck },
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'ALUMNI':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'FACULTY':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* College Project Top Announcement Ribbon */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white text-xs px-4 py-1.5 flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
            B.Tech Java Final Project
          </span>
          <span className="hidden sm:inline text-slate-300">
            Spring Boot 3.2 • Spring Data JPA • MySQL • REST API • Role-Based Security
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <button
            onClick={onOpenDocs}
            className="inline-flex items-center text-cyan-300 hover:text-cyan-100 font-medium underline cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 mr-1" />
            18-Section Project Report &amp; Viva Q&amp;A
          </button>
          <span className="text-slate-500">•</span>
          <button
            onClick={onOpenJavaSource}
            className="inline-flex items-center text-amber-300 hover:text-amber-100 font-medium cursor-pointer"
          >
            <Code className="w-3.5 h-3.5 mr-1" />
            Java Spring Boot Source &amp; ZIP Export
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('landing')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">AlumniConnect</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  NITE University
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-wide">Connect. Mentor. Grow.</p>
            </div>
          </div>

          {/* Primary Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id || (item.id === 'landing' && currentTab === 'home');
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Profile / Role Selector */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Direct Messages Icon */}
            <button
              onClick={() => onOpenMessages()}
              className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Internal Direct Messaging"
            >
              <MessageSquare className="w-5 h-5" />
              {unreadMessages.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadMessages.length}
                </span>
              )}
            </button>

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                      <p className="text-xs text-slate-500">{unreadNotifs.length} unread updates</p>
                    </div>
                    {unreadNotifs.length > 0 && (
                      <button
                        onClick={handleMarkAllNotifsRead}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.filter((n) => n.userId === currentUser.id).length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">No notifications yet</div>
                    ) : (
                      notifications
                        .filter((n) => n.userId === currentUser.id)
                        .slice(0, 8)
                        .map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-3 text-xs hover:bg-slate-50 transition-colors cursor-pointer ${
                              !notif.isRead ? 'bg-blue-50/50' : ''
                            }`}
                            onClick={() => {
                              StorageService.markNotificationRead(notif.id);
                              if (notif.actionLink) setCurrentTab(notif.actionLink);
                              setShowNotifDropdown(false);
                              onRefreshData();
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <span className="font-semibold text-slate-900">{notif.title}</span>
                              {!notif.isRead && (
                                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1"></span>
                              )}
                            </div>
                            <p className="text-slate-600 mt-1 line-clamp-2">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1.5 block">
                              {new Date(notif.timestamp).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Account & Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 p-1.5 pl-2 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-300"
                />
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                    {currentUser.name}
                  </div>
                  <div className="flex items-center space-x-1">
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${getRoleBadgeColor(
                        currentUser.role
                      )}`}
                    >
                      {currentUser.role}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Account Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-medium text-slate-400">Logged in as</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                  </div>

                  <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-blue-600" />
                      Quick 1-Click Role Switcher (Viva Demo)
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => {
                          onSwitchUser('user-student-1');
                          setShowUserDropdown(false);
                        }}
                        className={`text-left px-2 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                          currentUser.role === 'STUDENT' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'bg-white hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        🎓 Student (Aarav)
                      </button>
                      <button
                        onClick={() => {
                          onSwitchUser('user-alumni-1');
                          setShowUserDropdown(false);
                        }}
                        className={`text-left px-2 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                          currentUser.role === 'ALUMNI' ? 'bg-blue-100 text-blue-900 font-bold' : 'bg-white hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        💼 Alumni (Priya - Google)
                      </button>
                      <button
                        onClick={() => {
                          onSwitchUser('user-faculty-1');
                          setShowUserDropdown(false);
                        }}
                        className={`text-left px-2 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                          currentUser.role === 'FACULTY' ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-white hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        👨‍🏫 Faculty (Dr. Anand)
                      </button>
                      <button
                        onClick={() => {
                          onSwitchUser('user-admin-1');
                          setCurrentTab('admin');
                          setShowUserDropdown(false);
                        }}
                        className={`text-left px-2 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                          currentUser.role === 'ADMIN' ? 'bg-purple-100 text-purple-900 font-bold' : 'bg-white hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        🛡️ Admin (Dean)
                      </button>
                    </div>
                  </div>

                  <div className="py-1">
                    {currentUser.role === 'ADMIN' && (
                      <button
                        onClick={() => {
                          setCurrentTab('admin');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50 flex items-center cursor-pointer"
                      >
                        <Shield className="w-4 h-4 mr-2 text-purple-600" />
                        Open Admin Dashboard &amp; REST APIs
                      </button>
                    )}
                    {currentUser.role === 'ALUMNI' && (
                      <button
                        onClick={() => {
                          setCurrentTab('alumni');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 flex items-center cursor-pointer"
                      >
                        <Award className="w-4 h-4 mr-2 text-blue-600" />
                        Open Alumni Portal &amp; REST APIs
                      </button>
                    )}
                    {currentUser.role === 'STUDENT' && (
                      <button
                        onClick={() => {
                          setCurrentTab('student');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 flex items-center cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 mr-2 text-emerald-600" />
                        Open Student Portal &amp; REST APIs
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setCurrentTab('dashboard');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center cursor-pointer"
                    >
                      <Shield className="w-4 h-4 mr-2 text-slate-500" />
                      View {currentUser.role} Dashboard
                    </button>
                    <button
                      onClick={() => {
                        onOpenAuth();
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4 mr-2 text-slate-500" />
                      Switch Account / Login Form
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="xl:hidden flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id || (item.id === 'landing' && currentTab === 'home');
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center space-x-1 cursor-pointer ${
                  isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
