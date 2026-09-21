import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  Briefcase,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Code,
  DollarSign,
  Download,
  Edit3,
  ExternalLink,
  Filter,
  GraduationCap,
  Heart,
  Linkedin,
  Mail,
  MapPin,
  MessageSquare,
  Plus,
  Save,
  Search,
  Share2,
  Shield,
  Sparkles,
  Terminal,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import {
  User,
  Connection,
  MentorshipRequest,
  EventItem,
  CareerOpportunity,
  JobApplication,
  Contribution,
  ApplicationStatus,
  MentorshipStatus,
  ContributionType,
  EventType,
  OpportunityType,
} from '../types';
import { AlumniApiService } from '../services/alumniApiService';
import { StudentApiService, ApiLogEntry } from '../services/studentApiService';
import { StorageService } from '../services/storageService';

interface AlumniModuleProps {
  currentUser: User;
  users: User[];
  connections: Connection[];
  mentorshipRequests: MentorshipRequest[];
  events: EventItem[];
  opportunities: CareerOpportunity[];
  applications: JobApplication[];
  contributions: Contribution[];
  onRefreshData: () => void;
  onOpenMessages: (targetUserId?: string) => void;
  onOpenAuthModal: () => void;
}

export const AlumniModule: React.FC<AlumniModuleProps> = ({
  currentUser,
  users,
  connections,
  mentorshipRequests,
  events,
  opportunities,
  applications,
  contributions,
  onRefreshData,
  onOpenMessages,
  onOpenAuthModal,
}) => {
  // Navigation within Alumni Module
  const [activeTab, setActiveTab] = useState<
    'overview' | 'profile' | 'mentorship' | 'network' | 'careers' | 'events' | 'contributions' | 'api-logs'
  >('overview');

  // Live REST API logs subscription
  const [apiLogs, setApiLogs] = useState<ApiLogEntry[]>(StudentApiService.getRecentLogs());
  const [showApiConsole, setShowApiConsole] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(
    null
  );

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  useEffect(() => {
    const unsubscribe = StudentApiService.subscribe((newLog) => {
      setApiLogs((prev) => [newLog, ...prev.slice(0, 49)]);
    });
    return unsubscribe;
  }, []);

  // -------------------------------------------------------------
  // 1. ALUMNI PROFILE MANAGEMENT STATE
  // -------------------------------------------------------------
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileCompany, setProfileCompany] = useState(currentUser.company || 'Google');
  const [profileJobTitle, setProfileJobTitle] = useState(currentUser.jobTitle || 'Senior Software Engineer');
  const [profileIndustry, setProfileIndustry] = useState(currentUser.industry || 'Technology & Cloud Systems');
  const [profileDept, setProfileDept] = useState(currentUser.department);
  const [profileGradYear, setProfileGradYear] = useState<number>(currentUser.graduationYear || 2018);
  const [profileExperience, setProfileExperience] = useState<number>(currentUser.yearsOfExperience || 6);
  const [profileLocation, setProfileLocation] = useState(currentUser.location || 'Bengaluru, India');
  const [profileHeadline, setProfileHeadline] = useState(
    currentUser.headline || 'Cloud Infrastructure & Distributed Systems Specialist | Passionate Mentor'
  );
  const [profileBio, setProfileBio] = useState(
    currentUser.bio ||
      'Proud alumnus of NIT Engineering. Over 6 years leading cloud platforms and backend architectures. Dedicated to guiding undergraduates in algorithms, system design, and placement prep.'
  );
  const [profileSkills, setProfileSkills] = useState<string[]>(
    currentUser.skills || ['Java', 'Spring Boot', 'Kubernetes', 'System Design', 'Microservices', 'AWS']
  );
  const [newSkillInput, setNewSkillInput] = useState('');
  const [profileLinkedin, setProfileLinkedin] = useState(
    currentUser.linkedinUrl || 'https://linkedin.com/in/alumni'
  );
  const [profileMentoringAvailable, setProfileMentoringAvailable] = useState<boolean>(
    currentUser.isAvailableForMentoring ?? true
  );
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    setProfileName(currentUser.name);
    setProfileCompany(currentUser.company || 'Google');
    setProfileJobTitle(currentUser.jobTitle || 'Senior Software Engineer');
    setProfileIndustry(currentUser.industry || 'Technology & Cloud Systems');
    setProfileDept(currentUser.department);
    setProfileGradYear(currentUser.graduationYear || 2018);
    setProfileExperience(currentUser.yearsOfExperience || 6);
    setProfileLocation(currentUser.location || 'Bengaluru, India');
    setProfileHeadline(
      currentUser.headline || 'Cloud Infrastructure & Distributed Systems Specialist | Passionate Mentor'
    );
    setProfileBio(currentUser.bio || '');
    setProfileSkills(currentUser.skills || ['Java', 'Spring Boot', 'Kubernetes']);
    setProfileLinkedin(currentUser.linkedinUrl || 'https://linkedin.com/in/alumni');
    setProfileMentoringAvailable(currentUser.isAvailableForMentoring ?? true);
  }, [currentUser]);

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (newSkillInput.trim() && !profileSkills.includes(newSkillInput.trim())) {
      setProfileSkills([...profileSkills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfileSkills(profileSkills.filter((s) => s !== skill));
  };

  const handleToggleMentoringQuick = async (checked: boolean) => {
    setProfileMentoringAvailable(checked);
    try {
      await AlumniApiService.toggleMentoring(currentUser.id, checked);
      onRefreshData();
      showToast(
        checked
          ? 'Mentoring status set to AVAILABLE via PUT /api/alumni/{id}/mentoring-availability'
          : 'Mentoring paused',
        'info'
      );
    } catch (err: any) {
      showToast(err.message || 'Error updating status', 'error');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await AlumniApiService.updateProfile(currentUser.id, {
        name: profileName,
        company: profileCompany,
        jobTitle: profileJobTitle,
        industry: profileIndustry,
        department: profileDept,
        graduationYear: profileGradYear,
        yearsOfExperience: profileExperience,
        location: profileLocation,
        headline: profileHeadline,
        bio: profileBio,
        skills: profileSkills,
        linkedinUrl: profileLinkedin,
        isAvailableForMentoring: profileMentoringAvailable,
      });
      onRefreshData();
      showToast('Alumni profile updated via PUT /api/alumni/profile/{id} (200 OK)');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // -------------------------------------------------------------
  // 2. MENTORSHIP ACTIONS
  // -------------------------------------------------------------
  const incomingMentorships = mentorshipRequests.filter((r) => r.mentorId === currentUser.id);
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [selectedMentorship, setSelectedMentorship] = useState<MentorshipRequest | null>(null);
  const [mentorNotes, setMentorNotes] = useState('');
  const [isSubmittingMentorshipResponse, setIsSubmittingMentorshipResponse] = useState(false);

  const handleOpenMentorshipResponse = (req: MentorshipRequest) => {
    setSelectedMentorship(req);
    setMentorNotes('Accepted. Let us connect this Saturday 4 PM IST via Google Meet: https://meet.google.com/nit-alumni-mentor');
    setResponseModalOpen(true);
  };

  const handleMentorshipStatusUpdate = async (status: MentorshipStatus) => {
    if (!selectedMentorship) return;
    setIsSubmittingMentorshipResponse(true);
    try {
      await AlumniApiService.respondToMentorship(selectedMentorship.id, status, mentorNotes);
      onRefreshData();
      setResponseModalOpen(false);
      showToast(`Mentorship proposal marked as ${status} via PUT /api/mentorship/requests/{id}/status`);
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setIsSubmittingMentorshipResponse(false);
    }
  };

  // -------------------------------------------------------------
  // 3. NETWORKING ACTIONS
  // -------------------------------------------------------------
  const myPendingIncomingConnections = connections.filter(
    (c) => c.receiverId === currentUser.id && c.status === 'PENDING'
  );
  const myAcceptedConnections = connections.filter(
    (c) =>
      c.status === 'ACCEPTED' && (c.requesterId === currentUser.id || c.receiverId === currentUser.id)
  );

  const handleAcceptConnection = async (connId: string) => {
    try {
      await AlumniApiService.acceptConnection(connId);
      onRefreshData();
      showToast('Connection accepted via PUT /api/connections/{id}/accept');
    } catch (err: any) {
      showToast(err.message || 'Error accepting connection', 'error');
    }
  };

  const handleRejectConnection = async (connId: string) => {
    try {
      await AlumniApiService.rejectConnection(connId);
      onRefreshData();
      showToast('Connection request declined via PUT /api/connections/{id}/reject');
    } catch (err: any) {
      showToast(err.message || 'Error declining connection', 'error');
    }
  };

  // -------------------------------------------------------------
  // 4. CAREER OPPORTUNITIES POSTING & APPLICANTS
  // -------------------------------------------------------------
  const [postJobModalOpen, setPostJobModalOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState(currentUser.company || 'Google India');
  const [jobType, setJobType] = useState<OpportunityType>('Internship');
  const [jobLocation, setJobLocation] = useState('Bengaluru / Hybrid');
  const [jobSalary, setJobSalary] = useState('₹45,000 / month');
  const [jobDeadline, setJobDeadline] = useState('2026-11-30');
  const [jobDescription, setJobDescription] = useState(
    'Seeking passionate engineering students with hands-on knowledge of Java, Spring Boot, and REST APIs. Will work alongside senior engineers on microservices.'
  );
  const [jobSkillsStr, setJobSkillsStr] = useState('Java, Spring Boot, SQL, Git');
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);

  // View Applicants Modal
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState<CareerOpportunity | null>(null);

  const myPostedJobs = opportunities.filter((j) => j.postedById === currentUser.id);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingJob(true);
    try {
      const skillsArray = jobSkillsStr.split(',').map((s) => s.trim()).filter(Boolean);
      await AlumniApiService.postCareerOpportunity({
        title: jobTitle,
        company: jobCompany,
        type: jobType,
        location: jobLocation,
        salaryRange: jobSalary,
        deadline: jobDeadline,
        description: jobDescription,
        skillsRequired: skillsArray,
        postedById: currentUser.id,
        postedByName: currentUser.name,
        postedByRole: 'ALUMNI',
      });
      onRefreshData();
      setPostJobModalOpen(false);
      showToast(`Career opportunity "${jobTitle}" posted via POST /api/jobs (201 Created)`);
      // Reset form
      setJobTitle('');
    } catch (err: any) {
      showToast(err.message || 'Failed to post job', 'error');
    } finally {
      setIsSubmittingJob(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await AlumniApiService.deleteCareerOpportunity(jobId);
      onRefreshData();
      showToast('Career opening deleted via DELETE /api/jobs/{id}');
    } catch (err: any) {
      showToast(err.message || 'Error deleting job', 'error');
    }
  };

  const handleUpdateApplicantStatus = async (appId: string, status: ApplicationStatus) => {
    try {
      await AlumniApiService.updateApplicantStatus(appId, status);
      onRefreshData();
      showToast(`Applicant status updated to "${status}" via PUT /api/jobs/applications/{id}/status`);
    } catch (err: any) {
      showToast(err.message || 'Error updating status', 'error');
    }
  };

  // -------------------------------------------------------------
  // 5. CAMPUS & ALUMNI EVENTS
  // -------------------------------------------------------------
  const [createEventModalOpen, setCreateEventModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<EventType>('Webinar');
  const [eventDate, setEventDate] = useState('2026-11-15');
  const [eventTime, setEventTime] = useState('11:00 AM - 1:00 PM');
  const [eventVenue, setEventVenue] = useState('Virtual (Google Meet) & Tech Seminar Hall');
  const [eventMaxSeats, setEventMaxSeats] = useState(150);
  const [eventDescription, setEventDescription] = useState(
    'Join distinguished alumnus for an in-depth session on distributed systems in high-scale tech organizations.'
  );
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);

  const myHostedEvents = events.filter((e) => e.organizerId === currentUser.id);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingEvent(true);
    try {
      await AlumniApiService.createEvent({
        title: eventTitle,
        type: eventType,
        date: eventDate,
        time: eventTime,
        venue: eventVenue,
        maxParticipants: Number(eventMaxSeats),
        description: eventDescription,
        organizer: currentUser.name,
        organizerName: currentUser.name,
        organizerId: currentUser.id,
        registeredUserIds: [currentUser.id],
      });
      onRefreshData();
      setCreateEventModalOpen(false);
      showToast(`Event "${eventTitle}" scheduled via POST /api/events (201 Created)`);
      setEventTitle('');
    } catch (err: any) {
      showToast(err.message || 'Failed to create event', 'error');
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await AlumniApiService.deleteEvent(eventId);
      onRefreshData();
      showToast('Event removed from calendar via DELETE /api/events/{id}');
    } catch (err: any) {
      showToast(err.message || 'Error deleting event', 'error');
    }
  };

  // -------------------------------------------------------------
  // 6. CONTRIBUTIONS & ENDOWMENT TRACKING
  // -------------------------------------------------------------
  const [pledgeModalOpen, setPledgeModalOpen] = useState(false);
  const [contribType, setContribType] = useState<ContributionType>('Scholarship Sponsor');
  const [contribAmount, setContribAmount] = useState<number>(50000);
  const [contribDesc, setContribDesc] = useState('Annual Merit-cum-Need Scholarship for 3rd Year CSE students');
  const [isSubmittingContrib, setIsSubmittingContrib] = useState(false);

  const myContributions = contributions.filter(
    (c) => c.alumniId === currentUser.id || c.alumniName === currentUser.name
  );

  const totalContributedAmount = myContributions.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const handlePledgeContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContrib(true);
    try {
      await AlumniApiService.pledgeContribution({
        alumniId: currentUser.id,
        alumniName: currentUser.name,
        type: contribType,
        amount: Number(contribAmount),
        description: contribDesc,
      });
      onRefreshData();
      setPledgeModalOpen(false);
      showToast(`Contribution of ₹${Number(contribAmount).toLocaleString()} recorded via POST /api/contributions`);
    } catch (err: any) {
      showToast(err.message || 'Failed to record contribution', 'error');
    } finally {
      setIsSubmittingContrib(false);
    }
  };

  // Donor Recognition Tier
  const donorTier =
    totalContributedAmount >= 200000
      ? { title: 'Platinum Benefactor', color: 'from-amber-400 to-amber-600', badge: 'bg-amber-100 text-amber-900 border-amber-300' }
      : totalContributedAmount >= 50000
      ? { title: 'Gold Benefactor', color: 'from-yellow-400 to-yellow-600', badge: 'bg-yellow-100 text-yellow-900 border-yellow-300' }
      : totalContributedAmount > 0
      ? { title: 'Silver Patron', color: 'from-slate-400 to-slate-600', badge: 'bg-slate-100 text-slate-800 border-slate-300' }
      : { title: 'Alumni Contributor', color: 'from-blue-400 to-blue-600', badge: 'bg-blue-50 text-blue-800 border-blue-200' };

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

        {/* Top Alumni Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center space-x-4">
              <div className="relative shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-600 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold shadow-xs">
                  Verified
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">{currentUser.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    Distinguished Alumni
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${donorTier.badge}`}>
                    {donorTier.title}
                  </span>
                </div>

                <p className="text-sm text-slate-700 font-semibold mt-0.5">
                  {profileJobTitle} at <span className="text-blue-700 font-bold">{profileCompany}</span>
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                  <span className="flex items-center text-slate-700 font-medium">
                    <GraduationCap className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {profileDept} (Batch of {profileGradYear})
                  </span>
                  <span>•</span>
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {profileLocation}
                  </span>
                  <span>•</span>
                  <span>{profileExperience}+ Years Industry Exp</span>
                </div>
              </div>
            </div>

            {/* Quick Action Controls */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              {/* Mentoring Availability Toggle */}
              <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileMentoringAvailable}
                    onChange={(e) => handleToggleMentoringQuick(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
                <span className="font-bold text-slate-700">
                  {profileMentoringAvailable ? 'Mentoring Active' : 'Mentoring Off'}
                </span>
              </div>

              <button
                onClick={() => setShowApiConsole(!showApiConsole)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 border transition-all cursor-pointer ${
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
                onClick={() => setActiveTab('profile')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div
              onClick={() => setActiveTab('network')}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 transition-colors cursor-pointer"
            >
              <div className="text-xs text-slate-500 font-semibold flex items-center">
                <Users className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> My Network
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {myAcceptedConnections.length} Connected
                {myPendingIncomingConnections.length > 0 && (
                  <span className="text-xs font-bold text-amber-600 ml-1.5">
                    ({myPendingIncomingConnections.length} pending)
                  </span>
                )}
              </div>
            </div>

            <div
              onClick={() => setActiveTab('mentorship')}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 transition-colors cursor-pointer"
            >
              <div className="text-xs text-slate-500 font-semibold flex items-center">
                <UserCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Student Mentorships
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {incomingMentorships.filter((m) => m.status === 'PENDING').length} New Proposals
              </div>
            </div>

            <div
              onClick={() => setActiveTab('careers')}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-purple-50/60 border border-slate-200/80 transition-colors cursor-pointer"
            >
              <div className="text-xs text-slate-500 font-semibold flex items-center">
                <Briefcase className="w-3.5 h-3.5 mr-1.5 text-purple-600" /> Posted Jobs &amp; Drives
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">{myPostedJobs.length} Openings</div>
            </div>

            <div
              onClick={() => setActiveTab('contributions')}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200/80 transition-colors cursor-pointer"
            >
              <div className="text-xs text-slate-500 font-semibold flex items-center">
                <Award className="w-3.5 h-3.5 mr-1.5 text-amber-600" /> Contributions Given
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">
                ₹{totalContributedAmount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Live Spring Boot REST API Telemetry Console Drawer */}
        {showApiConsole && (
          <div className="bg-slate-950 text-slate-200 rounded-2xl border border-slate-800 shadow-xl overflow-hidden animate-in fade-in">
            <div className="px-6 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono font-bold text-white">
                  Spring Boot 3.2 Alumni API Execution Stream
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
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
                  No REST calls logged yet. Perform an action (post a job, accept a mentorship, pledge donation) to view live execution logs.
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
                      <strong>Controller:</strong> <span className="text-amber-300">{log.controller}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 pl-1 truncate">
                      <strong>Method:</strong> <span className="text-cyan-300">{log.javaMethod}</span>
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
            { id: 'overview', label: 'Alumni Overview', icon: GraduationCap },
            { id: 'profile', label: 'Profile & Expertise', icon: Edit3 },
            { id: 'mentorship', label: `Mentorship (${incomingMentorships.filter((m) => m.status === 'PENDING').length} New)`, icon: UserCheck },
            { id: 'network', label: 'Networking & Requests', icon: Users },
            { id: 'careers', label: 'Post Jobs & Referrals', icon: Briefcase },
            { id: 'events', label: 'Campus Events & Talks', icon: Calendar },
            { id: 'contributions', label: 'Endowments & Giving', icon: Award },
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
        {/* TAB 1: ALUMNI OVERVIEW */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Pending Mentorship & Fast Actions */}
              <div className="lg:col-span-2 space-y-6">
                {/* Pending Mentorship Inquiries */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Student Mentorship Proposals</h3>
                      <p className="text-xs text-slate-500">
                        Undergraduates requesting your industry guidance in algorithms, cloud, or system design.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('mentorship')}
                      className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      View All ({incomingMentorships.length})
                    </button>
                  </div>

                  {incomingMentorships.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-200 rounded-xl">
                      No mentorship requests right now. Keep your mentoring toggle active to receive proposals!
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {incomingMentorships.slice(0, 3).map((req) => {
                        const student = users.find((u) => u.id === req.studentId);
                        return (
                          <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start space-x-3">
                              <img
                                src={student?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}
                                alt={student?.name}
                                className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                              />
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="text-sm font-bold text-slate-900">{student?.name}</h4>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                    {req.category}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-0.5">{student?.department} • Roll: {student?.rollNumber || student?.studentRollNo}</p>
                                <p className="text-xs text-slate-500 italic mt-1 line-clamp-1">"{req.message}"</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 shrink-0">
                              {req.status === 'PENDING' ? (
                                <button
                                  onClick={() => handleOpenMentorshipResponse(req)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
                                >
                                  Respond / Accept
                                </button>
                              ) : (
                                <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                                  Status: {req.status}
                                </span>
                              )}
                              <button
                                onClick={() => onOpenMessages(req.studentId)}
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
                                title="Message Student"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Quick Career Postings & Applicant Tracker */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Your Posted Career Drives</h3>
                      <p className="text-xs text-slate-500">
                        Help campus juniors break into industry by posting internships and referrals.
                      </p>
                    </div>
                    <button
                      onClick={() => setPostJobModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Post Opening</span>
                    </button>
                  </div>

                  {myPostedJobs.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-200 rounded-xl">
                      You haven't posted any jobs yet. Click "Post Opening" to share opportunities with students!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myPostedJobs.map((job) => {
                        const jobApplicants = applications.filter((a) => a.opportunityId === job.id);
                        return (
                          <div
                            key={job.id}
                            className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-bold text-slate-900">{job.title}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                  {job.type}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1">
                                {job.company} • {job.location} • <strong className="text-emerald-700">{job.salaryRange}</strong>
                              </p>
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setSelectedJobForApplicants(job)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 cursor-pointer flex items-center space-x-1"
                              >
                                <Users className="w-3.5 h-3.5" />
                                <span>{jobApplicants.length} Applicants</span>
                              </button>

                              <button
                                onClick={() => handleDeleteJob(job.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="Delete Job"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Giving / Endowments & Fast Tools */}
              <div className="space-y-6">
                {/* Giving Card */}
                <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-300">Giving &amp; Endowments</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${donorTier.badge}`}>
                      {donorTier.title}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="text-2xl font-black">₹{totalContributedAmount.toLocaleString()}</div>
                    <p className="text-xs text-slate-300 mt-0.5">Total Institutional Contributions</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-blue-800/60 text-xs space-y-2 text-blue-200">
                    <div className="flex justify-between">
                      <span>Pledges / Endowments:</span>
                      <span className="font-bold text-white">{myContributions.length} Recorded</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="text-emerald-400 font-bold">100% Verified in Ledger</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setPledgeModalOpen(true)}
                    className="w-full mt-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-md flex items-center justify-center space-x-1.5"
                  >
                    <Award className="w-4 h-4" />
                    <span>Pledge / Donate (POST /api/contributions)</span>
                  </button>
                </div>

                {/* Host a Campus Lecture or Webinar */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
                  <div className="flex items-center space-x-2 text-blue-700">
                    <Calendar className="w-5 h-5" />
                    <h4 className="text-sm font-bold text-slate-900">Host an Alumni Guest Lecture</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Share your technical and industry insights with 500+ college students through a virtual webinar or campus workshop.
                  </p>
                  <button
                    onClick={() => setCreateEventModalOpen(true)}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Schedule Event (POST /api/events)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 2: PROFILE & EXPERTISE */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-4xl mx-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Alumni Professional Profile &amp; Mentorship Settings</h2>
                <p className="text-xs text-slate-500">
                  Update your professional bio, company role, and mentor availability via <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-600">PUT /api/alumni/profile/{currentUser.id}</code>.
                </p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Spring JPA Synchronized
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Current Company / Employer
                  </label>
                  <input
                    type="text"
                    value={profileCompany}
                    onChange={(e) => setProfileCompany(e.target.value)}
                    required
                    placeholder="e.g. Google India, Microsoft, Amazon"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Job Title / Designation
                  </label>
                  <input
                    type="text"
                    value={profileJobTitle}
                    onChange={(e) => setProfileJobTitle(e.target.value)}
                    required
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Industry Domain
                  </label>
                  <input
                    type="text"
                    value={profileIndustry}
                    onChange={(e) => setProfileIndustry(e.target.value)}
                    placeholder="e.g. Cloud Computing & FinTech"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={profileDept}
                    onChange={(e) => setProfileDept(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Science & Engineering">Information Science & Engineering</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Batch Year
                    </label>
                    <input
                      type="number"
                      value={profileGradYear}
                      onChange={(e) => setProfileGradYear(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      value={profileExperience}
                      onChange={(e) => setProfileExperience(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Current City / Base Location
                  </label>
                  <input
                    type="text"
                    value={profileLocation}
                    onChange={(e) => setProfileLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={profileLinkedin}
                    onChange={(e) => setProfileLinkedin(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Professional Headline
                </label>
                <input
                  type="text"
                  value={profileHeadline}
                  onChange={(e) => setProfileHeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Bio &amp; Mentorship Vision
                </label>
                <textarea
                  rows={3}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              {/* Skills Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Core Technical Skills &amp; Domain Expertise
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
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    placeholder="e.g. Distributed Systems, Kafka, GoLang (Press Enter)"
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

              {/* Mentoring Availability Switch */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Student Mentorship Program
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    When enabled, your profile appears with "Available for Mentoring" badge in student searches.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileMentoringAvailable}
                    onChange={(e) => setProfileMentoringAvailable(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">
                  Dispatches Spring Data JPA transactional update
                </span>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md flex items-center space-x-2 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingProfile ? 'Saving...' : 'Save Alumni Profile via REST'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 3: MENTORSHIP PROPOSALS */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'mentorship' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Student Mentorship Proposals &amp; Requests</h3>
                  <p className="text-xs text-slate-500">
                    Review undergrad goals, schedule 1-on-1 virtual sessions, and share mentor feedback.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                    {incomingMentorships.filter((m) => m.status === 'ACCEPTED').length} Active Mentorships
                  </span>
                </div>
              </div>

              {incomingMentorships.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                  <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No mentorship requests pending</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Students will find you through the alumni directory and send mentorship proposals.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incomingMentorships.map((req) => {
                    const student = users.find((u) => u.id === req.studentId);
                    return (
                      <div
                        key={req.id}
                        className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                      >
                        <div className="flex items-start space-x-4">
                          <img
                            src={student?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}
                            alt={student?.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{student?.name}</h4>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                {req.category}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
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
                            </div>

                            <p className="text-xs text-slate-600 mt-1">
                              {student?.department} • Roll: {student?.rollNumber || student?.studentRollNo} • CGPA: {student?.cgpa || 8.8}
                            </p>

                            <p className="text-xs text-slate-700 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                              "{req.message}"
                            </p>

                            {req.notes && (
                              <p className="text-[11px] text-blue-700 mt-1">
                                <strong>Your Guidance Note:</strong> {req.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {req.status === 'PENDING' && (
                            <button
                              onClick={() => handleOpenMentorshipResponse(req)}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
                            >
                              Respond via REST
                            </button>
                          )}

                          {req.status === 'ACCEPTED' && (
                            <button
                              onClick={() => {
                                setSelectedMentorship(req);
                                handleMentorshipStatusUpdate('COMPLETED');
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
                            >
                              Mark Completed
                            </button>
                          )}

                          <button
                            onClick={() => onOpenMessages(req.studentId)}
                            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                            title="Chat with Student"
                          >
                            <MessageSquare className="w-4 h-4" />
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
        {/* TAB 4: NETWORKING & CONNECTION REQUESTS */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'network' && (
          <div className="space-y-6">
            {/* Incoming Connection Requests */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-1">Incoming Networking Requests</h3>
              <p className="text-xs text-slate-500 mb-4">
                Students and fellow alumni seeking to connect directly with you.
              </p>

              {myPendingIncomingConnections.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4">No pending requests right now.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myPendingIncomingConnections.map((conn) => {
                    const sender = users.find((u) => u.id === conn.requesterId);
                    return (
                      <div
                        key={conn.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={sender?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}
                            alt={sender?.name}
                            className="w-11 h-11 rounded-xl object-cover"
                          />
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{sender?.name}</h4>
                            <p className="text-xs text-slate-600">{sender?.department} ({sender?.role})</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleAcceptConnection(conn.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectConnection(conn.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* My Active Connections */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-1">My Active Connections ({myAcceptedConnections.length})</h3>
              <p className="text-xs text-slate-500 mb-4">Established direct connections across the platform.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myAcceptedConnections.map((conn) => {
                  const otherId = conn.requesterId === currentUser.id ? conn.receiverId : conn.requesterId;
                  const otherUser = users.find((u) => u.id === otherId);
                  return (
                    <div
                      key={conn.id}
                      className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between bg-white"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={otherUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}
                          alt={otherUser?.name}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{otherUser?.name}</h4>
                          <p className="text-[11px] text-slate-500">{otherUser?.company || otherUser?.role}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenMessages(otherId)}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
                        title="Direct Message"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 5: POST JOBS & APPLICANT MANAGEMENT */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'careers' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Alumni Career Hub &amp; Job Board</h3>
                  <p className="text-xs text-slate-500">
                    Post internships, full-time roles, or referral drives and review campus applicants.
                  </p>
                </div>
                <button
                  onClick={() => setPostJobModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Opportunity (POST /api/jobs)</span>
                </button>
              </div>

              <div className="space-y-4">
                {myPostedJobs.map((job) => {
                  const jobApplicants = applications.filter((a) => a.opportunityId === job.id);
                  return (
                    <div
                      key={job.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            {job.type}
                          </span>
                          <span className="text-xs text-slate-500">Deadline: {job.deadline}</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900">{job.title}</h4>
                        <p className="text-xs text-slate-600">
                          {job.company} • {job.location} • <strong className="text-emerald-700">{job.salaryRange}</strong>
                        </p>
                        <p className="text-xs text-slate-600 max-w-2xl mt-1">{job.description}</p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => setSelectedJobForApplicants(job)}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 cursor-pointer flex items-center space-x-1.5"
                        >
                          <Users className="w-4 h-4" />
                          <span>View Applicants ({jobApplicants.length})</span>
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete Posting"
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
        {/* TAB 6: CAMPUS EVENTS & TALKS */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Campus Events &amp; Alumni Guest Talks</h3>
                  <p className="text-xs text-slate-500">
                    Host webinars, lead workshops, and participate in alumni reunions.
                  </p>
                </div>
                <button
                  onClick={() => setCreateEventModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Host New Event (POST /api/events)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((ev) => {
                  const isHost = ev.organizerId === currentUser.id;
                  return (
                    <div
                      key={ev.id}
                      className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs flex flex-col justify-between"
                    >
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              {ev.type}
                            </span>
                            {isHost && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Organized by You
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-slate-900 mt-2">{ev.title}</h4>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{ev.description}</p>
                          <div className="mt-4 space-y-1 text-xs text-slate-500">
                            <div className="flex items-center">
                              <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                              <span>{ev.date} at {ev.time}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                              <span>{ev.venue}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500">
                            {ev.registeredUserIds.length} Registered
                          </span>
                          {isHost && (
                            <button
                              onClick={() => handleDeleteEvent(ev.id)}
                              className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                            >
                              Cancel Event
                            </button>
                          )}
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
        {/* TAB 7: ENDOWMENTS & GIVING */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'contributions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Alumni Contributions &amp; Endowment Ledger</h3>
                  <p className="text-xs text-slate-500">
                    Track your donations, scholarship sponsorships, and institutional pledges.
                  </p>
                </div>
                <button
                  onClick={() => setPledgeModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <Heart className="w-4 h-4" />
                  <span>Pledge Contribution (POST /api/contributions)</span>
                </button>
              </div>

              {myContributions.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                  <Award className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No contributions recorded yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Support current university students through merit scholarships or departmental lab grants.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myContributions.map((contrib) => (
                    <div
                      key={contrib.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-slate-900">
                            {contrib.type || contrib.contributionType}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {contrib.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{contrib.description}</p>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          Transaction Date: {new Date(contrib.createdAt || contrib.date || Date.now()).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-lg font-black text-slate-900">
                          ₹{(contrib.amount || 0).toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Receipt: REC-{contrib.id.slice(-6)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 8: REST API TELEMETRY LOGS */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'api-logs' && (
          <div className="bg-slate-950 text-slate-200 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Terminal className="w-5 h-5 text-amber-400" />
                  <span>Alumni Module Spring Boot 3.2 REST API Logs</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time transaction stream demonstrating Spring Boot REST Controllers, DTO mappings, and Hibernate JPA execution.
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
                    <span className="text-slate-500">Method:</span> <span className="text-cyan-300">{log.javaMethod}</span>
                  </div>

                  {log.sqlQuery && (
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 text-purple-300 text-[11px]">
                      <span className="text-slate-500 font-bold">Hibernate SQL: </span>
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

        {/* ------------------------------------------------------------- */}
        {/* MODAL 1: RESPOND TO MENTORSHIP PROPOSAL */}
        {/* ------------------------------------------------------------- */}
        {responseModalOpen && selectedMentorship && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">Respond to Mentorship Proposal</h3>
                </div>
                <button
                  onClick={() => setResponseModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
                >
                  ×
                </button>
              </div>

              <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-900">Focus: {selectedMentorship.category}</div>
                <p className="text-slate-600 italic">"{selectedMentorship.message}"</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Guidance Note / Meeting Link (Google Meet / Zoom)
                  </label>
                  <textarea
                    rows={4}
                    value={mentorNotes}
                    onChange={(e) => setMentorNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => handleMentorshipStatusUpdate('REJECTED')}
                    disabled={isSubmittingMentorshipResponse}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 cursor-pointer"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMentorshipStatusUpdate('ACCEPTED')}
                    disabled={isSubmittingMentorshipResponse}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm"
                  >
                    {isSubmittingMentorshipResponse ? 'Updating...' : 'Accept Proposal (PUT /api/mentorship)'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODAL 2: POST CAREER OPPORTUNITY */}
        {/* ------------------------------------------------------------- */}
        {postJobModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900">Post Career / Referral Opportunity</h3>
                </div>
                <button
                  onClick={() => setPostJobModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handlePostJob} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Software Engineer Intern (Summer 2026)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company *</label>
                    <input
                      type="text"
                      required
                      value={jobCompany}
                      onChange={(e) => setJobCompany(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Opportunity Type</label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value as OpportunityType)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                    >
                      <option value="Internship">Internship</option>
                      <option value="Full-time Job">Full-time Job</option>
                      <option value="Referral">Alumni Referral</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location</label>
                    <input
                      type="text"
                      value={jobLocation}
                      onChange={(e) => setJobLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Stipend / Salary</label>
                    <input
                      type="text"
                      value={jobSalary}
                      onChange={(e) => setJobSalary(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={jobDeadline}
                    onChange={(e) => setJobDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Required Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={jobSkillsStr}
                    onChange={(e) => setJobSkillsStr(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Job Description &amp; Candidate Expectations
                  </label>
                  <textarea
                    rows={3}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setPostJobModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingJob}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm"
                  >
                    {isSubmittingJob ? 'Publishing...' : 'Publish Opening (POST /api/jobs)'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODAL 3: VIEW APPLICANTS FOR A JOB */}
        {/* ------------------------------------------------------------- */}
        {selectedJobForApplicants && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Applicants for {selectedJobForApplicants.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Review candidate pitch notes, portfolios, and update candidate statuses.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedJobForApplicants(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {applications.filter((a) => a.opportunityId === selectedJobForApplicants.id).length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">
                    No student applications submitted yet for this role.
                  </p>
                ) : (
                  applications
                    .filter((a) => a.opportunityId === selectedJobForApplicants.id)
                    .map((app) => (
                      <div
                        key={app.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 text-sm">{app.applicantName}</span>
                            <span className="text-slate-500 ml-2">{app.applicantEmail}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              app.status === 'Selected'
                                ? 'bg-emerald-100 text-emerald-800'
                                : app.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>

                        {app.coverNote && (
                          <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 text-slate-700">
                            <strong>Pitch / Cover Letter:</strong> {app.coverNote}
                          </div>
                        )}

                        {app.portfolioUrl && (
                          <div>
                            <a
                              href={app.portfolioUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline flex items-center space-x-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>View Portfolio / GitHub Profile</span>
                            </a>
                          </div>
                        )}

                        {/* Status Change Buttons */}
                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">Update Status via REST:</span>
                          <div className="flex items-center space-x-1.5">
                            {['Under Review', 'Interview Scheduled', 'Selected', 'Rejected'].map((status) => (
                              <button
                                key={status}
                                onClick={() => handleUpdateApplicantStatus(app.id, status as ApplicationStatus)}
                                className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                                  app.status === status
                                    ? 'bg-slate-800 text-white'
                                    : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODAL 4: CREATE CAMPUS EVENT */}
        {/* ------------------------------------------------------------- */}
        {createEventModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900">Schedule Alumni Event or Lecture</h3>
                </div>
                <button
                  onClick={() => setCreateEventModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="e.g. Masterclass: Cloud Systems at Google"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Event Type</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value as EventType)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                    >
                      <option value="Webinar">Webinar (Virtual)</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Guest Lecture">Guest Lecture</option>
                      <option value="Reunion">Alumni Reunion</option>
                      <option value="Networking">Networking Meet</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Max Capacity</label>
                    <input
                      type="number"
                      value={eventMaxSeats}
                      onChange={(e) => setEventMaxSeats(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date</label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Time</label>
                    <input
                      type="text"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Venue</label>
                  <input
                    type="text"
                    value={eventVenue}
                    onChange={(e) => setEventVenue(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setCreateEventModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingEvent}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm"
                  >
                    {isSubmittingEvent ? 'Scheduling...' : 'Publish Event (POST /api/events)'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODAL 5: PLEDGE / DONATE CONTRIBUTION */}
        {/* ------------------------------------------------------------- */}
        {pledgeModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900">Record Institutional Contribution</h3>
                </div>
                <button
                  onClick={() => setPledgeModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handlePledgeContribution} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Contribution Type *
                  </label>
                  <select
                    value={contribType}
                    onChange={(e) => setContribType(e.target.value as ContributionType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="Scholarship Sponsor">Student Scholarship Sponsor</option>
                    <option value="Donation / Funds">Department Research Endowment</option>
                    <option value="Equipment / Resources">Computing / Lab Equipment Donation</option>
                    <option value="Guest Lecture">Guest Lecture &amp; Technical Mentorship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Amount (in ₹ INR)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={contribAmount}
                    onChange={(e) => setContribAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Purpose / Beneficiary Note
                  </label>
                  <textarea
                    rows={3}
                    value={contribDesc}
                    onChange={(e) => setContribDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setPledgeModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingContrib}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-sm"
                  >
                    {isSubmittingContrib ? 'Recording...' : 'Pledge via REST (POST /api/contributions)'}
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
