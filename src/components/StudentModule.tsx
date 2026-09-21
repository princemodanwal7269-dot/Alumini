import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  Users,
  UserCheck,
  Calendar,
  Briefcase,
  Search,
  UserPlus,
  Check,
  Clock,
  MessageSquare,
  Sparkles,
  Edit3,
  ExternalLink,
  Shield,
  Save,
  CheckCircle2,
  XCircle,
  Terminal,
  Code,
  Building,
  MapPin,
  Send,
  Trash2,
  Filter,
  FileText,
  Linkedin,
  Github,
  Award,
  AlertCircle,
} from 'lucide-react';
import {
  User,
  Connection,
  MentorshipRequest,
  EventItem,
  CareerOpportunity,
  JobApplication,
  MentorshipCategory,
} from '../types';
import { StudentApiService, ApiLogEntry } from '../services/studentApiService';
import { StorageService } from '../services/storageService';

interface StudentModuleProps {
  currentUser: User;
  users: User[];
  connections: Connection[];
  mentorshipRequests: MentorshipRequest[];
  events: EventItem[];
  opportunities: CareerOpportunity[];
  applications: JobApplication[];
  onRefreshData: () => void;
  onOpenMessages: (targetUserId?: string) => void;
  onOpenAuthModal: () => void;
}

