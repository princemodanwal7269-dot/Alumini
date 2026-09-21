import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  MapPin,
  Building,
  DollarSign,
  Calendar,
  Clock,
  Plus,
  Send,
  CheckCircle2,
  X,
  Users,
  FileText,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { User, CareerOpportunity, JobApplication, JobType, ApplicationStatus } from '../types';
import { StorageService } from '../services/storageService';

interface CareerPortalProps {
  currentUser: User;
  users: User[];
  opportunities: CareerOpportunity[];
  applications: JobApplication[];
  onRefreshData: () => void;
  onOpenMessages: (userId: string) => void;
}

export const CareerPortal: React.FC<CareerPortalProps> = ({
  currentUser,
  users,
  opportunities,
  applications,
  onRefreshData,
  onOpenMessages,
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'applications' | 'posted'>('browse');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Apply modal
  const [applyingJob, setApplyingJob] = useState<CareerOpportunity | null>(null);
  const [coverNote, setCoverNote] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // Post Job modal
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('Bangalore, Karnataka (Hybrid)');
  const [type, setType] = useState<JobType>('Full-time Job');
  const [experienceLevel, setExperienceLevel] = useState('Entry-level (0-2 years)');
  const [salaryRange, setSalaryRange] = useState('₹14 - 18 LPA');
  const [deadline, setDeadline] = useState('2026-12-15');
  const [skillsInput, setSkillsInput] = useState('Java, Spring Boot, MySQL, React');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');

  // View Applicants Modal
  const [viewingApplicantsJob, setViewingApplicantsJob] = useState<CareerOpportunity | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const canPost = currentUser.role === 'ALUMNI' || currentUser.role === 'ADMIN';

  const jobTypes: JobType[] = ['Full-time Job', 'Internship', 'Referral', 'Freelance'];

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return opportunities.filter((job) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.skillsRequired.some((s) => s.toLowerCase().includes(q));

      const matchesType = selectedType === 'ALL' || job.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [opportunities, searchQuery, selectedType]);

  // Student's applications
  const myApplications = useMemo(() => {
    return applications.filter((app) => app.applicantId === currentUser.id);
  }, [applications, currentUser.id]);

  // Jobs posted by this alumni
  const myPostedJobs = useMemo(() => {
    return opportunities.filter((job) => job.postedById === currentUser.id);
  }, [opportunities, currentUser.id]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob) return;

    StorageService.applyForOpportunity(
      applyingJob.id,
      currentUser.id,
      coverNote.trim(),
      portfolioUrl.trim() || undefined
    );

    setApplyingJob(null);
    setCoverNote('');
    setPortfolioUrl('');
    setToastMsg('Application submitted successfully to the alumni poster!');
    setTimeout(() => setToastMsg(null), 4000);
    onRefreshData();
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim() || !description.trim()) return;

    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    StorageService.createOpportunity({
      title,
      company,
      location,
      type,
      experienceLevel,
      salaryRange,
      deadline,
      skillsRequired: skills,
      description,
      requirements,
      postedById: currentUser.id,
      postedByName: currentUser.name,
      applicantIds: [],
    });

    setIsPostModalOpen(false);
    setTitle('');
    setDescription('');
    setRequirements('');
    setToastMsg('Opportunity published on the university career board!');
    setTimeout(() => setToastMsg(null), 4000);
    onRefreshData();
  };

  const handleUpdateAppStatus = (appId: string, status: ApplicationStatus) => {
    StorageService.updateApplicationStatus(appId, status);
    onRefreshData();
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Selected':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Interview Scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Under Review':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded bg-purple-50 text-purple-700 font-bold text-xs">Campus Placements</span>
            <span className="text-xs text-slate-500 font-medium">• {opportunities.length} Active Listings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Career &amp; Referral Board</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Access exclusive referral fast-tracks, full-time jobs, and internships directly posted by alumni leaders.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {canPost && (
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Post Opportunity / Referral</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white p-1 rounded-xl border border-slate-200 flex items-center space-x-1 max-w-md">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1.5 ${
            activeTab === 'browse' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Browse Jobs ({opportunities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1.5 ${
            activeTab === 'applications' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>My Applications ({myApplications.length})</span>
        </button>

        {canPost && (
          <button
            onClick={() => setActiveTab('posted')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeTab === 'posted' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>My Postings ({myPostedJobs.length})</span>
          </button>
        )}
      </div>

      {/* TAB 1: BROWSE JOBS */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search jobs by title, company (Microsoft, Google), skill, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Pill filter */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button
                onClick={() => setSelectedType('ALL')}
                className={`px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedType === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Types
              </button>
              {jobTypes.map((jt) => (
                <button
                  key={jt}
                  onClick={() => setSelectedType(jt)}
                  className={`px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    selectedType === jt
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {jt}
                </button>
              ))}
            </div>
          </div>

          {/* Job listings */}
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Job Postings Match Your Search</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Check back soon or broaden your search criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map((job) => {
                const hasApplied = applications.some(
                  (a) => a.opportunityId === job.id && a.applicantId === currentUser.id
                );

                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                            {job.type}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">{job.title}</h3>
                          <p className="text-xs font-semibold text-blue-700 flex items-center mt-0.5">
                            <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            {job.company}
                          </p>
                        </div>
                        {hasApplied && (
                          <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 shrink-0">
                            Applied ✓
                          </span>
                        )}
                      </div>

                      {/* Meta Pills: Location, Salary, Experience */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-3 border-y border-slate-100 text-[11px] text-slate-600 mb-3">
                        <div className="flex items-center space-x-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-slate-800">{job.salaryRange}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 truncate">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{job.experienceLevel}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                        {job.description}
                      </p>

                      {/* Required Skills */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {job.skillsRequired.map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">
                          Posted by {job.postedByName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Deadline: {job.deadline}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {hasApplied ? (
                          <button
                            onClick={() => setActiveTab('applications')}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                          >
                            View Status
                          </button>
                        ) : (
                          <button
                            onClick={() => setApplyingJob(job)}
                            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center cursor-pointer shadow-xs"
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Apply / Refer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {myApplications.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Job Applications Submitted</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Explore open positions in the "Browse Jobs" tab and apply directly with your university profile.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myApplications.map((app) => {
                const job = opportunities.find((o) => o.id === app.opportunityId);
                return (
                  <div
                    key={app.id}
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-slate-900">{job?.title || 'Unknown Position'}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusBadge(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-blue-700 mt-0.5">{job?.company}</p>
                      <p className="text-xs text-slate-500 mt-1 italic max-w-xl">"{app.coverNote}"</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Applied on {new Date(app.appliedAt || app.appliedDate || Date.now()).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {job && (
                        <button
                          onClick={() => onOpenMessages(job.postedById)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                        >
                          Contact Poster
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

      {/* TAB 3: MY POSTINGS */}
      {activeTab === 'posted' && (
        <div className="space-y-4">
          {myPostedJobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">You Haven't Posted Any Roles Yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Help your junior peers by sharing job or referral opportunities from your organization.
              </p>
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs cursor-pointer"
              >
                Post Your First Opportunity
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myPostedJobs.map((job) => {
                const jobApps = applications.filter((a) => a.opportunityId === job.id);
                return (
                  <div
                    key={job.id}
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                          {job.type}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{job.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {job.company} • {job.location} • {job.salaryRange}
                      </p>
                      <span className="text-[11px] text-blue-700 font-semibold mt-1 block">
                        {jobApps.length} Student Applicants Received
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => setViewingApplicantsJob(job)}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5 mr-1" />
                        Review Applicants ({jobApps.length})
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* APPLICATION MODAL */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Apply for Opportunity</h3>
              <button
                onClick={() => setApplyingJob(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 mb-4 text-xs">
              <h4 className="font-bold text-purple-950">{applyingJob.title}</h4>
              <p className="text-purple-800">{applyingJob.company} • {applyingJob.location}</p>
              <p className="text-purple-600 text-[11px] mt-1">Reviewing Alumni: {applyingJob.postedByName}</p>
            </div>

            <form onSubmit={handleApply} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Introduction / Why are you a good fit? <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Mention your key technical projects, graduation year, CGPA, and why you are interested in this role..."
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Portfolio / GitHub / Resume Link</label>
                <input
                  type="url"
                  placeholder="https://github.com/your-handle or https://drive.google.com/..."
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setApplyingJob(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POST OPPORTUNITY MODAL */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Post Job or Referral Opportunity</h3>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Associate Software Engineer - Backend"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google India"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Opportunity Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as JobType)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  >
                    {jobTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Salary / CTC Package *</label>
                  <input
                    type="text"
                    required
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                    placeholder="e.g. ₹15 - 20 LPA"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Experience *</label>
                  <input
                    type="text"
                    required
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Application Deadline *</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Required Skills (Comma separated) *</label>
                <input
                  type="text"
                  required
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                  placeholder="Java, Spring Boot, Microservices, React"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Job Description *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500"
                  placeholder="Summarize team responsibilities and the interview process..."
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                >
                  Publish Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW APPLICANTS MODAL */}
      {viewingApplicantsJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Applicants for {viewingApplicantsJob.title}</h3>
                <p className="text-xs text-slate-500">{viewingApplicantsJob.company}</p>
              </div>
              <button
                onClick={() => setViewingApplicantsJob(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 divide-y divide-slate-100">
              {applications.filter((a) => a.opportunityId === viewingApplicantsJob.id).length === 0 ? (
                <p className="p-8 text-center text-slate-400 text-xs">No students have applied yet.</p>
              ) : (
                applications
                  .filter((a) => a.opportunityId === viewingApplicantsJob.id)
                  .map((app) => {
                    const applicant = users.find((u) => u.id === app.applicantId);
                    if (!applicant) return null;
                    return (
                      <div key={app.id} className="pt-3 first:pt-0 space-y-2 text-xs">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <img
                              src={applicant.avatar}
                              alt={applicant.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <h5 className="font-bold text-slate-900">{applicant.name}</h5>
                              <p className="text-[11px] text-slate-500">
                                {applicant.department} • Batch of {applicant.graduationYear}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <select
                              value={app.status}
                              onChange={(e) => handleUpdateAppStatus(app.id, e.target.value as ApplicationStatus)}
                              className="p-1 rounded border border-slate-200 text-xs bg-white font-semibold"
                            >
                              <option value="Applied">Applied</option>
                              <option value="Under Review">Under Review</option>
                              <option value="Interview Scheduled">Interview Scheduled</option>
                              <option value="Selected">Selected</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                            <button
                              onClick={() => {
                                setViewingApplicantsJob(null);
                                onOpenMessages(applicant.id);
                              }}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                            >
                              Chat
                            </button>
                          </div>
                        </div>

                        <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                          "{app.coverNote}"
                        </p>

                        {app.portfolioUrl && (
                          <a
                            href={app.portfolioUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center text-blue-600 hover:underline font-medium text-[11px]"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Candidate Resume / Portfolio
                          </a>
                        )}
                      </div>
                    );
                  })
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 text-right">
              <button
                onClick={() => setViewingApplicantsJob(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
