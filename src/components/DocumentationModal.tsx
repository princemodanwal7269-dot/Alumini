import React, { useState } from 'react';
import { BookOpen, X, HelpCircle, CheckCircle, ChevronRight, Download, Printer, Search } from 'lucide-react';
import { DOCUMENTATION_SECTIONS, VIVA_QUESTIONS, DocSection, VivaQuestion } from '../data/documentationData';

interface DocumentationModalProps {
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'report' | 'viva'>('report');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('abstract');
  const [vivaCategory, setVivaCategory] = useState<string>('ALL');
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  const currentSection = DOCUMENTATION_SECTIONS.find((s) => s.id === selectedSectionId) || DOCUMENTATION_SECTIONS[0];

  const toggleReveal = (idx: number) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const filteredViva = VIVA_QUESTIONS.filter(
    (q) => vivaCategory === 'ALL' || q.category === vivaCategory
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">College Project Documentation</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  B.Tech Final Year
                </span>
              </div>
              <p className="text-xs text-slate-300">
                18 Mandatory Academic Sections • Architecture Diagrams • Viva Questions &amp; Answers
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Report</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switch between 18 Report Sections and Viva Hub */}
        <div className="px-6 py-2 bg-slate-100 border-b border-slate-200 flex items-center space-x-3 text-xs">
          <button
            onClick={() => setActiveTab('report')}
            className={`py-1.5 px-3 rounded-lg font-bold transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'report' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Project Report (18 Sections)</span>
          </button>
          <button
            onClick={() => setActiveTab('viva')}
            className={`py-1.5 px-3 rounded-lg font-bold transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'viva' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Examiner Viva Q&amp;A Flashcards ({VIVA_QUESTIONS.length})</span>
          </button>
        </div>

        {/* TAB 1: 18 SECTIONS REPORT */}
        {activeTab === 'report' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Table of contents sidebar */}
            <div className="w-72 sm:w-80 border-r border-slate-200 bg-slate-50 overflow-y-auto divide-y divide-slate-100">
              <div className="p-3 font-bold text-xs text-slate-500 uppercase tracking-wider">
                Table of Contents
              </div>
              {DOCUMENTATION_SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSectionId(sec.id)}
                  className={`w-full p-3 text-left transition-colors cursor-pointer flex items-center justify-between ${
                    selectedSectionId === sec.id
                      ? 'bg-blue-50/80 text-blue-800 font-bold border-r-2 border-blue-600'
                      : 'text-slate-700 hover:bg-slate-100 text-xs'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] text-slate-400 font-bold block">
                      Section {sec.number}
                    </span>
                    <span className="text-xs truncate block">{sec.title}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>

            {/* Document Reader Area */}
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-white">
              <div className="max-w-3xl mx-auto space-y-6">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded">
                    Academic Section {currentSection.number}
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-2">{currentSection.title}</h2>
                  <p className="text-xs text-slate-500 mt-1 italic">{currentSection.summary}</p>
                </div>

                <div className="prose prose-sm prose-slate max-w-none text-slate-700 whitespace-pre-line leading-relaxed text-xs sm:text-sm">
                  {currentSection.content}
                </div>

                {/* Section Navigation Buttons */}
                <div className="pt-8 border-t border-slate-200 flex items-center justify-between text-xs">
                  {currentSection.number > 1 ? (
                    <button
                      onClick={() => {
                        const prev = DOCUMENTATION_SECTIONS.find((s) => s.number === currentSection.number - 1);
                        if (prev) setSelectedSectionId(prev.id);
                      }}
                      className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold cursor-pointer"
                    >
                      ← Previous Section
                    </button>
                  ) : <div></div>}

                  {currentSection.number < DOCUMENTATION_SECTIONS.length && (
                    <button
                      onClick={() => {
                        const next = DOCUMENTATION_SECTIONS.find((s) => s.number === currentSection.number + 1);
                        if (next) setSelectedSectionId(next.id);
                      }}
                      className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                    >
                      Next Section →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VIVA QUESTIONS & ANSWERS */}
        {activeTab === 'viva' && (
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Final Year Viva Examination Preparation</h3>
                  <p className="text-xs text-slate-500">
                    Frequently asked questions on Spring Boot, ORM, Security, and Database Architecture.
                  </p>
                </div>

                <select
                  value={vivaCategory}
                  onChange={(e) => setVivaCategory(e.target.value)}
                  className="py-1.5 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 font-semibold"
                >
                  <option value="ALL">All Topics</option>
                  <option value="Spring Boot">Spring Boot</option>
                  <option value="JPA / Hibernate">JPA / Hibernate</option>
                  <option value="Database">Database &amp; SQL</option>
                  <option value="OOP / Architecture">OOP &amp; Architecture</option>
                  <option value="Security">Security &amp; JWT</option>
                </select>
              </div>

              <div className="space-y-4">
                {filteredViva.map((viva, idx) => {
                  const isRevealed = !!revealedAnswers[idx];
                  return (
                    <div
                      key={idx}
                      className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {viva.category}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 pt-1">
                            Q{idx + 1}: {viva.question}
                          </h4>
                        </div>
                        <button
                          onClick={() => toggleReveal(idx)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                            isRevealed
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {isRevealed ? 'Hide Answer' : 'Reveal Answer'}
                        </button>
                      </div>

                      {isRevealed && (
                        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed animate-in fade-in">
                          <strong className="text-emerald-700 font-bold block mb-1">
                            Academic Model Answer:
                          </strong>
                          {viva.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
