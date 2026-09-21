import React, { useState, useMemo } from 'react';
import {
  Award,
  DollarSign,
  HeartHandshake,
  BookOpen,
  Sparkles,
  Building,
  CheckCircle2,
  Clock,
  Plus,
  Send,
  ShieldCheck,
  Search,
  X,
  Star,
} from 'lucide-react';
import { User, AlumniContribution, ContributionType, SystemStats } from '../types';
import { StorageService } from '../services/storageService';

interface ContributionsPortalProps {
  currentUser: User;
  users: User[];
  contributions: AlumniContribution[];
  stats: SystemStats;
  onRefreshData: () => void;
}

export const ContributionsPortal: React.FC<ContributionsPortalProps> = ({
  currentUser,
  users,
  contributions,
  stats,
  onRefreshData,
}) => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [isPledgeModalOpen, setIsPledgeModalOpen] = useState(false);

  // Form states
  const [pledgeType, setPledgeType] = useState<ContributionType>('Scholarship Sponsor');
  const [amount, setAmount] = useState<number>(50000);
  const [description, setDescription] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const contributionTypes: ContributionType[] = [
    'Donation / Funds',
    'Scholarship Sponsor',
    'Mentorship',
    'Guest Lecture',
    'Internship / Job Referral',
    'Event Sponsorship',
    'Equipment / Resources',
  ];

  const filteredContributions = useMemo(() => {
    return contributions.filter((c) => selectedType === 'ALL' || c.contributionType === selectedType);
  }, [contributions, selectedType]);

  // Wall of Fame: top verified contributions by amount or impact
  const wallOfFame = useMemo(() => {
    return contributions
      .filter((c) => c.status === 'VERIFIED' && (c.amount || 0) > 0)
      .sort((a, b) => (b.amount || 0) - (a.amount || 0))
      .slice(0, 4);
  }, [contributions]);

  const handlePledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    StorageService.pledgeContribution({
      alumniId: currentUser.id,
      alumniName: currentUser.name,
      contributionType: pledgeType,
      amount: pledgeType === 'Donation / Funds' || pledgeType === 'Scholarship Sponsor' || pledgeType === 'Event Sponsorship' ? Number(amount) : undefined,
      description: description.trim(),
      status: currentUser.role === 'ADMIN' ? 'VERIFIED' : 'PENDING',
    });

    setIsPledgeModalOpen(false);
    setDescription('');
    setToastMsg('Contribution pledge recorded! University admin will verify institutional records.');
    setTimeout(() => setToastMsg(null), 4000);
    onRefreshData();
  };

  const handleVerify = (id: string) => {
    StorageService.verifyContribution(id);
    onRefreshData();
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
            <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 font-bold text-xs">Giving &amp; Philanthropy</span>
            <span className="text-xs text-slate-500 font-medium">• Institutional Endowments</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Alumni Contributions &amp; Wall of Fame</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Honoring alumni who empower the university through scholarship endowments, lab hardware, and guidance.
          </p>
        </div>

        <button
          onClick={() => setIsPledgeModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Pledge a Contribution</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Endowments</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            ₹{stats.totalDonationAmount.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Direct monetary grants &amp; funds</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scholarships Funded</span>
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">18 Students</div>
          <p className="text-[11px] text-slate-400 mt-1">Full-tuition merit scholarships</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Mentorships</span>
            <HeartHandshake className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.activeMentors} Mentors</div>
          <p className="text-[11px] text-slate-400 mt-1">Over 240+ guidance hours pledged</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Contributions</span>
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{contributions.length} Pledges</div>
          <p className="text-[11px] text-slate-400 mt-1">Across 7 institutional categories</p>
        </div>
      </div>

      {/* WALL OF FAME (Top Contributors) */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex items-center space-x-2 mb-2">
          <Star className="w-5 h-5 text-amber-400 fill-current" />
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Institutional Wall of Fame</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-6">Distinguished Alumni Philanthropists</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {wallOfFame.map((item, idx) => (
            <div key={item.id} className="bg-white/10 rounded-xl p-4 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-amber-300">#{idx + 1} Contributor</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="text-sm font-bold text-white leading-tight">{item.alumniName}</h4>
                <p className="text-xs text-cyan-300 font-semibold mt-1">
                  ₹{item.amount?.toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-slate-300 mt-2 line-clamp-2 leading-snug">
                  {item.description}
                </p>
              </div>
              <span className="text-[10px] text-slate-400 mt-3 block pt-2 border-t border-white/10">
                {item.contributionType}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ALL CONTRIBUTIONS LEDGER */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-900">Institutional Contributions Ledger</h3>

          {/* Filter pills */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedType('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                selectedType === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Types
            </button>
            {contributionTypes.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedType === t
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
          {filteredContributions.length === 0 ? (
            <p className="p-8 text-center text-slate-400 text-xs">No contributions found for this category.</p>
          ) : (
            filteredContributions.map((item) => (
              <div
                key={item.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {item.contributionType}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.status === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mt-1">{item.alumniName}</h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">{item.description}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Pledged on {new Date(item.createdAt || item.date || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center space-x-3 shrink-0 self-end md:self-center">
                  {item.amount && (
                    <span className="text-sm font-extrabold text-emerald-700">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </span>
                  )}

                  {currentUser.role === 'ADMIN' && item.status === 'PENDING' && (
                    <button
                      onClick={() => handleVerify(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                    >
                      Verify Audit
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PLEDGE CONTRIBUTION MODAL */}
      {isPledgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Pledge Alumni Contribution</h3>
              <button
                onClick={() => setIsPledgeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePledge} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Contribution Type *</label>
                <select
                  value={pledgeType}
                  onChange={(e) => setPledgeType(e.target.value as ContributionType)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                >
                  {contributionTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {(pledgeType === 'Donation / Funds' ||
                pledgeType === 'Scholarship Sponsor' ||
                pledgeType === 'Event Sponsorship') && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pledge Amount (₹ INR) *</label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Description of Contribution &amp; Intended Purpose *
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Sponsoring 2 final year undergraduate tuition fees for disadvantaged students in Department of Computer Science..."
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPledgeModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Submit Pledge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