export const StudentModule: React.FC<StudentModuleProps> = ({
  currentUser,
  users,
  connections,
  mentorshipRequests,
  events,
  opportunities,
  applications,
  onRefreshData,
  onOpenMessages,
  onOpenAuthModal,
}) => {
  // Navigation within Student Module
  const [activeTab, setActiveTab] = useState<
    'overview' | 'profile' | 'alumni' | 'network' | 'mentorship' | 'events' | 'careers' | 'api-logs'
  >('overview');

  // Live API Logs
  const [apiLogs, setApiLogs] = useState<ApiLogEntry[]>(StudentApiService.getRecentLogs());
  const [showApiConsole, setShowApiConsole] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(
    null
  );

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Subscribe to live API logs
  useEffect(() => {
    const unsubscribe = StudentApiService.subscribe((newLog) => {
      setApiLogs((prev) => [newLog, ...prev.slice(0, 49)]);
    });
    return unsubscribe;
  }, []);

  // -------------------------------------------------------------
  // PROFILE STATE & ACTIONS
  // -------------------------------------------------------------
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileRoll, setProfileRoll] = useState(currentUser.rollNumber || currentUser.studentRollNo || '2021CSB1042');
  const [profileDept, setProfileDept] = useState(currentUser.department);
  const [profileGradYear, setProfileGradYear] = useState<number>(currentUser.graduationYear || 2025);
  const [profileSemester, setProfileSemester] = useState(currentUser.semester || '6th Semester');
  const [profileCgpa, setProfileCgpa] = useState<number>(currentUser.cgpa || 8.85);
  const [profileHeadline, setProfileHeadline] = useState(
    currentUser.headline || 'Aspiring Software Engineer | Open Source Enthusiast'
  );
  const [profileBio, setProfileBio] = useState(
    currentUser.bio ||
      'Undergraduate student passionate about cloud computing, distributed systems, and modern web architectures. Actively looking for industry guidance.'
  );
  const [profileSkills, setProfileSkills] = useState<string[]>(
    currentUser.skills || ['Java', 'Spring Boot', 'SQL', 'Data Structures', 'React']
  );
  const [newSkillInput, setNewSkillInput] = useState('');
  const [profileGithub, setProfileGithub] = useState(currentUser.githubUrl || 'https://github.com/student');
  const [profileLinkedin, setProfileLinkedin] = useState(
    currentUser.linkedinUrl || 'https://linkedin.com/in/student'
  );
  const [profileResume, setProfileResume] = useState(
    currentUser.resumeUrl || 'https://drive.google.com/sample-student-resume.pdf'
  );
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Sync profile form state when currentUser changes
  useEffect(() => {
    setProfileName(currentUser.name);
    setProfileRoll(currentUser.rollNumber || currentUser.studentRollNo || '2021CSB1042');
    setProfileDept(currentUser.department);
    setProfileGradYear(currentUser.graduationYear || 2025);
    setProfileSemester(currentUser.semester || '6th Semester');
    setProfileCgpa(currentUser.cgpa || 8.85);
    setProfileHeadline(currentUser.headline || 'Aspiring Software Engineer | Open Source Enthusiast');
    setProfileBio(currentUser.bio || '');
    setProfileSkills(currentUser.skills || ['Java', 'Spring Boot', 'SQL']);
    setProfileGithub(currentUser.githubUrl || 'https://github.com/student');
    setProfileLinkedin(currentUser.linkedinUrl || 'https://linkedin.com/in/student');
    setProfileResume(currentUser.resumeUrl || 'https://drive.google.com/sample-student-resume.pdf');
  }, [currentUser]);

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (newSkillInput.trim() && !profileSkills.includes(newSkillInput.trim())) {
      setProfileSkills([...profileSkills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfileSkills(profileSkills.filter((s) => s !== skillToRemove));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await StudentApiService.updateStudentProfile(currentUser.id, {
        name: profileName,
        rollNumber: profileRoll,
        studentRollNo: profileRoll,
        department: profileDept,
        graduationYear: profileGradYear,
        semester: profileSemester,
        cgpa: profileCgpa,
        headline: profileHeadline,
        bio: profileBio,
        skills: profileSkills,
        githubUrl: profileGithub,
        linkedinUrl: profileLinkedin,
        resumeUrl: profileResume,
      });
      onRefreshData();
      showToast('Profile updated via PUT /api/students/profile (200 OK)');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // -------------------------------------------------------------
  // ALUMNI SEARCH & NETWORKING
  // -------------------------------------------------------------
  const [alumniKeyword, setAlumniKeyword] = useState('');
  const [alumniDeptFilter, setAlumniDeptFilter] = useState('ALL');
  const [alumniMentoringOnly, setAlumniMentoringOnly] = useState(false);
  const [requestingConnId, setRequestingConnId] = useState<string | null>(null);

  // Mentorship Proposal Modal
  const [mentorshipModalOpen, setMentorshipModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<User | null>(null);
  const [mentorCategory, setMentorCategory] = useState<MentorshipCategory>('Career Guidance');
  const [mentorMessage, setMentorMessage] = useState('');
  const [isSubmittingMentorReq, setIsSubmittingMentorReq] = useState(false);

  // Job Application Modal
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<CareerOpportunity | null>(null);
  const [coverNote, setCoverNote] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [isSubmittingJobApp, setIsSubmittingJobApp] = useState(false);

  // Filtered Alumni
  const filteredAlumni = useMemo(() => {
    let list = users.filter((u) => u.role === 'ALUMNI');
    if (alumniKeyword.trim()) {
      const q = alumniKeyword.toLowerCase().trim();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          (u.company && u.company.toLowerCase().includes(q)) ||
          (u.jobTitle && u.jobTitle.toLowerCase().includes(q)) ||
          (u.skills && u.skills.some((s) => s.toLowerCase().includes(q)))
      );
    }
    if (alumniDeptFilter !== 'ALL') {
      list = list.filter((u) => u.department === alumniDeptFilter);
    }
    if (alumniMentoringOnly) {
      list = list.filter((u) => u.isAvailableForMentoring);
    }
    return list;
  }, [users, alumniKeyword, alumniDeptFilter, alumniMentoringOnly]);

  // Check connection status between currentUser and target alumni
  const getConnectionState = (alumniId: string) => {
    const conn = connections.find(
      (c) =>
        (c.requesterId === currentUser.id && c.receiverId === alumniId) ||
        (c.requesterId === alumniId && c.receiverId === currentUser.id)
    );
    if (!conn) return { status: 'NONE', connectionId: null };
    if (conn.status === 'ACCEPTED') return { status: 'CONNECTED', connectionId: conn.id };
    if (conn.requesterId === currentUser.id) return { status: 'PENDING_SENT', connectionId: conn.id };
    return { status: 'PENDING_RECEIVED', connectionId: conn.id };
  };

  const handleSendConnection = async (alumniId: string) => {
    setRequestingConnId(alumniId);
    try {
      await StudentApiService.sendConnectionRequest(currentUser.id, alumniId);
      onRefreshData();
      showToast('Connection request sent via POST /api/connections/request (201 Created)');
    } catch (err: any) {
      showToast(err.message || 'Error sending request', 'error');
    } finally {
      setRequestingConnId(null);
    }
  };

  const handleCancelConnection = async (connectionId: string) => {
    try {
      await StudentApiService.removeConnection(connectionId);
      onRefreshData();
      showToast('Connection deleted via DELETE /api/connections/{id} (200 OK)');
    } catch (err: any) {
      showToast(err.message || 'Error cancelling connection', 'error');
    }
  };

  const handleOpenMentorshipModal = (mentor: User) => {
    setSelectedMentor(mentor);
    setMentorCategory('Career Guidance');
    setMentorMessage(
      `Hi ${mentor.name}, I am a ${currentUser.department} student. I would love to get your mentorship and guidance on building my career in tech.`
    );
    setMentorshipModalOpen(true);
  };

  const handleSubmitMentorship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor) return;
    setIsSubmittingMentorReq(true);
    try {
      await StudentApiService.requestMentorship(
        currentUser.id,
        selectedMentor.id,
        mentorCategory,
        mentorMessage.trim()
      );
      onRefreshData();
      setMentorshipModalOpen(false);
      showToast(`Mentorship request sent to ${selectedMentor.name} via POST /api/mentorship/request`);
    } catch (err: any) {
      showToast(err.message || 'Failed to submit mentorship', 'error');
    } finally {
      setIsSubmittingMentorReq(false);
    }
  };

  // -------------------------------------------------------------
  // EVENT REGISTRATION ACTIONS
  // -------------------------------------------------------------
  const [eventFilter, setEventFilter] = useState<'ALL' | 'MY_REGISTERED'>('ALL');

  const handleToggleEventRegistration = async (event: EventItem) => {
    const isRegistered = event.registeredUserIds.includes(currentUser.id);
    try {
      if (isRegistered) {
        await StudentApiService.cancelEventRegistration(event.id, currentUser.id);
        showToast(`Cancelled RSVP for "${event.title}" via DELETE /api/events/{id}/register`);
      } else {
        const success = await StudentApiService.registerForEvent(event.id, currentUser.id);
        if (success) {
          showToast(`Confirmed RSVP for "${event.title}" via POST /api/events/{id}/register`);
        } else {
          showToast('Event is at maximum capacity', 'error');
        }
      }
      onRefreshData();
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  // -------------------------------------------------------------
  // CAREER / JOB ACTIONS
  // -------------------------------------------------------------
  const [careerTypeFilter, setCareerTypeFilter] = useState('ALL');

  const filteredOpportunities = useMemo(() => {
    if (careerTypeFilter === 'ALL') return opportunities;
    return opportunities.filter((o) => o.type === careerTypeFilter);
  }, [opportunities, careerTypeFilter]);

  const handleOpenJobModal = (job: CareerOpportunity) => {
    setSelectedJob(job);
    setCoverNote(
      `Hello ${job.postedByName}, I am writing to express my strong interest in the ${job.title} role at ${job.company}. My technical background in ${profileSkills.slice(0, 3).join(', ')} aligns well with your requirements.`
    );
    setPortfolioLink(profileGithub || profileLinkedin);
    setJobModalOpen(true);
  };

  const handleSubmitJobApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setIsSubmittingJobApp(true);
    try {
      await StudentApiService.applyForJob(selectedJob.id, currentUser.id, coverNote, portfolioLink);
      onRefreshData();
      setJobModalOpen(false);
      showToast(`Application submitted for ${selectedJob.title} via POST /api/jobs/{id}/apply (201 Created)`);
    } catch (err: any) {
      showToast(err.message || 'Failed to submit application', 'error');
    } finally {
      setIsSubmittingJobApp(false);
    }
  };

  // Student specific statistics
  const myMentorshipRequests = mentorshipRequests.filter((r) => r.studentId === currentUser.id);
  const myAcceptedConnections = connections.filter(
    (c) =>
      c.status === 'ACCEPTED' && (c.requesterId === currentUser.id || c.receiverId === currentUser.id)
  );
  const myRegisteredEvents = events.filter((e) => e.registeredUserIds.includes(currentUser.id));
  const myApplications = applications.filter((a) => a.applicantId === currentUser.id);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center space-x-3 text-sm font-medium animate-in fade-in slide-in-from-bottom-5 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : toastMessage.type === 'error'
                ? 'bg-rose-900 text-rose-100 border-rose-700'
                : 'bg-blue-900 text-blue-100 border-blue-700'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Top Student Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-xs">
                  Active
                </span>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">{currentUser.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    B.Tech Student
                  </span>
                </div>
                <p className="text-sm text-slate-600 font-medium mt-0.5">{profileHeadline}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                  <span className="flex items-center font-mono text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                    Roll: {profileRoll}
                  </span>
                  <span>•</span>
                  <span>{currentUser.department}</span>
                  <span>•</span>
                  <span>Batch {currentUser.graduationYear} ({profileSemester})</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold">CGPA: {profileCgpa}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons & REST API Live Toggle */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <button
                onClick={() => setShowApiConsole(!showApiConsole)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 border transition-all cursor-pointer ${
                  showApiConsole
                    ? 'bg-slate-900 text-amber-300 border-slate-900 shadow-md'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Terminal className="w-4 h-4 text-amber-500" />
                <span>REST API Console</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 text-[10px] font-mono">
                  {apiLogs.length}
                </span>
              </button>

              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-slate-600" />
                <span>Switch / Register</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div
              onClick={() => setActiveTab('network')}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 transition-colors cursor-pointer"
            >
              <div className="text-xs text-slate-500 font-semibold flex items-center">
                <Users className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> Alumni Network
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">{myAcceptedConnections.length} Connected</div>
            </div>

            <div
              onClick={() => setActiveTab('mentorship')}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 transition-colors cursor-pointer"
            >
              <div className="text-xs text-slate-500 font-semibold flex items-center">
                <UserCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Mentorships
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">{myMentorshipRequests.length} Active / Pending</div>
            </div>

            <div
              onClick={() => setActiveTab('events')}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-purple-50/60 border border-slate-200/80 transition-colors cursor-pointer"
            >
              <div className="text-xs text-slate-500 font-semibold flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-purple-600" /> Campus Events
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">{myRegisteredEvents.length} Enrolled</div>
            </div>

            <div
              onClick={() => setActiveTab('careers')}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200/80 transition-colors cursor-pointer"
            >
              <div className="text-xs text-slate-500 font-semibold flex items-center">
                <Briefcase className="w-3.5 h-3.5 mr-1.5 text-amber-600" /> Job Applications
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">{myApplications.length} Submitted</div>
            </div>
          </div>
        </div>

        {/* Live Spring Boot REST API Console Drawer */}
        {showApiConsole && (
          <div className="bg-slate-950 text-slate-200 rounded-2xl border border-slate-800 shadow-xl overflow-hidden animate-in fade-in">
            <div className="px-6 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono font-bold text-white">
                  Spring Boot 3.2 REST API Execution Inspector
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  Live Dispatch
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => StudentApiService.clearLogs()}
                  className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 cursor-pointer"
                >
                  Clear Logs
                </button>
                <button
                  onClick={() => setShowApiConsole(false)}
                  className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-900/80 p-2 font-mono text-xs">
              {apiLogs.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  No REST calls logged yet. Perform any action (send connection, apply for a job, update profile) to see live API execution.
                </div>
              ) : (
                apiLogs.map((log) => (
                  <div key={log.id} className="p-3 hover:bg-slate-900/60 rounded-lg transition-colors space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.method === 'POST'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : log.method === 'GET'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : log.method === 'PUT'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {log.method}
                        </span>
                        <span className="text-white font-semibold">{log.endpoint}</span>
                        <span
                          className={`text-[10px] px-1.5 rounded ${
                            log.status < 300 ? 'text-emerald-400 bg-emerald-950' : 'text-rose-400 bg-rose-950'
                          }`}
                        >
                          {log.status} {log.statusText}
                        </span>
                        <span className="text-slate-500 text-[10px]">{log.durationMs}ms</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 pl-1">
                      <strong>Spring Controller:</strong> <span className="text-amber-300">{log.controller}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 pl-1 truncate">
                      <strong>Java Method:</strong> <span className="text-cyan-300">{log.javaMethod}</span>
                    </div>
                    {log.sqlQuery && (
                      <div className="text-[10px] text-slate-400 pl-1 font-mono bg-slate-900 p-1.5 rounded border border-slate-800">
                        <span className="text-purple-400 font-bold">Hibernate SQL:</span> {log.sqlQuery}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="flex items-center space-x-1 border-b border-slate-200 overflow-x-auto scrollbar-none pb-px">
          {[
            { id: 'overview', label: 'Student Dashboard', icon: GraduationCap },
            { id: 'profile', label: 'My Profile & Skills', icon: Edit3 },
            { id: 'alumni', label: 'Alumni Search & Mentors', icon: Search },
            { id: 'network', label: 'My Network', icon: Users },
            { id: 'mentorship', label: 'Mentorship Requests', icon: UserCheck },
            { id: 'events', label: 'Campus Events', icon: Calendar },
            { id: 'careers', label: 'Internships & Jobs', icon: Briefcase },
            { id: 'api-logs', label: 'REST API Telemetry', icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* TAB 1: STUDENT DASHBOARD OVERVIEW */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Recommended Mentors */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Recommended Alumni for You</h3>
                      <p className="text-xs text-slate-500">
                        Ranked via AI compatibility algorithm based on department, skills overlap, and mentor availability.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('alumni')}
                      className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {users
                      .filter((u) => u.role === 'ALUMNI')
                      .slice(0, 4)
                      .map((alumni) => {
                        const { score, reasons } = StorageService.calculateRecommendationScore(
                          currentUser,
                          alumni
                        );
                        const conn = getConnectionState(alumni.id);

                        return (
                          <div key={alumni.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start space-x-3.5">
                              <img
                                src={alumni.avatar}
                                alt={alumni.name}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                              />
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="text-sm font-bold text-slate-900">{alumni.name}</h4>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                    {score}% Match
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600">
                                  {alumni.jobTitle} at <strong className="text-slate-800">{alumni.company}</strong>
                                </p>
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {reasons.slice(0, 2).map((r, i) => (
                                    <span
                                      key={i}
                                      className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                                    >
                                      {r}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 shrink-0">
                              {alumni.isAvailableForMentoring && (
                                <button
                                  onClick={() => handleOpenMentorshipModal(alumni)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer transition-colors"
                                >
                                  Request Mentorship
                                </button>
                              )}

                              {conn.status === 'CONNECTED' ? (
                                <button
                                  onClick={() => onOpenMessages(alumni.id)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 cursor-pointer flex items-center space-x-1"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>Message</span>
                                </button>
                              ) : conn.status === 'PENDING_SENT' ? (
                                <button
                                  onClick={() => conn.connectionId && handleCancelConnection(conn.connectionId)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 cursor-pointer"
                                >
                                  Pending (Cancel)
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleSendConnection(alumni.id)}
                                  disabled={requestingConnId === alumni.id}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-colors flex items-center space-x-1"
                                >
                                  <UserPlus className="w-3.5 h-3.5" />
                                  <span>Connect</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Upcoming Campus Events for Students */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Upcoming Campus &amp; Alumni Events</h3>
                      <p className="text-xs text-slate-500">Participate in workshops, webinars, and networking sessions.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('events')}
                      className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      Browse All Events
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {events.slice(0, 2).map((ev) => {
                      const isRegistered = ev.registeredUserIds.includes(currentUser.id);
                      return (
                        <div
                          key={ev.id}
                          className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-xs transition-shadow"
                        >
                          <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              {ev.type}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">{ev.title}</h4>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ev.description}</p>
                            <div className="flex items-center space-x-3 text-xs text-slate-500 mt-3">
                              <span className="flex items-center">
                                <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" /> {ev.date}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" /> {ev.venue}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500">
                              {ev.registeredUserIds.length}/{ev.maxParticipants} Registered
                            </span>
                            <button
                              onClick={() => handleToggleEventRegistration(ev)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                isRegistered
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {isRegistered ? 'Cancel RSVP' : 'Register via REST'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Quick Stats & My Status */}
              <div className="space-y-6">
                {/* Academic Snapshot Card */}
                <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-2xl p-6 text-white shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-300">University Record</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                      Verified Student
                    </span>
                  </div>

                  <h3 className="text-lg font-black mt-2">{currentUser.name}</h3>
                  <p className="text-xs text-blue-200">{currentUser.department}</p>

                  <div className="mt-4 space-y-2 text-xs border-t border-blue-800/80 pt-4">
                    <div className="flex justify-between">
                      <span className="text-blue-300">Roll Number:</span>
                      <span className="font-mono font-bold">{profileRoll}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-300">Degree &amp; Semester:</span>
                      <span>B.Tech ({profileSemester})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-300">Expected Graduation:</span>
                      <span>May {currentUser.graduationYear}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-300">Cumulative GPA:</span>
                      <span className="text-emerald-400 font-bold">{profileCgpa} / 10.0</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('profile')}
                    className="w-full mt-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer border border-white/20 flex items-center justify-center space-x-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Manage Academic Info</span>
                  </button>
                </div>

                {/* My Active Applications & Mentorship Tracker */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <h4 className="text-sm font-bold text-slate-900">Recent Applications</h4>
                  {myApplications.length === 0 ? (
                    <p className="text-xs text-slate-500">No applications yet. Check out student internships!</p>
                  ) : (
                    <div className="space-y-2.5">
                      {myApplications.slice(0, 3).map((app) => (
                        <div key={app.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{app.applicantName}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                              {app.status}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            Applied: {new Date(app.appliedAt || app.appliedDate || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setActiveTab('careers')}
                    className="w-full text-center text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    View Job Board ➔
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 2: MY STUDENT PROFILE & SKILLS */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-4xl mx-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Student Profile &amp; Academic Credentials</h2>
                <p className="text-xs text-slate-500">
                  Manage your academic identity. Connected to Spring Boot <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600">StudentController.java</code> via <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-600">PUT /api/students/profile</code>.
                </p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                MySQL Persistent
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    University Roll Number
                  </label>
                  <input
                    type="text"
                    value={profileRoll}
                    onChange={(e) => setProfileRoll(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department / Engineering Branch
                  </label>
                  <select
                    value={profileDept}
                    onChange={(e) => setProfileDept(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Science & Engineering">Information Science & Engineering</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Current Semester
                    </label>
                    <select
                      value={profileSemester}
                      onChange={(e) => setProfileSemester(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm"
                    >
                      <option value="1st Semester">1st Semester</option>
                      <option value="2nd Semester">2nd Semester</option>
                      <option value="3rd Semester">3rd Semester</option>
                      <option value="4th Semester">4th Semester</option>
                      <option value="5th Semester">5th Semester</option>
                      <option value="6th Semester">6th Semester</option>
                      <option value="7th Semester">7th Semester</option>
                      <option value="8th Semester">8th Semester</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Graduation Year
                    </label>
                    <input
                      type="number"
                      value={profileGradYear}
                      onChange={(e) => setProfileGradYear(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cumulative GPA (out of 10.0)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={profileCgpa}
                    onChange={(e) => setProfileCgpa(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    value={profileHeadline}
                    onChange={(e) => setProfileHeadline(e.target.value)}
                    placeholder="e.g. Aspiring Backend Developer | Java & Cloud"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              {/* Bio & Career Objectives */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Bio &amp; Career Aspirations
                </label>
                <textarea
                  rows={3}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  placeholder="Share your technical interests, projects, and goals for alumni mentors..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Skills Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Core Technical Skills &amp; Competencies
                </label>
                <div className="flex flex-wrap gap-2 mb-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {profileSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1.5 text-blue-600 hover:text-blue-900 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {profileSkills.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No skills listed yet. Add some below.</span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    placeholder="e.g. Python, Docker, Hibernate (Press Enter)"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Add Skill
                  </button>
                </div>
              </div>

              {/* Portfolio & External Links */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center">
                    <Github className="w-3.5 h-3.5 mr-1" /> GitHub Profile
                  </label>
                  <input
                    type="url"
                    value={profileGithub}
                    onChange={(e) => setProfileGithub(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center">
                    <Linkedin className="w-3.5 h-3.5 mr-1 text-blue-600" /> LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={profileLinkedin}
                    onChange={(e) => setProfileLinkedin(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center">
                    <FileText className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Resume / CV Link
                  </label>
                  <input
                    type="url"
                    value={profileResume}
                    onChange={(e) => setProfileResume(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-500 font-mono">
                  Submits JSON payload via Spring Data JPA update
                </p>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md flex items-center space-x-2 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingProfile ? 'Saving via API...' : 'Save Profile (PUT /api/students/profile)'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 3: ALUMNI SEARCH & MENTORS */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'alumni' && (
          <div className="space-y-6">
            {/* Search & Filter Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={alumniKeyword}
                    onChange={(e) => setAlumniKeyword(e.target.value)}
                    placeholder="Search alumni by name, company, job title, or skill (e.g. Google, Java)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={alumniDeptFilter}
                    onChange={(e) => setAlumniDeptFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white cursor-pointer"
                  >
                    <option value="ALL">All Departments</option>
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Science & Engineering">Information Science & Engineering</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                  </select>

                  <label className="flex items-center space-x-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alumniMentoringOnly}
                      onChange={(e) => setAlumniMentoringOnly(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Available Mentors Only</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Alumni Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAlumni.map((alumni) => {
                const { score } = StorageService.calculateRecommendationScore(currentUser, alumni);
                const conn = getConnectionState(alumni.id);

                return (
                  <div
                    key={alumni.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <img
                          src={alumni.avatar}
                          alt={alumni.name}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                        />
                        <div className="text-right">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 block">
                            {score}% Match
                          </span>
                          {alumni.isAvailableForMentoring && (
                            <span className="text-[10px] font-bold text-emerald-600 mt-1 block">
                              ● Mentoring Available
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mt-3">{alumni.name}</h3>
                      <p className="text-xs font-semibold text-blue-700">
                        {alumni.jobTitle} at <strong className="text-slate-800">{alumni.company}</strong>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {alumni.department} • Batch {alumni.graduationYear}
                      </p>

                      <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                        {alumni.bio || alumni.headline}
                      </p>

                      {/* Skills Chips */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {(alumni.skills || []).slice(0, 4).map((s) => (
                          <span
                            key={s}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      {alumni.isAvailableForMentoring && (
                        <button
                          onClick={() => handleOpenMentorshipModal(alumni)}
                          className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                        >
                          Request Mentor
                        </button>
                      )}

                      {conn.status === 'CONNECTED' ? (
                        <button
                          onClick={() => onOpenMessages(alumni.id)}
                          className="flex-1 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer flex items-center justify-center space-x-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </button>
                      ) : conn.status === 'PENDING_SENT' ? (
                        <button
                          onClick={() => conn.connectionId && handleCancelConnection(conn.connectionId)}
                          className="flex-1 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors cursor-pointer"
                        >
                          Pending (Cancel)
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendConnection(alumni.id)}
                          disabled={requestingConnId === alumni.id}
                          className="flex-1 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer flex items-center justify-center space-x-1"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Connect</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 4: MY NETWORK */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'network' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-1">My Networking Connections</h3>
              <p className="text-xs text-slate-500 mb-6">
                Direct connections and pending requests tracked in the university graph.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connections
                  .filter((c) => c.requesterId === currentUser.id || c.receiverId === currentUser.id)
                  .map((conn) => {
                    const otherUserId = conn.requesterId === currentUser.id ? conn.receiverId : conn.requesterId;
                    const otherUser = users.find((u) => u.id === otherUserId);
                    const isRequester = conn.requesterId === currentUser.id;

                    return (
                      <div
                        key={conn.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={otherUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e'}
                            alt={otherUser?.name}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{otherUser?.name}</h4>
                            <p className="text-xs text-slate-600">{otherUser?.company || otherUser?.role}</p>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded mt-1 inline-block ${
                                conn.status === 'ACCEPTED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {conn.status === 'ACCEPTED' ? 'Connected' : isRequester ? 'Request Sent' : 'Request Received'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {conn.status === 'ACCEPTED' && (
                            <button
                              onClick={() => onOpenMessages(otherUserId)}
                              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer"
                              title="Direct Message"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleCancelConnection(conn.id)}
                            className="p-2 rounded-lg bg-slate-200 hover:bg-rose-100 hover:text-rose-600 text-slate-600 cursor-pointer transition-colors"
                            title="Remove / Cancel"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 5: MENTORSHIP REQUESTS */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'mentorship' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">My Mentorship Engagements</h3>
                  <p className="text-xs text-slate-500">Track mentorship proposals, approval statuses, and meeting notes.</p>
                </div>
                <button
                  onClick={() => setActiveTab('alumni')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                >
                  Find a Mentor
                </button>
              </div>

              {myMentorshipRequests.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                  <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No mentorship requests yet</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Search our verified alumni network and propose a mentorship goal in technical skills or career prep.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myMentorshipRequests.map((req) => {
                    const mentor = users.find((u) => u.id === req.mentorId);
                    return (
                      <div
                        key={req.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start space-x-3.5">
                          <img
                            src={mentor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}
                            alt={mentor?.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-bold text-slate-900">{mentor?.name}</h4>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  req.status === 'ACCEPTED' || req.status === 'ACTIVE'
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
                            </div>
                            <p className="text-xs font-semibold text-blue-700 mt-0.5">Focus: {req.category}</p>
                            <p className="text-xs text-slate-600 mt-1 max-w-xl italic">"{req.message}"</p>
                            {req.sessionNotes && (
                              <p className="text-[11px] text-slate-500 mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                                <strong>Mentor Feedback:</strong> {req.sessionNotes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 self-end sm:self-center">
                          <button
                            onClick={() => onOpenMessages(req.mentorId)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer flex items-center space-x-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Message Mentor</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 6: CAMPUS EVENTS */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Campus Events, Webinars &amp; Meets</h3>
                  <p className="text-xs text-slate-500">
                    Register with one-click using Spring Boot <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600">EventController</code>.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEventFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      eventFilter === 'ALL'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All Events ({events.length})
                  </button>
                  <button
                    onClick={() => setEventFilter('MY_REGISTERED')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      eventFilter === 'MY_REGISTERED'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    My RSVPs ({myRegisteredEvents.length})
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events
                  .filter((ev) => eventFilter === 'ALL' || ev.registeredUserIds.includes(currentUser.id))
                  .map((ev) => {
                    const isRegistered = ev.registeredUserIds.includes(currentUser.id);
                    const spotsLeft = ev.maxParticipants - ev.registeredUserIds.length;

                    return (
                      <div
                        key={ev.id}
                        className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs flex flex-col justify-between"
                      >
                        <div className="relative h-36 bg-slate-800">
                          <img
                            src={ev.bannerImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87'}
                            alt={ev.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900/80 text-white backdrop-blur-xs">
                            {ev.type}
                          </span>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-base font-bold text-slate-900 leading-snug">{ev.title}</h4>
                            <p className="text-xs text-slate-600 mt-2 line-clamp-2">{ev.description}</p>

                            <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                              <div className="flex items-center">
                                <Calendar className="w-3.5 h-3.5 mr-2 text-slate-400" />
                                <span>{ev.date} at {ev.time}</span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-3.5 h-3.5 mr-2 text-slate-400" />
                                <span>{ev.venue}</span>
                              </div>
                              <div className="flex items-center">
                                <Users className="w-3.5 h-3.5 mr-2 text-slate-400" />
                                <span>{spotsLeft} spots available</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 pt-4 border-t border-slate-100">
                            <button
                              onClick={() => handleToggleEventRegistration(ev)}
                              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-xs ${
                                isRegistered
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                            >
                              {isRegistered ? (
                                <>
                                  <XCircle className="w-4 h-4" />
                                  <span>Cancel RSVP (DELETE /api/events/{ev.id}/register)</span>
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4" />
                                  <span>Register RSVP (POST /api/events/{ev.id}/register)</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 7: INTERNSHIPS & JOBS */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'careers' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Alumni Career &amp; Internship Opportunities</h3>
                  <p className="text-xs text-slate-500">
                    Direct openings posted by university alumni. Apply with your cover letter and portfolio via REST.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {['ALL', 'Internship', 'Full-time Job', 'Referral'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setCareerTypeFilter(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        careerTypeFilter === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredOpportunities.map((job) => {
                  const hasApplied = applications.some(
                    (a) => a.opportunityId === job.id && a.applicantId === currentUser.id
                  );

                  return (
                    <div
                      key={job.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            {job.type}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            Deadline: {job.deadline}
                          </span>
                          {hasApplied && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              ✓ Application Submitted
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-slate-900">{job.title}</h4>
                        <p className="text-xs font-semibold text-slate-700 flex items-center space-x-2">
                          <span>{job.company}</span>
                          <span>•</span>
                          <span className="text-slate-500">{job.location}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold">{job.salaryRange}</span>
                        </p>

                        <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">{job.description}</p>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {job.skillsRequired.map((s) => (
                            <span key={s} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenJobModal(job)}
                          disabled={hasApplied}
                          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            hasApplied
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                          }`}
                        >
                          {hasApplied ? 'Already Applied' : 'Quick Apply via REST'}
                        </button>
                        <span className="text-[10px] text-slate-400">
                          Posted by alumni {job.postedByName}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 8: REST API TELEMETRY & VIVA CONSOLE */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'api-logs' && (
          <div className="bg-slate-950 text-slate-200 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Terminal className="w-5 h-5 text-amber-400" />
                  <span>Student Module Spring Boot 3.2 REST API Logs</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time transaction logs showing Java controllers, DTO mappings, and Hibernate SQL queries executed by the student module.
                </p>
              </div>
              <button
                onClick={() => StudentApiService.clearLogs()}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
              >
                Clear History
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {apiLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.method === 'POST'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : log.method === 'GET'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : log.method === 'PUT'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {log.method}
                      </span>
                      <span className="text-white font-bold text-sm">{log.endpoint}</span>
                      <span className="text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded text-[11px]">
                        HTTP {log.status} {log.statusText}
                      </span>
                    </div>
                    <span className="text-slate-500 text-[11px]">{log.timestamp} ({log.durationMs}ms)</span>
                  </div>

                  <div className="text-slate-300">
                    <span className="text-slate-500">Controller:</span> <span className="text-amber-300">{log.controller}</span>
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-500">Java Method:</span> <span className="text-cyan-300">{log.javaMethod}</span>
                  </div>

                  {log.sqlQuery && (
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 text-purple-300 text-[11px]">
                      <span className="text-slate-500 font-bold">SQL: </span>
                      {log.sqlQuery}
                    </div>
                  )}

                  {log.requestPayload && (
                    <details className="text-[11px] text-slate-400">
                      <summary className="cursor-pointer text-blue-400 hover:underline">View Request Payload</summary>
                      <pre className="mt-1 p-2 bg-slate-950 rounded border border-slate-800 text-slate-300 overflow-x-auto">
                        {JSON.stringify(log.requestPayload, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* MODAL 1: REQUEST MENTORSHIP */}
        {/* ------------------------------------------------------------------ */}
        {mentorshipModalOpen && selectedMentor && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">Propose Mentorship</h3>
                </div>
                <button
                  onClick={() => setMentorshipModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
                >
                  ×
                </button>
              </div>

              <div className="flex items-center space-x-3 mb-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <img
                  src={selectedMentor.avatar}
                  alt={selectedMentor.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedMentor.name}</h4>
                  <p className="text-xs text-slate-600">{selectedMentor.jobTitle} at {selectedMentor.company}</p>
                </div>
              </div>

              <form onSubmit={handleSubmitMentorship} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Mentorship Category
                  </label>
                  <select
                    value={mentorCategory}
                    onChange={(e) => setMentorCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  >
                    <option value="Career Guidance">Career Guidance &amp; Path Finding</option>
                    <option value="Technical Skills">Technical Skills &amp; Architecture</option>
                    <option value="Interview Preparation">Coding &amp; System Design Interviews</option>
                    <option value="Resume Review">Resume &amp; Portfolio Review</option>
                    <option value="Higher Studies">Higher Studies (MS / PhD / GRE)</option>
                    <option value="Industry Guidance">Industry Domain Overview</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Your Goal &amp; Introduction Note
                  </label>
                  <textarea
                    rows={4}
                    value={mentorMessage}
                    onChange={(e) => setMentorMessage(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setMentorshipModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingMentorReq}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm"
                  >
                    {isSubmittingMentorReq ? 'Dispatching...' : 'Dispatch Request (POST /api/mentorship/request)'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* MODAL 2: APPLY FOR CAREER OPPORTUNITY */}
        {/* ------------------------------------------------------------------ */}
        {jobModalOpen && selectedJob && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900">Submit Application via REST</h3>
                </div>
                <button
                  onClick={() => setJobModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
                >
                  ×
                </button>
              </div>

              <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-900">{selectedJob.title}</div>
                <div className="text-slate-600">{selectedJob.company} • {selectedJob.location} ({selectedJob.type})</div>
              </div>

              <form onSubmit={handleSubmitJobApp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Cover Letter / Pitch to Alumni Poster
                  </label>
                  <textarea
                    rows={4}
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Portfolio / GitHub / Resume Link
                  </label>
                  <input
                    type="url"
                    value={portfolioLink}
                    onChange={(e) => setPortfolioLink(e.target.value)}
                    required
                    placeholder="https://github.com/my-username"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setJobModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingJobApp}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm"
                  >
                    {isSubmittingJobApp ? 'Submitting Application...' : 'Submit via REST (POST /api/jobs/{id}/apply)'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
