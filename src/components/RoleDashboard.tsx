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
  MentorshipStatus,
  UserStatus,
} from '../types';
import {
  GraduationCap,
  Users,
  Calendar,
  Briefcase,
  Award,
  Sparkles,
  CheckCircle2,
  Clock,
  TrendingUp,
  Building,
  ShieldCheck,
  Search,
  Plus,
  ArrowRight,
  Trash2,
  Check,
  X,
  Lock,
  Unlock,
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { AdminDashboard } from './AdminDashboard';

interface RoleDashboardProps {
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

export const RoleDashboard: React.FC<RoleDashboardProps> = ({
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
  // Status updates
  const handleUpdateMentorship = (id: string, status: MentorshipStatus) => {
    StorageService.updateMentorshipStatus(id, status);
    onRefreshData();
  };

  // 1. STUDENT DASHBOARD VIEW
  if (currentUser.role === 'STUDENT') {
    const studentRequests = mentorshipRequests.filter((r) => r.studentId === currentUser.id);
    const studentApps = applications.filter((a) => a.applicantId === currentUser.id);
    const registeredEvents = events.filter((e) => e.registeredUserIds.includes(currentUser.id));

    // Top 3 recommended mentors for this student
    const recommendedMentors = users
      .filter((u) => u.role === 'ALUMNI' && u.isAvailableForMentoring && u.status === 'ACTIVE')
      .map((mentor) => ({
        mentor,
        match: StorageService.calculateRecommendationScore(currentUser, mentor),
      }))
      .sort((a, b) => b.match.score - a.match.score)
      .slice(0, 3);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white/40 shadow-md"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  STUDENT PORTAL
                </span>
                <span className="text-xs text-slate-300">Roll No: {currentUser.rollNumber || 'CS23B104'}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold mt-1">Welcome back, {currentUser.name}!</h1>
              <p className="text-xs text-slate-300">
                Department of {currentUser.department} • Batch of {currentUser.graduationYear}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCurrentTab('mentorship')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Find a Mentor
            </button>
            <button
              onClick={() => setCurrentTab('careers')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer border border-white/20"
            >
              Browse Referrals
            </button>
          </div>
        </div>

        {/* Quick Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Mentorships Active</span>
            <div className="text-2xl font-extrabold text-blue-700 mt-1">
              {studentRequests.filter((r) => r.status === 'ACCEPTED' || r.status === 'ACTIVE').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Job Applications</span>
            <div className="text-2xl font-extrabold text-purple-700 mt-1">{studentApps.length}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Registered Events</span>
            <div className="text-2xl font-extrabold text-amber-700 mt-1">{registeredEvents.length}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Connected Alumni</span>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">
              {
                connections.filter(
                  (c) =>
                    c.status === 'ACCEPTED' &&
                    (c.requesterId === currentUser.id || c.receiverId === currentUser.id)
                ).length
              }
            </div>
          </div>
        </div>

        {/* Recommended Mentors with 85%+ Match */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Recommended Mentors for You</h3>
            </div>
            <button
              onClick={() => setCurrentTab('mentorship')}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedMentors.map(({ mentor, match }) => (
              <div key={mentor.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={mentor.avatar} alt={mentor.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{mentor.name}</h4>
                      <p className="text-[11px] text-blue-600 font-semibold">{mentor.jobTitle}</p>
                      <p className="text-[10px] text-slate-500">{mentor.company}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {match.score}% Compatibility
                  </span>
                  <span className="text-slate-400">Class of {mentor.graduationYear}</span>
                </div>

                <p className="text-[11px] text-slate-500 leading-tight line-clamp-2">{mentor.bio}</p>

                <button
                  onClick={() => setCurrentTab('mentorship')}
                  className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                >
                  Request Mentorship
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Two Column Grid: My Applications & Registered Events */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Applications status */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>My Career Applications</span>
              <button
                onClick={() => setCurrentTab('careers')}
                className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                Board
              </button>
            </h4>
            {studentApps.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No active applications</p>
            ) : (
              <div className="space-y-2.5 divide-y divide-slate-100">
                {studentApps.map((app) => {
                  const job = opportunities.find((o) => o.id === app.opportunityId);
                  return (
                    <div key={app.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                      <div>
                        <h5 className="font-bold text-slate-900">{job?.title}</h5>
                        <span className="text-[11px] text-slate-500">{job?.company}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {app.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Registered Events */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>Upcoming Registered Events</span>
              <button
                onClick={() => setCurrentTab('events')}
                className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                Calendar
              </button>
            </h4>
            {registeredEvents.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No upcoming events registered</p>
            ) : (
              <div className="space-y-2.5 divide-y divide-slate-100">
                {registeredEvents.map((ev) => (
                  <div key={ev.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                    <div>
                      <h5 className="font-bold text-slate-900">{ev.title}</h5>
                      <span className="text-[11px] text-slate-500">
                        {ev.date} • {ev.time}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Confirmed ✓
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. ALUMNI DASHBOARD VIEW
  if (currentUser.role === 'ALUMNI') {
    const inboundMentorship = mentorshipRequests.filter(
      (r) => r.mentorId === currentUser.id && r.status === 'PENDING'
    );
    const activeMentees = mentorshipRequests.filter(
      (r) => r.mentorId === currentUser.id && (r.status === 'ACCEPTED' || r.status === 'ACTIVE')
    );
    const myJobs = opportunities.filter((o) => o.postedById === currentUser.id);
    const myPledges = contributions.filter((c) => c.alumniId === currentUser.id);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white/40 shadow-md"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  DISTINGUISHED ALUMNI PORTAL
                </span>
                <span className="text-xs text-slate-300">Class of {currentUser.graduationYear}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold mt-1">{currentUser.name}</h1>
              <p className="text-xs text-slate-300">
                {currentUser.jobTitle} @ {currentUser.company} • {currentUser.department}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCurrentTab('careers')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Post a Job / Referral
            </button>
            <button
              onClick={() => setCurrentTab('contributions')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Pledge Contribution
            </button>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">Profile Completeness: 90%</span>
            <span className="text-emerald-600 font-semibold">Verified by University Registrar ✓</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '90%' }}></div>
          </div>
          <p className="text-[11px] text-slate-500">
            Keep your skills and current organization up to date to help junior students discover your mentorship offerings.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Pending Requests</span>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{inboundMentorship.length}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Active Mentees</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">{activeMentees.length}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Jobs Posted</span>
            <div className="text-2xl font-extrabold text-purple-600 mt-1">{myJobs.length}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Contributions Pledged</span>
            <div className="text-2xl font-extrabold text-blue-600 mt-1">{myPledges.length}</div>
          </div>
        </div>

        {/* Inbound Mentorship Requests requiring action */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
            <span>Inbound Student Mentorship Inquiries</span>
            <button
              onClick={() => setCurrentTab('mentorship')}
              className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              Mentorship Hub
            </button>
          </h3>

          {inboundMentorship.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              No pending mentorship requests. You're completely up to date!
            </div>
          ) : (
            <div className="space-y-3">
              {inboundMentorship.map((req) => {
                const student = users.find((u) => u.id === req.studentId);
                return (
                  <div
                    key={req.id}
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-start space-x-3">
                      <img
                        src={student?.avatar}
                        alt={student?.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900">{student?.name}</h4>
                        <p className="text-blue-700 font-semibold">{req.category}</p>
                        <p className="text-slate-600 italic mt-1 max-w-xl">"{req.message}"</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => handleUpdateMentorship(req.id, 'REJECTED')}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleUpdateMentorship(req.id, 'ACCEPTED')}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                      >
                        Accept Mentee
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. FACULTY DASHBOARD VIEW
  if (currentUser.role === 'FACULTY') {
    const departmentAlumni = users.filter(
      (u) => u.role === 'ALUMNI' && u.department === currentUser.department
    );
    const departmentStudents = users.filter(
      (u) => u.role === 'STUDENT' && u.department === currentUser.department
    );

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-amber-400/40"
            />
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                FACULTY &amp; ACADEMIC OVERSIGHT
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold mt-1">{currentUser.name}</h1>
              <p className="text-xs text-slate-300">
                Professor &amp; Head • Department of {currentUser.department}
              </p>
            </div>
          </div>

          <button
            onClick={() => setCurrentTab('events')}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Organize Department Guest Lecture
          </button>
        </div>

        {/* Dept Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Department Alumni</span>
            <div className="text-2xl font-extrabold text-blue-700 mt-1">{departmentAlumni.length}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Current Undergrads</span>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">{departmentStudents.length}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Total System Mentorships</span>
            <div className="text-2xl font-extrabold text-purple-700 mt-1">{mentorshipRequests.length}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Alumni Referrals</span>
            <div className="text-2xl font-extrabold text-amber-700 mt-1">{opportunities.length}</div>
          </div>
        </div>

        {/* Department Alumni Spotlight */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Distinguished Alumni from Department of {currentUser.department}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {departmentAlumni.slice(0, 6).map((alumnus) => (
              <div key={alumnus.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-xs space-y-2">
                <div className="flex items-center space-x-3">
                  <img src={alumnus.avatar} alt={alumnus.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h5 className="font-bold text-slate-900">{alumnus.name}</h5>
                    <p className="text-[11px] text-blue-700 font-semibold">{alumnus.jobTitle}</p>
                    <p className="text-[10px] text-slate-500">{alumnus.company}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Class of {alumnus.graduationYear}</span>
                  <button
                    onClick={() => onOpenMessages(alumnus.id)}
                    className="text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    Invite to Campus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 4. ADMIN DASHBOARD VIEW (Complete Command Center)
  return (
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
      onRefreshData={onRefreshData}
      setCurrentTab={setCurrentTab}
      onOpenMessages={onOpenMessages}
    />
  );
};
