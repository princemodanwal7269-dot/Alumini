import React, { useState, useMemo } from 'react';
import {
  HeartHandshake,
  Search,
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  UserCheck,
  Send,
  Building,
  GraduationCap,
  Filter,
  Check,
  X,
  FileText,
  Calendar,
} from 'lucide-react';
import { User, MentorshipRequest, MentorshipCategory, MentorshipStatus } from '../types';
import { StorageService } from '../services/storageService';

interface MentorshipPortalProps {
  currentUser: User;
  users: User[];
  mentorshipRequests: MentorshipRequest[];
  onRefreshData: () => void;
  onOpenMessages: (targetUserId: string) => void;
}

export const MentorshipPortal: React.FC<MentorshipPortalProps> = ({
  currentUser,
  users,
  mentorshipRequests,
  onRefreshData,
  onOpenMessages,
}) => {
  const [activeTab, setActiveTab] = useState<'find' | 'engagements' | 'guidelines'>('find');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  // Request modal state
  const [requestTarget, setRequestTarget] = useState<User | null>(null);
  const [category, setCategory] = useState<MentorshipCategory>('Career Guidance');
  const [message, setMessage] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Available mentors
  const availableMentors = useMemo(() => {
    return users.filter(
      (u) => (u.role === 'ALUMNI' || u.role === 'FACULTY') && u.isAvailableForMentoring && u.status === 'ACTIVE'
    );
  }, [users]);

  // Departments
  const departments = useMemo(() => {
    return Array.from(new Set(availableMentors.map((m) => m.department).filter(Boolean)));
  }, [availableMentors]);

  // Filtered mentors
  const filteredMentors = useMemo(() => {
    return availableMentors
      .filter((m) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          m.name.toLowerCase().includes(q) ||
          (m.company && m.company.toLowerCase().includes(q)) ||
          (m.jobTitle && m.jobTitle.toLowerCase().includes(q)) ||
          (m.skills && m.skills.some((s) => s.toLowerCase().includes(q)));

        const matchesDept = selectedDept === 'ALL' || m.department === selectedDept;
        return matchesSearch && matchesDept;
      })
      .map((mentor) => {
        const { score, reasons } = StorageService.calculateRecommendationScore(currentUser, mentor);
        return {
          mentor,
          score,
          reasons,
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [availableMentors, searchQuery, selectedDept, currentUser]);

  // Mentorship requests for this user (either as student or mentor)
  const myRequests = useMemo(() => {
    return mentorshipRequests.filter(
      (r) => r.studentId === currentUser.id || r.mentorId === currentUser.id
    );
  }, [mentorshipRequests, currentUser.id]);

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestTarget || !message.trim()) return;

    StorageService.sendMentorshipRequest(currentUser.id, requestTarget.id, category, message.trim());
    setRequestTarget(null);
    setMessage('');
    setToastMsg('Mentorship request dispatched! Check status in My Engagements.');
    setTimeout(() => setToastMsg(null), 4000);
    onRefreshData();
  };

  const handleUpdateStatus = (requestId: string, status: MentorshipStatus) => {
    StorageService.updateMentorshipStatus(requestId, status);
    onRefreshData();
  };

  const getStatusBadge = (status: MentorshipStatus) => {
    switch (status) {
      case 'ACCEPTED':
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'COMPLETED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-bold text-xs">
              Structured Mentorship
            </span>
            <span className="text-xs text-slate-500 font-medium">
              • {availableMentors.length} Mentors Ready to Guide
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">1-on-1 Mentorship Program</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Connect directly with verified alumni leaders for technical mock interviews, career guidance, and resume reviews.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white p-1 rounded-xl border border-slate-200 flex items-center space-x-1 shrink-0">
          <button
            onClick={() => setActiveTab('find')}
            className={`py-2 px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'find' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Find a Mentor</span>
          </button>
          <button
            onClick={() => setActiveTab('engagements')}
            className={`py-2 px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'engagements' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>My Engagements ({myRequests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`py-2 px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'guidelines' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Guidelines &amp; Stats</span>
          </button>
        </div>
      </div>

      {/* TAB 1: FIND A MENTOR */}
      {activeTab === 'find' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search mentors by name, company (Google, Amazon), role, or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="py-2 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Mentors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map(({ mentor, score, reasons }) => (
              <div
                key={mentor.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={mentor.avatar}
                        alt={mentor.name}
                        className="w-13 h-13 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">{mentor.name}</h3>
                        <p className="text-xs font-semibold text-blue-700">{mentor.jobTitle}</p>
                        <p className="text-xs text-slate-500 flex items-center">
                          <Building className="w-3 h-3 mr-1 text-slate-400" />
                          {mentor.company}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Compatibility Score Pill */}
                  <div className="mb-3">
                    <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {score}% Skill Compatibility
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">{reasons[0] || 'High academic alignment'}</p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                    {mentor.bio || mentor.headline}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {(mentor.skills || []).slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Class of {mentor.graduationYear}</span>
                  {mentor.id === currentUser.id ? (
                    <span className="text-xs text-slate-400 italic">This is you</span>
                  ) : (
                    <button
                      onClick={() => setRequestTarget(mentor)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center cursor-pointer shadow-xs"
                    >
                      <HeartHandshake className="w-3.5 h-3.5 mr-1" />
                      Request Mentorship
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MY ENGAGEMENTS */}
      {activeTab === 'engagements' && (
        <div className="space-y-4">
          {myRequests.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Mentorship Engagements Active</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Select "Find a Mentor" above to request guidance from our alumni network.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myRequests.map((req) => {
                const student = users.find((u) => u.id === req.studentId);
                const mentor = users.find((u) => u.id === req.mentorId);
                const isMentor = currentUser.id === req.mentorId;
                const otherParty = isMentor ? student : mentor;

                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start space-x-4">
                      {otherParty && (
                        <img
                          src={otherParty.avatar}
                          alt={otherParty.name}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200"
                        />
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-slate-900">{otherParty?.name}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusBadge(
                              req.status
                            )}`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-blue-700 font-semibold mt-0.5">Category: {req.category}</p>
                        <p className="text-xs text-slate-600 mt-1 max-w-xl italic">"{req.message}"</p>
                        {req.sessionNotes && (
                          <p className="text-[11px] text-slate-500 mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                            <strong>Session Notes:</strong> {req.sessionNotes}
                          </p>
                        )}
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Requested on {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Action Controls based on Role */}
                    <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                      {isMentor && req.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'ACCEPTED')}
                            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Accept Request
                          </button>
                        </>
                      )}

                      {isMentor && (req.status === 'ACCEPTED' || req.status === 'ACTIVE') && (
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'COMPLETED')}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                        >
                          Mark Completed
                        </button>
                      )}

                      {otherParty && (
                        <button
                          onClick={() => onOpenMessages(otherParty.id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 mr-1 text-blue-600" />
                          Chat
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GUIDELINES & STATS */}
      {activeTab === 'guidelines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Mentorship Etiquette for Students</h3>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 shrink-0 mt-0.5" />
                <span>State your goals concisely (e.g. mock interview, resume audit, higher education query).</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 shrink-0 mt-0.5" />
                <span>Respect the mentor's professional schedule; arrive prepared with specific questions.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 shrink-0 mt-0.5" />
                <span>Maintain professional communication at all times through the internal messenger.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Best Practices for Alumni Mentors</h3>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 shrink-0 mt-0.5" />
                <span>Provide candid, actionable feedback on resume bullets and project architectures.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 shrink-0 mt-0.5" />
                <span>Refer students who demonstrate strong readiness to internal job opportunities.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 shrink-0 mt-0.5" />
                <span>Mark completed sessions to update institutional contribution logs.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* REQUEST MODAL */}
      {requestTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <HeartHandshake className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Request Mentorship Session</h3>
              </div>
              <button
                onClick={() => setRequestTarget(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 mb-4">
              <img
                src={requestTarget.avatar}
                alt={requestTarget.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-900">{requestTarget.name}</h4>
                <p className="text-[11px] text-slate-600">
                  {requestTarget.jobTitle} @ {requestTarget.company}
                </p>
              </div>
            </div>

            <form onSubmit={handleSendRequest} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Focus Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MentorshipCategory)}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-white text-slate-800"
                >
                  <option value="Career Guidance">Career Guidance</option>
                  <option value="Technical Skills">Technical Skills (Full-stack, System Design)</option>
                  <option value="Interview Preparation">Interview Preparation &amp; Mock Coding</option>
                  <option value="Higher Studies">Higher Studies (MS / PhD)</option>
                  <option value="Entrepreneurship">Entrepreneurship &amp; Startups</option>
                  <option value="Resume Review">Resume Review &amp; Critique</option>
                  <option value="Industry Guidance">Industry Transition</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  What would you like to achieve in this mentorship? <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Mention your year of study, your career aspirations, and specific areas where you need guidance..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRequestTarget(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
