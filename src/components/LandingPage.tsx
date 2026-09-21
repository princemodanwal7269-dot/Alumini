import React from 'react';
import {
  Users,
  GraduationCap,
  Briefcase,
  Calendar,
  Award,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Search,
  BookOpen,
  Code,
  MapPin,
  Building2,
  Clock,
  HeartHandshake,
  Star,
} from 'lucide-react';
import { User, EventItem, CareerOpportunity, SystemStats } from '../types';

interface LandingPageProps {
  stats: SystemStats;
  featuredAlumni: User[];
  upcomingEvents: EventItem[];
  recentJobs: CareerOpportunity[];
  setCurrentTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenDocs: () => void;
  onOpenJavaSource: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  stats,
  featuredAlumni,
  upcomingEvents,
  recentJobs,
  setCurrentTab,
  onOpenAuth,
  onOpenDocs,
  onOpenJavaSource,
}) => {
  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white pt-12 sm:pt-20 pb-20 sm:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.3),rgba(255,255,255,0))]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Institution Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>National Institute of Technology &amp; Engineering</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
            Connect. Mentor. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Grow.</span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-300 leading-relaxed font-normal mb-10">
            Building stronger connections between students, alumni, and the university. Access 1-on-1 industry mentorship, exclusive referral job drives, milestone reunions, and institutional research endowments.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => setCurrentTab('alumni')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Award className="w-4 h-4 text-blue-200" />
              <span>Alumni Portal</span>
            </button>
            <button
              onClick={() => setCurrentTab('student')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-emerald-200" />
              <span>Student Portal</span>
            </button>
            <button
              onClick={() => setCurrentTab('admin')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-sm transition-all shadow-lg shadow-purple-900/25 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-purple-200" />
              <span>Admin Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentTab('directory')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Explore Directory</span>
            </button>
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Switch Role</span>
            </button>
          </div>

          {/* Academic Viva Fast Links */}
          <div className="mt-10 pt-8 border-t border-slate-800/80 max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">College Java Viva Tools:</span>
            <button
              onClick={onOpenDocs}
              className="px-3 py-1.5 rounded-lg bg-blue-900/40 border border-blue-500/30 text-blue-300 hover:bg-blue-900/60 transition-colors flex items-center cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1" />
              18 Documentation Sections
            </button>
            <button
              onClick={onOpenJavaSource}
              className="px-3 py-1.5 rounded-lg bg-amber-900/40 border border-amber-500/30 text-amber-300 hover:bg-amber-900/60 transition-colors flex items-center cursor-pointer"
            >
              <Code className="w-3.5 h-3.5 mr-1" />
              Spring Boot Code &amp; ZIP Download
            </button>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 border-r border-slate-100 last:border-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-blue-700 mb-1">{stats.totalAlumni}+</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-600">Graduated Alumni</div>
            <div className="text-[11px] text-slate-400 mt-1">Working across 40+ Tech Giants</div>
          </div>
          <div className="p-4 border-r border-slate-100 last:border-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 mb-1">{stats.activeMentors}</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-600">Active Mentors</div>
            <div className="text-[11px] text-slate-400 mt-1">Available for 1-on-1 Guidance</div>
          </div>
          <div className="p-4 border-r border-slate-100 last:border-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-purple-600 mb-1">{stats.totalJobs}</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-600">Referrals &amp; Jobs</div>
            <div className="text-[11px] text-slate-400 mt-1">Fast-track Interview Opportunities</div>
          </div>
          <div className="p-4">
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-600 mb-1">
              ₹{(stats.totalDonationAmount / 100000).toFixed(1)}L+
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-600">Alumni Contributions</div>
            <div className="text-[11px] text-slate-400 mt-1">Scholarships &amp; Lab Gear Pledged</div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT ALUMNICONNECT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <span>About the Platform</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              An Integrated Digital Hub for Lifelong Academic Partnerships
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              AlumniConnect replaces disconnected spreadsheets and unverified social groups with an authentic, university-backed networking architecture. By combining verified student profiles with seasoned alumni working at Fortune 500 companies and high-growth startups, the university creates a self-reinforcing talent pipeline.
            </p>
            <div className="space-y-3">
              {[
                'Role-Based Access Control for Students, Alumni, Faculty, and Admin',
                'LinkedIn-style bidirectional connection lifecycle with zero-spam guardrails',
                'Explainable skill-matching algorithm (e.g. 85% Skill Match indicator)',
                'End-to-end transparent alumni endowment, scholarship, and equipment tracking',
              ].map((point, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700 font-medium">{point}</span>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <button
                onClick={() => setCurrentTab('directory')}
                className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                <span>Browse verified alumni directory</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl"></div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <GraduationCap className="w-6 h-6 mr-2 text-cyan-400" />
              Four Distinct User Roles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
                <span className="font-bold text-cyan-300 block mb-1">🎓 Student</span>
                <p className="text-slate-300">Request mentorship, explore career referrals, register for events, and build network.</p>
              </div>
              <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
                <span className="font-bold text-blue-300 block mb-1">💼 Alumni</span>
                <p className="text-slate-300">Offer mentorship, post exclusive jobs, attend reunions, and pledge contributions.</p>
              </div>
              <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
                <span className="font-bold text-amber-300 block mb-1">👨‍🏫 Faculty</span>
                <p className="text-slate-300">Track student-mentor engagements, organize department meets, and oversee outcomes.</p>
              </div>
              <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
                <span className="font-bold text-purple-300 block mb-1">🛡️ Admin</span>
                <p className="text-slate-300">Approve registrations, manage university events, view deep analytics, and audit gifts.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KEY FEATURES GRID */}
      <section className="bg-slate-100/70 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-md">
              Core Capabilities
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Comprehensive Features Built for Campus Success</h2>
            <p className="text-sm text-slate-600 mt-2">
              Everything required to sustain a thriving, high-impact university alumni ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Searchable Alumni Directory</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Search alumni across graduation years, departments, industries, target companies, and locations with instant profile insights.
              </p>
              <button
                onClick={() => setCurrentTab('directory')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center cursor-pointer"
              >
                Explore Directory <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">1-on-1 Mentorship Portal</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Structured mentorship requests across 7 specialized categories: Career Guidance, Technical Mock Interviews, Higher Studies, and Resume Reviews.
              </p>
              <button
                onClick={() => setCurrentTab('mentorship')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center cursor-pointer"
              >
                Browse Mentors <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Career &amp; Referral Board</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Exclusive full-time jobs, summer internships, and direct internal referrals posted directly by alumni hiring managers and staff.
              </p>
              <button
                onClick={() => setCurrentTab('careers')}
                className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center cursor-pointer"
              >
                View Openings <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Alumni Meets &amp; Webinars</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Discover annual homecomings, technical masterclasses, career fairs, and decennial reunions with instant seat booking and attendee lists.
              </p>
              <button
                onClick={() => setCurrentTab('events')}
                className="text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center cursor-pointer"
              >
                Browse Events <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Contributions &amp; Endowments</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Transparent tracking of alumni contributions: scholarships, lab equipment donations, seed funding for student startups, and guest lectures.
              </p>
              <button
                onClick={() => setCurrentTab('contributions')}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center cursor-pointer"
              >
                View Contributions <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">My Network &amp; Messaging</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                LinkedIn-style connection management with mutual connections display and direct messaging gated between accepted pairs.
              </p>
              <button
                onClick={() => setCurrentTab('network')}
                className="text-xs font-bold text-cyan-600 hover:text-cyan-800 flex items-center cursor-pointer"
              >
                Manage Network <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-md">
            Step-by-Step Flow
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">How AlumniConnect Works</h2>
          <p className="text-sm text-slate-600 mt-1">Four simple steps to unlock the full power of your university alumni network.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="bg-white p-6 rounded-xl border border-slate-200 text-center relative">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center mx-auto mb-4 text-sm shadow-md">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Create Verified Profile</h3>
            <p className="text-xs text-slate-500">
              Sign up with your university department, graduation year, and professional credentials.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 text-center relative">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center mx-auto mb-4 text-sm shadow-md">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Discover &amp; Match</h3>
            <p className="text-xs text-slate-500">
              Our explainable algorithm calculates skill compatibility scores (up to 95% Match) for mentorship.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 text-center relative">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center mx-auto mb-4 text-sm shadow-md">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Connect &amp; Collaborate</h3>
            <p className="text-xs text-slate-500">
              Submit mentorship requests, chat internally, and participate in masterclasses.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 text-center relative">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center mx-auto mb-4 text-sm shadow-md">
              4
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Accelerate Career</h3>
            <p className="text-xs text-slate-500">
              Apply for fast-track referrals at Google, Microsoft, Amazon, Swiggy, and top startups.
            </p>
          </div>
        </div>
      </section>

      {/* 6. FEATURED MENTORS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-md">
              Verified Mentors
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Meet Our Distinguished Alumni Mentors</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Top alumni giving back through 1-on-1 interview preparation, resume reviews, and career coaching.
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('mentorship')}
            className="mt-4 sm:mt-0 text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center cursor-pointer"
          >
            View All Mentors <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredAlumni.slice(0, 4).map((alumni) => (
            <div
              key={alumni.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={alumni.avatar}
                    alt={alumni.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 truncate">{alumni.name}</h3>
                    <p className="text-xs text-blue-600 font-semibold">{alumni.company}</p>
                    <span className="text-[11px] text-slate-400">Class of {alumni.graduationYear}</span>
                  </div>
                </div>
                <p className="text-xs font-medium text-slate-700 mb-2">{alumni.jobTitle}</p>
                <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">{alumni.bio}</p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {(alumni.skills || []).slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  85%+ Match
                </span>
                <button
                  onClick={() => setCurrentTab('mentorship')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  Request Mentorship
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. UPCOMING EVENTS SPOTLIGHT */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-md">
                Events &amp; Reunions
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Upcoming Campus &amp; Virtual Gatherings</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Participate in masterclasses, career fairs, and milestone reunions.
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('events')}
              className="mt-4 sm:mt-0 text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center cursor-pointer"
            >
              Explore All Events <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.slice(0, 3).map((ev) => (
              <div
                key={ev.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
              >
                {ev.bannerImage && (
                  <img src={ev.bannerImage} alt={ev.title} className="w-full h-40 object-cover" />
                )}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {ev.type}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {ev.date}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2 line-clamp-2">{ev.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4">{ev.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      Seats: <strong className="text-slate-900">{ev.maxParticipants - ev.registeredUserIds.length} left</strong>
                    </span>
                    <button
                      onClick={() => setCurrentTab('events')}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                    >
                      View &amp; Register
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-md">
            Testimonials
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Voices From Our Community</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-slate-600 italic leading-relaxed mb-4">
              "Connecting with Priya Sharma through AlumniConnect helped me prepare specifically for the distributed systems interview rounds. I received my SDE offer from Google within 3 weeks!"
            </p>
            <div className="flex items-center space-x-3">
              <img
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100"
                alt="Aarav Mehta"
                className="w-9 h-9 rounded-full object-cover"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Aarav Mehta</h4>
                <p className="text-[11px] text-slate-500">B.Tech CSE 2027 • Placed at Google</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-slate-600 italic leading-relaxed mb-4">
              "As an alumnus, I always wanted an organized way to mentor junior students without getting flooded with random LinkedIn spam. AlumniConnect's structured requests make giving back effortless."
            </p>
            <div className="flex items-center space-x-3">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
                alt="Rohan Verma"
                className="w-9 h-9 rounded-full object-cover"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Rohan Verma</h4>
                <p className="text-[11px] text-slate-500">Principal Lead @ Microsoft (Class of 2017)</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-slate-600 italic leading-relaxed mb-4">
              "The department level statistics and transparent contribution tracking enable our faculty to coordinate guest lectures and secure summer internships with unprecedented speed."
            </p>
            <div className="flex items-center space-x-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                alt="Dr. Anand"
                className="w-9 h-9 rounded-full object-cover"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Dr. Anand Ramanathan</h4>
                <p className="text-[11px] text-slate-500">Professor &amp; HOD, Dept of CSE</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. BOTTOM CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Ready to Expand Your Academic &amp; Professional Horizons?
          </h2>
          <p className="text-sm sm:text-base text-blue-200 max-w-2xl mx-auto mb-8">
            Join thousands of active students, alumni, and faculty members in shaping the future of National Institute of Technology &amp; Engineering.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setCurrentTab('directory')}
              className="px-8 py-3.5 rounded-xl bg-white text-blue-950 font-bold text-sm hover:bg-blue-50 transition-all shadow-md cursor-pointer"
            >
              Explore Alumni Directory
            </button>
            <button
              onClick={onOpenAuth}
              className="px-8 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-all border border-blue-400/30 cursor-pointer"
            >
              Join the Network / Login
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
