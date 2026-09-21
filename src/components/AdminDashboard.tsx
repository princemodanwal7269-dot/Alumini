import React, { useState, useMemo } from 'react';
import {
  User,
  Connection,
  MentorshipRequest,
  EventItem,
  CareerOpportunity,
  JobApplication,
  AlumniContribution,
  SystemStats,
  UserRole,
  UserStatus,
  MentorshipStatus,
  EventType,
  OpportunityType,
} from '../types';
import {
  Shield,
  ShieldCheck,
  Users,
  Award,
  Calendar,
  Briefcase,
  TrendingUp,
  Search,
  Plus,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Download,
  FileText,
  Check,
  X,
  Building,
  GraduationCap,
  UserCheck,
  RefreshCw,
  FileSpreadsheet,
  ExternalLink,
  Eye,
  Printer,
  Sparkles,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { AdminApiService } from '../services/adminApiService';
import { StorageService } from '../services/storageService';

interface AdminDashboardProps {
  currentUser: User;
  users: User[];
  connections: Connection[];
  mentorshipRequests: MentorshipRequest[];
  events: EventItem[];
  opportunities: CareerOpportunity[];
  applications: JobApplication[];
  contributions: AlumniContribution[];
  stats: SystemStats;
  onRefreshData: () => void;
  setCurrentTab: (tab: string) => void;
  onOpenMessages: (userId: string) => void;
}

type AdminSubTab =
  | 'users'
  | 'approvals'
  | 'events'
  | 'mentorship'
  | 'careers'
  | 'contributions'
  | 'analytics';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  users,
  connections,
  mentorshipRequests,
  events,
  opportunities,
  applications,
  contributions,
  stats,
  onRefreshData,
  setCurrentTab,
  onOpenMessages,
}) => {
  const [activeTab, setActiveTab] = useState<AdminSubTab>('users');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // 1. User Management Filters & State
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUserRole, setNewUserRole] = useState<UserRole>('ALUMNI');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserDept, setNewUserDept] = useState('Computer Science and Engineering');
  const [newUserCompany, setNewUserCompany] = useState('');
  const [newUserJobTitle, setNewUserJobTitle] = useState('');
  const [newUserGradYear, setNewUserGradYear] = useState(2023);

  // 2. Alumni Approvals State
  const [rejectionTargetUser, setRejectionTargetUser] = useState<User | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Graduation records or degree certificate could not be verified in college registrar database.');

  // 3. Event Management State
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [rosterEvent, setRosterEvent] = useState<EventItem | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<EventType>('Workshop');
  const [eventDate, setEventDate] = useState('2026-11-25');
  const [eventTime, setEventTime] = useState('11:00 AM - 01:00 PM');
  const [eventVenue, setEventVenue] = useState('Main Seminar Hall & Zoom');
  const [eventMaxCap, setEventMaxCap] = useState(150);
  const [eventDesc, setEventDesc] = useState('');

  // 4. Mentorship Oversight State
  const [mentorshipFilter, setMentorshipFilter] = useState('ALL');
  const [reassignTargetReq, setReassignTargetReq] = useState<MentorshipRequest | null>(null);
  const [selectedNewMentorId, setSelectedNewMentorId] = useState('');

  // 5. Career Opportunities State
  const [isCreateDriveOpen, setIsCreateDriveOpen] = useState(false);
  const [driveTitle, setDriveTitle] = useState('');
  const [driveCompany, setDriveCompany] = useState('');
  const [driveType, setDriveType] = useState<OpportunityType>('Full-time Job');
  const [driveLocation, setDriveLocation] = useState('Bengaluru / Hybrid');
  const [driveSalary, setDriveSalary] = useState('₹18 - 24 LPA');
  const [driveDeadline, setDriveDeadline] = useState('2026-12-30');
  const [driveSkills, setDriveSkills] = useState('Java, Spring Boot, MySQL, Cloud');
  const [driveDesc, setDriveDesc] = useState('');

  // 6. Contribution Tracking & Tax Exemption Receipt State
  const [viewReceiptContrib, setViewReceiptContrib] = useState<AlumniContribution | null>(null);
  const [receiptNumber, setReceiptNumber] = useState('');

  // 7. NAAC Report Modal State
  const [isNaacReportOpen, setIsNaacReportOpen] = useState(false);
  const [naacReportData, setNaacReportData] = useState<any>(null);

  const showNotification = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 4000);
  };

  // Pending alumni list
  const pendingAlumni = useMemo(() => {
    return users.filter((u) => u.role === 'ALUMNI' && u.status === 'PENDING_APPROVAL');
  }, [users]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = userSearch.toLowerCase().trim();
      const matchesQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.company && u.company.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q)) ||
        (u.studentRollNo && u.studentRollNo.toLowerCase().includes(q));

      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchesStatus = userStatusFilter === 'ALL' || u.status === userStatusFilter;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [users, userSearch, roleFilter, userStatusFilter]);

  // Filtered Mentorship Requests
  const filteredMentorships = useMemo(() => {
    if (mentorshipFilter === 'ALL') return mentorshipRequests;
    return mentorshipRequests.filter((m) => m.status === mentorshipFilter);
  }, [mentorshipRequests, mentorshipFilter]);

  // Verified Alumni eligible for reassigning
  const verifiedAlumni = useMemo(() => {
    return users.filter((u) => u.role === 'ALUMNI' && u.status === 'ACTIVE' && u.isAvailableForMentoring);
  }, [users]);

  // ----------------------------------------------------
  // ACTION HANDLERS
  // ----------------------------------------------------

  // USER MANAGEMENT
  const handleToggleUserStatus = async (userId: string, currentStatus: UserStatus) => {
    setIsProcessing(true);
    const newStatus: UserStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      await AdminApiService.updateUserStatus(userId, newStatus);
      onRefreshData();
      showNotification(`Account status updated to ${newStatus}. Synced with JPA repository.`);
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete user account "${userName}"? This cannot be undone.`)) {
      return;
    }
    setIsProcessing(true);
    try {
      await AdminApiService.deleteUser(userId);
      onRefreshData();
      showNotification(`User "${userName}" deleted from database.`);
    } catch (err: any) {
      alert(err.message || 'Deletion failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveUserDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsProcessing(true);
    try {
      await AdminApiService.updateUserDetails(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        status: editingUser.status,
        department: editingUser.department,
        company: editingUser.company,
        jobTitle: editingUser.jobTitle,
        graduationYear: editingUser.graduationYear,
      });
      setEditingUser(null);
      onRefreshData();
      showNotification('User profile successfully updated in database.');
    } catch (err: any) {
      alert(err.message || 'Update failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    setIsProcessing(true);
    try {
      await AdminApiService.createUser({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        role: newUserRole,
        department: newUserDept,
        company: newUserCompany.trim() || undefined,
        jobTitle: newUserJobTitle.trim() || undefined,
        graduationYear: newUserGradYear,
        status: 'ACTIVE',
      });
      setIsCreateUserOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserCompany('');
      setNewUserJobTitle('');
      onRefreshData();
      showNotification(`New ${newUserRole} account created & active in institutional database.`);
    } catch (err: any) {
      alert(err.message || 'Failed to create user');
    } finally {
      setIsProcessing(false);
    }
  };

  // ALUMNI APPROVALS
  const handleApproveAlumni = async (userId: string, alumniName: string) => {
    setIsProcessing(true);
    try {
      await AdminApiService.approveAlumni(userId, 'Authenticated by Dean of Alumni Relations.');
      onRefreshData();
      showNotification(`Alumni "${alumniName}" approved! Credentials verified & alumni badge granted.`);
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmRejectAlumni = async () => {
    if (!rejectionTargetUser) return;
    setIsProcessing(true);
    try {
      await AdminApiService.rejectAlumni(rejectionTargetUser.id, rejectionReason);
      setRejectionTargetUser(null);
      onRefreshData();
      showNotification(`Alumni application rejected. Notification sent to applicant.`);
    } catch (err: any) {
      alert(err.message || 'Rejection failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchApprove = async () => {
    if (pendingAlumni.length === 0) return;
    if (!window.confirm(`Approve all ${pendingAlumni.length} pending alumni registrations?`)) return;
    setIsProcessing(true);
    try {
      const ids = pendingAlumni.map((u) => u.id);
      const count = await AdminApiService.batchApproveAlumni(ids);
      onRefreshData();
      showNotification(`Successfully batch approved ${count} alumni records.`);
    } catch (err: any) {
      alert(err.message || 'Batch approval failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // EVENT MANAGEMENT
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    setIsProcessing(true);
    try {
      if (editingEvent) {
        await AdminApiService.updateEvent(editingEvent.id, {
          title: eventTitle.trim(),
          type: eventType,
          date: eventDate,
          time: eventTime,
          venue: eventVenue.trim(),
          maxParticipants: Number(eventMaxCap),
          description: eventDesc.trim(),
        });
        showNotification(`Event "${eventTitle}" updated.`);
        setEditingEvent(null);
      } else {
        await AdminApiService.createEvent({
          title: eventTitle.trim(),
          type: eventType,
          date: eventDate,
          time: eventTime,
          venue: eventVenue.trim(),
          maxParticipants: Number(eventMaxCap),
          description: eventDesc.trim(),
          organizer: 'Dean of Alumni Relations & Campus Affairs',
          organizerId: currentUser.id,
        });
        showNotification(`Campus event "${eventTitle}" published successfully.`);
        setIsCreateEventOpen(false);
      }
      setEventTitle('');
      setEventDesc('');
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Event action failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelEvent = async (eventId: string, title: string) => {
    const reason = window.prompt(`Enter reason for cancelling "${title}":`, 'Schedule conflict with university examinations');
    if (reason === null) return;
    setIsProcessing(true);
    try {
      await AdminApiService.cancelEvent(eventId, reason);
      onRefreshData();
      showNotification(`Event "${title}" marked as CANCELLED. Attendees notified.`);
    } catch (err: any) {
      alert(err.message || 'Cancellation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteEvent = async (eventId: string, title: string) => {
    if (!window.confirm(`Permanently delete event "${title}"?`)) return;
    setIsProcessing(true);
    try {
      await AdminApiService.deleteEvent(eventId);
      onRefreshData();
      showNotification(`Event "${title}" deleted.`);
    } catch (err: any) {
      alert(err.message || 'Deletion failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // MENTORSHIP OVERSIGHT
  const handleUpdateMentorshipStatus = async (reqId: string, status: MentorshipStatus) => {
    setIsProcessing(true);
    try {
      await AdminApiService.updateMentorshipStatus(reqId, status, 'Status updated via Dean Oversight.');
      onRefreshData();
      showNotification(`Mentorship status changed to ${status}.`);
    } catch (err: any) {
      alert(err.message || 'Update failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReassignMentor = async () => {
    if (!reassignTargetReq || !selectedNewMentorId) return;
    setIsProcessing(true);
    try {
      await AdminApiService.reassignMentor(reassignTargetReq.id, selectedNewMentorId);
      setReassignTargetReq(null);
      setSelectedNewMentorId('');
      onRefreshData();
      showNotification('Student mentorship reassigned to selected alumni mentor.');
    } catch (err: any) {
      alert(err.message || 'Reassignment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // CAREER DRIVES
  const handleCreateCareerDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveTitle.trim() || !driveCompany.trim()) return;
    setIsProcessing(true);
    try {
      const parsedSkills = driveSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await AdminApiService.createCareerOpportunity({
        title: driveTitle.trim(),
        company: driveCompany.trim(),
        type: driveType,
        location: driveLocation.trim(),
        salaryRange: driveSalary.trim(),
        deadline: driveDeadline,
        description: driveDesc.trim(),
        skillsRequired: parsedSkills,
      });

      setIsCreateDriveOpen(false);
      setDriveTitle('');
      setDriveCompany('');
      setDriveDesc('');
      onRefreshData();
      showNotification('Official recruitment / referral drive published to Student Portal.');
    } catch (err: any) {
      alert(err.message || 'Failed to publish drive');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteCareer = async (id: string, title: string) => {
    if (!window.confirm(`Delete job opening "${title}"?`)) return;
    setIsProcessing(true);
    try {
      await AdminApiService.deleteCareerOpportunity(id);
      onRefreshData();
      showNotification(`Job opening removed.`);
    } catch (err: any) {
      alert(err.message || 'Deletion failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // CONTRIBUTIONS & RECEIPTS
  const handleVerifyContribution = async (contribId: string) => {
    setIsProcessing(true);
    try {
      await AdminApiService.verifyContribution(contribId);
      onRefreshData();
      showNotification('Philanthropic donation verified. Official audit receipt generated.');
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenReceiptModal = async (contrib: AlumniContribution) => {
    try {
      const res = await AdminApiService.generateReceipt(contrib.id);
      setReceiptNumber(res.receiptNumber);
      setViewReceiptContrib(contrib);
    } catch (err: any) {
      alert(err.message || 'Failed to generate receipt');
    }
  };

  // NAAC REPORT
  const handleOpenNaacReport = async () => {
    setIsProcessing(true);
    try {
      const report = await AdminApiService.generateNAACReport();
      setNaacReportData(report);
      setIsNaacReportOpen(true);
    } catch (err: any) {
      alert(err.message || 'Failed to generate report');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Flash Notification */}
      {statusNotification && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusNotification}</span>
          </div>
          <button
            onClick={() => setStatusNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Admin Executive Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-radial from-purple-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-purple-500/25 text-purple-300 border border-purple-400/30 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                <span>DEAN OF ALUMNI AFFAIRS • COMMAND CENTER</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Spring Boot REST API Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              University Alumni &amp; Institutional Governance
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Supervise institutional networks, verify alumni credentials, orchestrate campus placements,
              audit philanthropic endowments, and generate NAAC/NBA accreditation reports.
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setActiveTab('approvals');
              }}
              className="relative px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-900/30 flex items-center space-x-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Alumni Approvals</span>
              {pendingAlumni.length > 0 && (
                <span className="ml-1.5 px-2 py-0.5 rounded-full bg-white text-amber-900 text-[10px] font-black animate-pulse">
                  {pendingAlumni.length} Pending
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setEditingEvent(null);
                setEventTitle('');
                setEventDesc('');
                setIsCreateEventOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-900/30 flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Host Event</span>
            </button>

            <button
              onClick={handleOpenNaacReport}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center space-x-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-cyan-300" />
              <span>NAAC Criteria 5 Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div
          onClick={() => setActiveTab('users')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-purple-50 border-purple-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-purple-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">{users.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {stats.totalAlumni} Alumni • {stats.totalStudents} Students
          </div>
        </div>

        <div
          onClick={() => setActiveTab('approvals')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'approvals'
              ? 'bg-amber-50 border-amber-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-amber-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Approvals</span>
            <UserCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-extrabold text-amber-700">{pendingAlumni.length}</div>
          <div className="text-[10px] text-amber-600 font-semibold mt-0.5">
            {pendingAlumni.length > 0 ? 'Verification needed' : 'All cleared'}
          </div>
        </div>

        <div
          onClick={() => setActiveTab('events')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'events'
              ? 'bg-blue-50 border-blue-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-blue-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Campus Events</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">{events.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {events.filter((e) => e.status === 'UPCOMING').length} Upcoming sessions
          </div>
        </div>

        <div
          onClick={() => setActiveTab('mentorship')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'mentorship'
              ? 'bg-emerald-50 border-emerald-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-emerald-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Mentorships</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-700">{mentorshipRequests.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {mentorshipRequests.filter((m) => m.status === 'ACCEPTED').length} Active pairs
          </div>
        </div>

        <div
          onClick={() => setActiveTab('careers')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'careers'
              ? 'bg-indigo-50 border-indigo-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-indigo-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Job Drives</span>
            <Briefcase className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">{opportunities.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {applications.length} Student applicants
          </div>
        </div>

        <div
          onClick={() => setActiveTab('contributions')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'contributions'
              ? 'bg-rose-50 border-rose-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-rose-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Audited Endowments</span>
            <TrendingUp className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            ₹{(stats.totalDonationAmount / 100000).toFixed(1)}L
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {contributions.length} Philanthropic gifts
          </div>
        </div>
      </div>

      {/* Main Admin Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-1 pb-1">
        {[
          { id: 'users', label: 'User Management', icon: Users, badge: null },
          {
            id: 'approvals',
            label: 'Alumni Approval',
            icon: UserCheck,
            badge: pendingAlumni.length > 0 ? pendingAlumni.length : null,
          },
          { id: 'events', label: 'Event Management', icon: Calendar, badge: events.length },
          { id: 'mentorship', label: 'Mentorship Oversight', icon: Award, badge: mentorshipRequests.length },
          { id: 'careers', label: 'Career Opportunities', icon: Briefcase, badge: opportunities.length },
          { id: 'contributions', label: 'Contribution Tracking', icon: TrendingUp, badge: contributions.length },
          { id: 'analytics', label: 'Analytics & Reports', icon: FileSpreadsheet, badge: null },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminSubTab)}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : tab.id === 'approvals' && tab.badge > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREA */}

      {/* 1. USER MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <span>Institutional User Management &amp; Role-Based Access Control</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                  {filteredUsers.length} Records
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Audit student enrollment, verified alumni credentials, faculty coordinators, and administrative privileges.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsCreateUserOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add User Directly</span>
              </button>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, roll number, department, or company..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-slate-200 text-xs bg-white font-medium text-slate-700"
              >
                <option value="ALL">All Roles ({users.length})</option>
                <option value="STUDENT">Students ({users.filter((u) => u.role === 'STUDENT').length})</option>
                <option value="ALUMNI">Alumni ({users.filter((u) => u.role === 'ALUMNI').length})</option>
                <option value="FACULTY">Faculty ({users.filter((u) => u.role === 'FACULTY').length})</option>
                <option value="ADMIN">Admins ({users.filter((u) => u.role === 'ADMIN').length})</option>
              </select>
            </div>

            <div>
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-slate-200 text-xs bg-white font-medium text-slate-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING_APPROVAL">PENDING APPROVAL</option>
                <option value="BLOCKED">BLOCKED</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">User Identity</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Affiliation / Batch</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No users found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3.5">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                              <span>{u.name}</span>
                              {u.studentRollNo && (
                                <span className="text-[10px] font-mono px-1 rounded bg-slate-100 text-slate-600">
                                  {u.studentRollNo}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : u.role === 'ALUMNI'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : u.role === 'FACULTY'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{u.department}</td>

                      <td className="py-3 px-3 text-slate-600">
                        {u.role === 'ALUMNI' ? (
                          <div>
                            <span className="font-semibold text-slate-800">{u.company || 'Enterprise'}</span>
                            <span className="text-[11px] text-slate-500 block">Class of {u.graduationYear}</span>
                          </div>
                        ) : u.role === 'STUDENT' ? (
                          <div>
                            <span>{u.degree || 'B.Tech Undergrad'}</span>
                            <span className="text-[11px] text-slate-500 block">Grad: {u.graduationYear}</span>
                          </div>
                        ) : (
                          <div>{u.facultyDesignation || 'Faculty Member'}</div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : u.status === 'PENDING_APPROVAL'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setEditingUser(u)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] cursor-pointer"
                          title="Edit user details & role"
                        >
                          Edit
                        </button>

                        {u.status === 'PENDING_APPROVAL' && (
                          <button
                            onClick={() => handleApproveAlumni(u.id, u.name)}
                            className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer"
                          >
                            Approve
                          </button>
                        )}

                        {u.id !== currentUser.id && (
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.status)}
                            className={`p-1 rounded cursor-pointer ${
                              u.status === 'ACTIVE'
                                ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={u.status === 'ACTIVE' ? 'Block account access' : 'Unblock account'}
                          >
                            {u.status === 'ACTIVE' ? (
                              <Lock className="w-3.5 h-3.5" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        {u.id !== currentUser.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Purge user record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. ALUMNI APPROVAL QUEUE TAB */}
      {activeTab === 'approvals' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <span>Alumni Identity &amp; Credential Verification Queue</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800">
                  {pendingAlumni.length} Pending
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Authenticate new alumni registrations against college roll records before granting verified alumni status.
              </p>
            </div>

            {pendingAlumni.length > 0 && (
              <button
                onClick={handleBatchApprove}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Batch Approve All ({pendingAlumni.length})</span>
              </button>
            )}
          </div>

          {pendingAlumni.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">All Alumni Registrations Verified!</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No alumni are currently waiting in the verification queue. Any newly registered alumni via the portal will appear here for verification.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingAlumni.map((alumnus) => (
                <div
                  key={alumnus.id}
                  className="bg-slate-50 rounded-xl border border-amber-200 p-5 space-y-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={alumnus.avatar}
                        alt={alumnus.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-amber-300"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{alumnus.name}</h4>
                        <p className="text-xs text-blue-700 font-semibold">{alumnus.email}</p>
                        <span className="text-[10px] font-mono text-slate-500">
                          Applied on: {new Date(alumnus.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                      PENDING VERIFICATION
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Department</span>
                      <span className="font-semibold text-slate-800">{alumnus.department}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Graduation Batch</span>
                      <span className="font-semibold text-slate-800">Class of {alumnus.graduationYear}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Employer / Title</span>
                      <span className="font-semibold text-slate-800">
                        {alumnus.jobTitle} @ {alumnus.company}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Student Roll No</span>
                      <span className="font-mono text-slate-800 font-bold">
                        {alumnus.studentRollNo || alumnus.rollNumber || 'EC18B045'}
                      </span>
                    </div>
                  </div>

                  {alumnus.skills && alumnus.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {alumnus.skills.slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-200 text-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <button
                      onClick={() => onOpenMessages(alumnus.id)}
                      className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                    >
                      Contact Applicant
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setRejectionTargetUser(alumnus);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApproveAlumni(alumnus.id, alumnus.name)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Alumni</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. EVENT MANAGEMENT TAB */}
      {activeTab === 'events' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <span>Institutional Campus &amp; Alumni Events Oversight</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {events.length} Events Total
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Organize alumni reunions, career fairs, tech workshops, and track student attendance rosters.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingEvent(null);
                setEventTitle('');
                setEventDesc('');
                setIsCreateEventOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Host New Event</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="h-32 w-full overflow-hidden relative">
                    <img
                      src={ev.bannerImage}
                      alt={ev.title}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        ev.status === 'UPCOMING'
                          ? 'bg-emerald-600 text-white'
                          : ev.status === 'CANCELLED'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-700 text-white'
                      }`}
                    >
                      {ev.status}
                    </span>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/60 backdrop-blur-xs text-white">
                      {ev.type}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{ev.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{ev.description}</p>

                    <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>
                          {ev.date} • {ev.time}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{ev.venue}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1 font-semibold text-slate-700">
                        <span>Registered Attendees:</span>
                        <span className="text-blue-700 font-bold">
                          {ev.registeredUserIds.length} / {ev.maxParticipants} Seats
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <button
                    onClick={() => setRosterEvent(ev)}
                    className="text-xs text-blue-600 font-bold hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>View Roster ({ev.registeredUserIds.length})</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    {ev.status === 'UPCOMING' && (
                      <button
                        onClick={() => handleCancelEvent(ev.id, ev.title)}
                        className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingEvent(ev);
                        setEventTitle(ev.title);
                        setEventType(ev.type);
                        setEventDate(ev.date);
                        setEventTime(ev.time);
                        setEventVenue(ev.venue);
                        setEventMaxCap(ev.maxParticipants);
                        setEventDesc(ev.description);
                      }}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(ev.id, ev.title)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MENTORSHIP MANAGEMENT TAB */}
      {activeTab === 'mentorship' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <span>Mentorship Program Oversight &amp; Dispute Resolution</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {mentorshipRequests.length} Pairs
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Track active student-alumni guidance pairs, reassign inactive mentors, and monitor career outcomes.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={mentorshipFilter}
                onChange={(e) => setMentorshipFilter(e.target.value)}
                className="py-1.5 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 font-medium"
              >
                <option value="ALL">All Statuses ({mentorshipRequests.length})</option>
                <option value="PENDING">Pending Approval</option>
                <option value="ACCEPTED">Active / Accepted</option>
                <option value="COMPLETED">Completed</option>
                <option value="REJECTED">Declined</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredMentorships.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No mentorship engagements match the selected filter.
              </div>
            ) : (
              filteredMentorships.map((req) => {
                const student = users.find((u) => u.id === req.studentId);
                const mentor = users.find((u) => u.id === req.mentorId);

                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Student info */}
                      <div className="flex items-center space-x-2 shrink-0">
                        <img
                          src={student?.avatar}
                          alt={student?.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{student?.name}</span>
                          <span className="text-[10px] text-slate-500">
                            Mentee ({student?.department?.split(' ')[0]})
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 hidden sm:block self-center" />

                      {/* Mentor info */}
                      <div className="flex items-center space-x-2 shrink-0">
                        <img
                          src={mentor?.avatar}
                          alt={mentor?.name}
                          className="w-9 h-9 rounded-full object-cover border border-blue-200"
                        />
                        <div>
                          <span className="font-bold text-blue-900 block">{mentor?.name}</span>
                          <span className="text-[10px] text-blue-700">
                            {mentor?.jobTitle} @ {mentor?.company}
                          </span>
                        </div>
                      </div>

                      {/* Goal details */}
                      <div className="pl-2 border-l border-slate-200 max-w-md">
                        <span className="font-semibold text-purple-800 block">{req.category}</span>
                        <p className="text-slate-600 italic line-clamp-1">"{req.message}"</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : req.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {req.status}
                      </span>

                      <button
                        onClick={() => {
                          setReassignTargetReq(req);
                          setSelectedNewMentorId('');
                        }}
                        className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px] cursor-pointer"
                      >
                        Reassign
                      </button>

                      {req.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleUpdateMentorshipStatus(req.id, 'COMPLETED')}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 5. CAREER OPPORTUNITIES TAB */}
      {activeTab === 'careers' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <span>Placement Drives &amp; Alumni Referrals Governance</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  {opportunities.length} Openings
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Publish verified university campus drives, review student applicant queues, and audit referral postings.
              </p>
            </div>

            <button
              onClick={() => setIsCreateDriveOpen(true)}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Post Campus Drive</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.map((job) => {
              const applicantsForJob = applications.filter((a) => a.opportunityId === job.id);

              return (
                <div
                  key={job.id}
                  className="p-5 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-shadow flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {job.type}
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-base mt-1">{job.title}</h4>
                        <div className="flex items-center space-x-2 text-xs text-slate-600 font-semibold">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.company}</span>
                          <span>•</span>
                          <span>{job.location}</span>
                        </div>
                      </div>
                      <span className="font-extrabold text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                        {job.salaryRange}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{job.description}</p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {job.skillsRequired.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1 text-slate-500">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="font-bold text-slate-800">{applicantsForJob.length}</span>
                      <span>Applicants Registered</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDeleteCareer(job.id, job.title)}
                        className="px-2.5 py-1 rounded text-rose-600 hover:bg-rose-50 font-bold text-[10px] cursor-pointer"
                      >
                        Remove Posting
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. CONTRIBUTION TRACKING TAB */}
      {activeTab === 'contributions' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <span>Alumni Giving, Endowments &amp; 80G Tax Auditing</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                  ₹{(stats.totalDonationAmount / 100000).toFixed(2)} Lakhs Total
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Audit alumni donations, scholarships, and issue cryptographically sealed 80G tax receipts.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">Donor / Alumnus</th>
                  <th className="py-3 px-3">Endowment Purpose</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Audit Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contributions.map((contrib) => (
                  <tr key={contrib.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3.5 font-bold text-slate-900">{contrib.alumniName}</td>

                    <td className="py-3 px-3 text-slate-600">
                      <span className="font-semibold text-slate-800 block">
                        {contrib.contributionType || contrib.type || 'Donation / Funds'}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate block max-w-xs">
                        {contrib.description}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-extrabold text-emerald-700 text-sm">
                      ₹{(contrib.amount || 0).toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-slate-500">
                      {contrib.date ? new Date(contrib.date).toLocaleDateString() : 'Recent'}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          contrib.status === 'VERIFIED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {contrib.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                      {contrib.status !== 'VERIFIED' && (
                        <button
                          onClick={() => handleVerifyContribution(contrib.id)}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer"
                        >
                          Verify &amp; Audit
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenReceiptModal(contrib)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-blue-700 font-bold text-[10px] cursor-pointer inline-flex items-center space-x-1"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        <span>80G Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. ANALYTICS & REPORTS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Executive Analytics Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Department Distribution */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Alumni by Academic Department</span>
                <GraduationCap className="w-4 h-4 text-purple-600" />
              </h4>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Computer Science &amp; Engineering</span>
                    <span className="font-bold">48%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '48%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Electronics &amp; Communication</span>
                    <span className="font-bold">26%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '26%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Information Science &amp; AI</span>
                    <span className="font-bold">14%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '14%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Mechanical &amp; Aerospace</span>
                    <span className="font-bold">12%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-amber-600 h-2 rounded-full" style={{ width: '12%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 2: Top Employers */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Top Alumni Employers</span>
                <Building className="w-4 h-4 text-emerald-600" />
              </h4>
              <div className="space-y-3 text-xs">
                {[
                  { company: 'Google India', count: 18, pct: 85 },
                  { company: 'Microsoft IDC', count: 14, pct: 70 },
                  { company: 'Amazon AWS', count: 12, pct: 60 },
                  { company: 'Uber & Swiggy', count: 9, pct: 45 },
                  { company: 'Intel & Qualcomm', count: 8, pct: 40 },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-1">
                      <span>{item.company}</span>
                      <span className="font-bold">{item.count} Alumni</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full"
                        style={{ width: `${item.pct}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 3: Fund Allocation */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Endowment Fund Allocation</span>
                <TrendingUp className="w-4 h-4 text-rose-600" />
              </h4>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Merit-cum-Means Scholarships</span>
                    <span className="font-bold">₹7,50,000</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '55%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Robotics &amp; AI Research Labs</span>
                    <span className="font-bold">₹3,25,000</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Student Hardship Relief Fund</span>
                    <span className="font-bold">₹2,00,000</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Accreditation & Inspection Report Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl p-6 text-white space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  ACCREDITATION REPORTING SUITE
                </span>
                <h3 className="text-lg font-extrabold mt-1">NAAC &amp; NBA Compliance Generator</h3>
                <p className="text-xs text-slate-300">
                  Extract audit-ready documentation for NAAC Criterion 5 (Student Support &amp; Progression) &amp; Alumni Financial Contributions.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleOpenNaacReport}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>View NAAC 5.4 Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODALS SECTION */}
      {/* ============================================================ */}

      {/* 1. EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <span>Edit User Record (Admin Override)</span>
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserDetails} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="ALUMNI">ALUMNI</option>
                    <option value="FACULTY">FACULTY</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Account Status</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, status: e.target.value as UserStatus })
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING_APPROVAL">PENDING APPROVAL</option>
                    <option value="BLOCKED">BLOCKED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Department</label>
                <input
                  type="text"
                  value={editingUser.department}
                  onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Company / Org</label>
                  <input
                    type="text"
                    value={editingUser.company || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, company: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Job Title</label>
                  <input
                    type="text"
                    value={editingUser.jobTitle || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, jobTitle: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer"
                >
                  {isProcessing ? 'Saving in JPA...' : 'Save User Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. CREATE NEW USER MODAL */}
      {isCreateUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <span>Provision User Account Directly</span>
              </h3>
              <button
                onClick={() => setIsCreateUserOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewUser} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Account Role *</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="ALUMNI">ALUMNI</option>
                  <option value="STUDENT">STUDENT</option>
                  <option value="FACULTY">FACULTY</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Sethi"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="vikram@alumniconnect.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Department *</label>
                <select
                  value={newUserDept}
                  onChange={(e) => setNewUserDept(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Computer Science and Engineering">Computer Science &amp; Engineering</option>
                  <option value="Electronics & Communication">Electronics &amp; Communication</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>

              {newUserRole === 'ALUMNI' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Company</label>
                    <input
                      type="text"
                      placeholder="e.g. Amazon"
                      value={newUserCompany}
                      onChange={(e) => setNewUserCompany(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Job Title</label>
                    <input
                      type="text"
                      placeholder="e.g. SDE II"
                      value={newUserJobTitle}
                      onChange={(e) => setNewUserJobTitle(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateUserOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  {isProcessing ? 'Creating in DB...' : 'Create Active Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. ALUMNI REJECTION REASON MODAL */}
      {rejectionTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-extrabold">Reject Alumni Registration</h3>
            </div>
            <p className="text-xs text-slate-600">
              Please specify the reason for declining <strong>{rejectionTargetUser.name}</strong>'s verification:
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 text-xs"
            />

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectionTargetUser(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectAlumni}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                {isProcessing ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. CREATE / EDIT EVENT MODAL */}
      {(isCreateEventOpen || editingEvent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>{editingEvent ? 'Edit Institutional Event' : 'Publish Institutional Event'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsCreateEventOpen(false);
                  setEditingEvent(null);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Alumni Convocation & Tech Fair 2026"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Event Type *</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as EventType)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Alumni Meet">Alumni Meet</option>
                    <option value="Career Fair">Career Fair</option>
                    <option value="Reunion">Reunion</option>
                    <option value="Guest Lecture">Guest Lecture</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Max Capacity (Seats)</label>
                  <input
                    type="number"
                    min={10}
                    max={1000}
                    value={eventMaxCap}
                    onChange={(e) => setEventMaxCap(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Event Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="10:00 AM - 01:00 PM"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Venue / Physical Location *</label>
                <input
                  type="text"
                  required
                  placeholder="Main Auditorium / Hybrid Zoom"
                  value={eventVenue}
                  onChange={(e) => setEventVenue(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Event Description</label>
                <textarea
                  rows={3}
                  placeholder="Agenda, keynote speakers, topics covered..."
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateEventOpen(false);
                    setEditingEvent(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                >
                  {isProcessing ? 'Saving...' : editingEvent ? 'Update Event' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. EVENT ATTENDEES ROSTER MODAL */}
      {rosterEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Registered Attendees Roster: {rosterEvent.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {rosterEvent.registeredUserIds.length} of {rosterEvent.maxParticipants} Confirmed Attendees
                </p>
              </div>
              <button
                onClick={() => setRosterEvent(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
              {rosterEvent.registeredUserIds.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No attendees have registered for this event yet.
                </div>
              ) : (
                rosterEvent.registeredUserIds.map((uid, idx) => {
                  const attendee = users.find((u) => u.id === uid);
                  return (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <img
                          src={attendee?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={attendee?.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{attendee?.name || uid}</span>
                          <span className="text-[11px] text-slate-500">
                            {attendee?.email} • {attendee?.department}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {attendee?.role || 'ATTENDEE'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500">Official Roster generated for Dean verification</span>
              <button
                onClick={() => setRosterEvent(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. REASSIGN MENTOR MODAL */}
      {reassignTargetReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Reassign Student Mentorship</h3>
              <button
                onClick={() => setReassignTargetReq(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Select an available, verified alumnus to take over this mentorship engagement for student{' '}
              <strong>
                {users.find((u) => u.id === reassignTargetReq.studentId)?.name || 'Student'}
              </strong>
              :
            </p>

            <div>
              <label className="font-bold text-slate-700 block mb-1 text-xs">New Mentor Selection</label>
              <select
                value={selectedNewMentorId}
                onChange={(e) => setSelectedNewMentorId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs bg-white"
              >
                <option value="">-- Choose verified alumni mentor --</option>
                {verifiedAlumni
                  .filter((a) => a.id !== reassignTargetReq.mentorId)
                  .map((alumnus) => (
                    <option key={alumnus.id} value={alumnus.id}>
                      {alumnus.name} ({alumnus.jobTitle} @ {alumnus.company})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setReassignTargetReq(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedNewMentorId || isProcessing}
                onClick={handleConfirmReassignMentor}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? 'Updating in JPA...' : 'Confirm Reassignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. CREATE CAMPUS CAREER DRIVE MODAL */}
      {isCreateDriveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <span>Publish Official Campus Placement Drive</span>
              </h3>
              <button
                onClick={() => setIsCreateDriveOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCareerDrive} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Opportunity Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Graduate Software Engineer (2026 Batch)"
                  value={driveTitle}
                  onChange={(e) => setDriveTitle(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hiring Corporation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cisco Systems India"
                    value={driveCompany}
                    onChange={(e) => setDriveCompany(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Employment Type *</label>
                  <select
                    value={driveType}
                    onChange={(e) => setDriveType(e.target.value as OpportunityType)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Full-time Job">Full-time Job</option>
                    <option value="Internship">Internship</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Salary / Stipend *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹16 - 22 LPA"
                    value={driveSalary}
                    onChange={(e) => setDriveSalary(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Work Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="Bengaluru / Hyderabad"
                    value={driveLocation}
                    onChange={(e) => setDriveLocation(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Skills (Comma separated)</label>
                <input
                  type="text"
                  placeholder="Java, Spring Boot, MySQL, Cloud"
                  value={driveSkills}
                  onChange={(e) => setDriveSkills(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Drive Description &amp; Eligibility</label>
                <textarea
                  rows={3}
                  placeholder="Eligibility criteria, test dates, interview rounds..."
                  value={driveDesc}
                  onChange={(e) => setDriveDesc(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateDriveOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  {isProcessing ? 'Publishing...' : 'Publish Campus Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. OFFICIAL 80G TAX EXEMPTION RECEIPT CERTIFICATE MODAL */}
      {viewReceiptContrib && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-8 shadow-2xl space-y-6 border border-slate-200 relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-900 text-white flex items-center justify-center font-black">
                  NIT
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">National Institute of Technology &amp; Engineering</h3>
                  <p className="text-[11px] text-slate-500">Alumni Endowment &amp; Philanthropic Giving Fund</p>
                </div>
              </div>
              <button
                onClick={() => setViewReceiptContrib(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-1">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs inline-block">
                SECTION 80G TAX EXEMPTION RECEIPT
              </span>
              <div className="text-[11px] font-mono text-slate-400">Receipt Ref: {receiptNumber}</div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2.5">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Donor Name:</span>
                <span className="font-bold text-slate-900">{viewReceiptContrib.alumniName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Contribution Amount:</span>
                <span className="font-extrabold text-emerald-700 text-sm">
                  ₹{(viewReceiptContrib.amount || 0).toLocaleString()} (INR)
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Endowment Category:</span>
                <span className="font-semibold text-slate-800">
                  {viewReceiptContrib.contributionType || viewReceiptContrib.type}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">PAN of University Trust:</span>
                <span className="font-mono font-bold text-slate-900">AAATN4582E</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">IT Exemption Code:</span>
                <span className="font-semibold text-slate-700">80G(5)(vi) Order No. 2023/NIT/80G</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center leading-relaxed">
              This receipt confirms that the aforementioned contribution was made to the university endowment fund and is eligible for 50% tax deduction under Section 80G of the Income Tax Act, 1961.
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
              <div className="text-center">
                <div className="w-24 border-b border-slate-300 mx-auto mb-1"></div>
                <span className="text-[10px] text-slate-400">Finance Comptroller</span>
              </div>

              <div className="text-center">
                <div className="w-28 border-b border-slate-300 mx-auto mb-1"></div>
                <span className="text-[10px] font-bold text-purple-900">Dr. Rajeshwari Swaminathan</span>
                <span className="text-[9px] text-slate-400 block">Dean, Alumni Affairs</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. NAAC CRITERIA 5 ACCREDITATION REPORT MODAL */}
      {isNaacReportOpen && naacReportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800">
                  NATIONAL ASSESSMENT &amp; ACCREDITATION COUNCIL (NAAC)
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  Criterion 5.4 - Alumni Engagement Audit Report
                </h3>
              </div>
              <button
                onClick={() => setIsNaacReportOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Institution</span>
                  <span className="font-bold text-slate-800">NIT Engineering</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Academic Year</span>
                  <span className="font-bold text-slate-800">{naacReportData.academicYear}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Accreditation</span>
                  <span className="font-bold text-emerald-700">{naacReportData.complianceScore}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Audit Date</span>
                  <span className="font-mono text-slate-700">
                    {new Date(naacReportData.generatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">Metric 5.4.1 - Institutional Contribution Records:</h4>
                <div className="space-y-1.5 divide-y divide-slate-100 border border-slate-200 rounded-lg p-3">
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-600">Total Registered Alumni Database Size:</span>
                    <span className="font-extrabold text-slate-900">{naacReportData.totalRegisteredAlumni} Alumni</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-600">Verified Active Career Mentors:</span>
                    <span className="font-extrabold text-blue-700">{naacReportData.activeMentors} Mentors</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-600">Total Financial Giving &amp; Endowments (INR):</span>
                    <span className="font-extrabold text-emerald-700">
                      ₹{naacReportData.totalAlumniFinancialContributionINR.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-600">Total Student Mentorship Hours Logged:</span>
                    <span className="font-extrabold text-purple-700">{naacReportData.totalMentorshipHoursLogged} Hours</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-600">Alumni-Led Workshops &amp; Guest Lectures:</span>
                    <span className="font-extrabold text-slate-900">
                      {naacReportData.alumniLedSeminarsAndWorkshops} Sessions
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-mono text-[10px]">
                Report Hash: SHA256-NITE-NAAC-5.4-AUDITED
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const csvContent =
                      'data:text/csv;charset=utf-8,' +
                      'Metric,Value\n' +
                      `Registered Alumni,${naacReportData.totalRegisteredAlumni}\n` +
                      `Active Mentors,${naacReportData.activeMentors}\n` +
                      `Total Financial Contributions INR,${naacReportData.totalAlumniFinancialContributionINR}\n` +
                      `Mentorship Hours,${naacReportData.totalMentorshipHoursLogged}\n` +
                      `Alumni Workshops,${naacReportData.alumniLedSeminarsAndWorkshops}\n`;
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', 'NAAC_Criterion_5_4_Alumni_Report.csv');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
