import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  GraduationCap,
  MapPin,
  Briefcase,
  ExternalLink,
  UserCheck,
  UserPlus,
  HeartHandshake,
  CheckCircle2,
  X,
  Sparkles,
  Send,
  Building,
  Linkedin,
  MessageSquare,
} from 'lucide-react';
import { User, Connection, MentorshipCategory } from '../types';
import { StorageService } from '../services/storageService';

interface AlumniDirectoryProps {
  currentUser: User;
  users: User[];
  connections: Connection[];
  onRefreshData: () => void;
  onOpenMessages: (userId: string) => void;
}

export const AlumniDirectory: React.FC<AlumniDirectoryProps> = ({
  currentUser,
  users,
  connections,
  onRefreshData,
  onOpenMessages,
}) => {
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedGradYear, setSelectedGradYear] = useState('ALL');
  const [selectedIndustry, setSelectedIndustry] = useState('ALL');
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [mentorsOnly, setMentorsOnly] = useState(false);

  // Selected Profile Modal
  const [viewingProfile, setViewingProfile] = useState<User | null>(null);

  // Mentorship Request Modal
  const [mentorshipTarget, setMentorshipTarget] = useState<User | null>(null);
  const [mentorshipCategory, setMentorshipCategory] = useState<MentorshipCategory>('Career Guidance');
  const [mentorshipMessage, setMentorshipMessage] = useState('');
  const [mentorshipSuccessToast, setMentorshipSuccessToast] = useState(false);

  // Filter only Alumni
  const alumniList = useMemo(() => {
    return users.filter((u) => u.role === 'ALUMNI' && u.status === 'ACTIVE');
  }, [users]);

  // Unique departments, years, industries, companies
  const departments = useMemo(() => {
    return Array.from(new Set(alumniList.map((a) => a.department).filter(Boolean)));
  }, [alumniList]);

  const gradYears = useMemo(() => {
    return Array.from(new Set(alumniList.map((a) => a.graduationYear).filter(Boolean))).sort(
      (a, b) => (b as number) - (a as number)
    );
  }, [alumniList]);

  const industries = useMemo(() => {
    return Array.from(new Set(alumniList.map((a) => a.industry).filter(Boolean)));
  }, [alumniList]);

  const companies = useMemo(() => {
    return Array.from(new Set(alumniList.map((a) => a.company).filter(Boolean)));
  }, [alumniList]);

  // Filter logic
  const filteredAlumni = useMemo(() => {
    return alumniList.filter((a) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        (a.company && a.company.toLowerCase().includes(q)) ||
        (a.jobTitle && a.jobTitle.toLowerCase().includes(q)) ||
        (a.skills && a.skills.some((s) => s.toLowerCase().includes(q))) ||
        (a.location && a.location.toLowerCase().includes(q)) ||
        (a.department && a.department.toLowerCase().includes(q));

      const matchesDept = selectedDept === 'ALL' || a.department === selectedDept;
      const matchesYear = selectedGradYear === 'ALL' || String(a.graduationYear) === selectedGradYear;
      const matchesIndustry = selectedIndustry === 'ALL' || a.industry === selectedIndustry;
      const matchesCompany = selectedCompany === 'ALL' || a.company === selectedCompany;
      const matchesMentor = !mentorsOnly || a.isAvailableForMentoring;

      return matchesSearch && matchesDept && matchesYear && matchesIndustry && matchesCompany && matchesMentor;
    });
  }, [alumniList, searchQuery, selectedDept, selectedGradYear, selectedIndustry, selectedCompany, mentorsOnly]);

  // Connection helper
  const getConnectionState = (alumniId: string) => {
    if (alumniId === currentUser.id) return 'SELF';
    const conn = connections.find(
      (c) =>
        (c.requesterId === currentUser.id && c.receiverId === alumniId) ||
        (c.requesterId === alumniId && c.receiverId === currentUser.id)
    );
    if (!conn) return 'NONE';
    if (conn.status === 'ACCEPTED') return 'CONNECTED';
    if (conn.requesterId === currentUser.id) return 'PENDING_SENT';
    return 'PENDING_RECEIVED';
  };

  const handleConnect = (alumniId: string) => {
    StorageService.sendConnectionRequest(currentUser.id, alumniId);
    onRefreshData();
  };

  const handleSendMentorship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorshipTarget || !mentorshipMessage.trim()) return;

    StorageService.sendMentorshipRequest(
      currentUser.id,
      mentorshipTarget.id,
      mentorshipCategory,
      mentorshipMessage.trim()
    );

    setMentorshipTarget(null);
    setMentorshipMessage('');
    setMentorshipSuccessToast(true);
    setTimeout(() => setMentorshipSuccessToast(false), 4000);
    onRefreshData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast */}
      {mentorshipSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <div>
            <p className="text-xs font-bold">Mentorship Request Sent Successfully!</p>
            <p className="text-[11px] text-emerald-100">The mentor has been notified in their dashboard.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 font-bold text-xs">University Directory</span>
          <span className="text-xs text-slate-500 font-medium">• {filteredAlumni.length} Alumni Records</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Alumni Directory &amp; Global Network</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Explore and connect with verified graduates from National Institute of Technology &amp; Engineering.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, employer (e.g. Google, Microsoft), job role, skill (Java, Python), or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {/* Department */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Grad Year */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Graduation Year</label>
            <select
              value={selectedGradYear}
              onChange={(e) => setSelectedGradYear(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Batches</option>
              {gradYears.map((yr) => (
                <option key={yr} value={String(yr)}>
                  Class of {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Industry */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Industry</label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Industries</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* Company */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Company</label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Companies</option>
              {companies.map((comp) => (
                <option key={comp} value={comp}>
                  {comp}
                </option>
              ))}
            </select>
          </div>

          {/* Mentors Only Toggle */}
          <div className="flex items-end">
            <label className="flex items-center space-x-2 py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer w-full text-xs font-semibold text-slate-700 select-none">
              <input
                type="checkbox"
                checked={mentorsOnly}
                onChange={(e) => setMentorsOnly(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Available Mentors Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Alumni Cards Grid */}
      {filteredAlumni.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Alumni Match Your Filters</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or resetting dropdown filters to discover more graduates.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDept('ALL');
              setSelectedGradYear('ALL');
              setSelectedIndustry('ALL');
              setSelectedCompany('ALL');
              setMentorsOnly(false);
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((alumni) => {
            const connState = getConnectionState(alumni.id);
            const { score: matchScore } = StorageService.calculateRecommendationScore(currentUser, alumni);

            return (
              <div
                key={alumni.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Top Row: Avatar & Basic Info */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start space-x-3">
                      <img
                        src={alumni.avatar}
                        alt={alumni.name}
                        className="w-14 h-14 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">{alumni.name}</h3>
                        <p className="text-xs font-semibold text-blue-700">{alumni.jobTitle}</p>
                        <p className="text-xs font-medium text-slate-600 flex items-center mt-0.5">
                          <Building className="w-3 h-3 mr-1 text-slate-400" />
                          {alumni.company}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Badges: Department, Graduation Year, Mentorship Tag */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                      Class of {alumni.graduationYear}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                      {alumni.department}
                    </span>
                    {alumni.isAvailableForMentoring && (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Mentor ({matchScore}% Match)
                      </span>
                    )}
                  </div>

                  {/* Bio summary */}
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                    {alumni.bio || alumni.headline}
                  </p>

                  {/* Location & Industry */}
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 mb-4">
                    {alumni.location && (
                      <span className="flex items-center truncate">
                        <MapPin className="w-3 h-3 mr-1 shrink-0" />
                        {alumni.location}
                      </span>
                    )}
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(alumni.skills || []).slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {(alumni.skills || []).length > 4 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-50 text-slate-400 font-medium">
                        +{(alumni.skills || []).length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions: View Profile, Connect, Request Mentorship */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => setViewingProfile(alumni)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                  >
                    View Profile
                  </button>

                  <div className="flex items-center space-x-1.5">
                    {connState === 'SELF' ? (
                      <span className="text-[11px] text-slate-400 italic px-2 py-1">You</span>
                    ) : connState === 'CONNECTED' ? (
                      <button
                        onClick={() => onOpenMessages(alumni.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-1 text-blue-600" />
                        Message
                      </button>
                    ) : connState === 'PENDING_SENT' ? (
                      <span className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium">
                        Request Sent
                      </span>
                    ) : connState === 'PENDING_RECEIVED' ? (
                      <span className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-xs font-medium">
                        Request Received
                      </span>
                    ) : (
                      <button
                        onClick={() => handleConnect(alumni.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold flex items-center cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 mr-1" />
                        Connect
                      </button>
                    )}

                    {alumni.isAvailableForMentoring && alumni.id !== currentUser.id && (
                      <button
                        onClick={() => setMentorshipTarget(alumni)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center cursor-pointer"
                      >
                        <HeartHandshake className="w-3.5 h-3.5 mr-1" />
                        Mentor
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL PROFILE MODAL */}
      {viewingProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-6 text-white relative rounded-t-2xl">
              <button
                onClick={() => setViewingProfile(null)}
                className="absolute top-4 right-4 p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-4">
                <img
                  src={viewingProfile.avatar}
                  alt={viewingProfile.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-white/50 shadow-md"
                />
                <div>
                  <h2 className="text-xl font-extrabold text-white">{viewingProfile.name}</h2>
                  <p className="text-sm font-semibold text-cyan-300">{viewingProfile.jobTitle}</p>
                  <p className="text-xs text-slate-300 font-medium">
                    {viewingProfile.company} • Class of {viewingProfile.graduationYear}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Body */}
            <div className="p-6 space-y-5 text-xs sm:text-sm text-slate-700">
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-1">About &amp; Background</h4>
                <p className="text-slate-600 leading-relaxed">{viewingProfile.bio || 'No detailed bio provided.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block">Degree &amp; Department</span>
                  <span className="font-bold text-slate-800">
                    {viewingProfile.degree || 'B.Tech'} - {viewingProfile.department}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block">Industry &amp; Domain</span>
                  <span className="font-bold text-slate-800">{viewingProfile.industry || 'Information Technology'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block">Current Location</span>
                  <span className="font-bold text-slate-800">{viewingProfile.location || 'Bangalore, India'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block">Mentorship Availability</span>
                  <span
                    className={`font-bold ${
                      viewingProfile.isAvailableForMentoring ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {viewingProfile.isAvailableForMentoring ? '✓ Open to Mentees' : 'Temporarily Unavailable'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-2">Verified Skill Tags</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(viewingProfile.skills || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 text-xs font-medium border border-blue-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {viewingProfile.linkedinUrl && (
                <div>
                  <a
                    href={viewingProfile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span>View Verified LinkedIn Profile</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                  </a>
                </div>
              )}

              {/* Action row in modal */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  onClick={() => setViewingProfile(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                {getConnectionState(viewingProfile.id) === 'CONNECTED' ? (
                  <button
                    onClick={() => {
                      setViewingProfile(null);
                      onOpenMessages(viewingProfile.id);
                    }}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Send Direct Message
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleConnect(viewingProfile.id);
                      setViewingProfile(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                  >
                    Send Connection Request
                  </button>
                )}
                {viewingProfile.isAvailableForMentoring && viewingProfile.id !== currentUser.id && (
                  <button
                    onClick={() => {
                      setMentorshipTarget(viewingProfile);
                      setViewingProfile(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Request Mentorship
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MENTORSHIP REQUEST DIALOG */}
      {mentorshipTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2.5">
                <HeartHandshake className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Request 1-on-1 Mentorship</h3>
              </div>
              <button
                onClick={() => setMentorshipTarget(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100 mb-4">
              <img
                src={mentorshipTarget.avatar}
                alt={mentorshipTarget.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-900">{mentorshipTarget.name}</h4>
                <p className="text-[11px] text-slate-600">
                  {mentorshipTarget.jobTitle} @ {mentorshipTarget.company}
                </p>
              </div>
            </div>

            <form onSubmit={handleSendMentorship} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Mentorship Category</label>
                <select
                  value={mentorshipCategory}
                  onChange={(e) => setMentorshipCategory(e.target.value as MentorshipCategory)}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Career Guidance">Career Guidance</option>
                  <option value="Technical Skills">Technical Skills (System Design, Java, Backend)</option>
                  <option value="Interview Preparation">Interview Preparation &amp; Mock Coding</option>
                  <option value="Higher Studies">Higher Studies (MS/PhD in US/Europe)</option>
                  <option value="Entrepreneurship">Entrepreneurship &amp; Startup Scaling</option>
                  <option value="Resume Review">Resume Review &amp; Portfolio Audit</option>
                  <option value="Industry Guidance">Industry Guidance &amp; Transition</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Your Message &amp; Goals <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Introduce yourself, mention your year/department, what you are preparing for, and specific guidance you are seeking..."
                  value={mentorshipMessage}
                  onChange={(e) => setMentorshipMessage(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setMentorshipTarget(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center cursor-pointer"
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
