import React from 'react';
import { GraduationCap, ShieldCheck, Heart, BookOpen, Code, Github, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  onOpenDocs: () => void;
  onOpenJavaSource: () => void;
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDocs, onOpenJavaSource, setCurrentTab }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1 & 2: Branding */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold text-white tracking-tight">AlumniConnect</span>
                <p className="text-xs text-blue-400 font-medium">Connect. Mentor. Grow.</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed pr-6">
              The official centralized Alumni Engagement and Networking System for National Institute of Technology &amp; Engineering. Fostering lifelong institutional relationships, student mentorship, industry partnerships, and campus innovation.
            </p>
            <div className="flex items-center space-x-3 text-xs text-slate-400 pt-2">
              <span className="flex items-center text-emerald-400">
                <ShieldCheck className="w-4 h-4 mr-1 text-emerald-400" />
                Verified University Network
              </span>
              <span>•</span>
              <span>ISO 27001 Certified Security</span>
            </div>
          </div>

          {/* Col 3: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Platform Modules</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => setCurrentTab('directory')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  Search Alumni Directory
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('mentorship')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  1-on-1 Mentorship Portal
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('network')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  My Professional Network
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('events')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  University Alumni Meets
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('careers')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  Jobs &amp; Referral Board
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('contributions')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  Endowments &amp; Giving
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: College Project Deliverables */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">B.Tech Java Project</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={onOpenDocs} className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center cursor-pointer">
                  <BookOpen className="w-4 h-4 mr-1.5" />
                  18 Documentation Sections
                </button>
              </li>
              <li>
                <button onClick={onOpenDocs} className="hover:text-blue-400 transition-colors cursor-pointer">
                  ER &amp; Architecture Diagrams
                </button>
              </li>
              <li>
                <button onClick={onOpenDocs} className="hover:text-blue-400 transition-colors cursor-pointer">
                  Java Viva Q&amp;A Cheat Sheet
                </button>
              </li>
              <li>
                <button onClick={onOpenJavaSource} className="text-amber-400 hover:text-amber-300 transition-colors flex items-center cursor-pointer">
                  <Code className="w-4 h-4 mr-1.5" />
                  Spring Boot Source Code
                </button>
              </li>
              <li>
                <button onClick={onOpenJavaSource} className="hover:text-blue-400 transition-colors cursor-pointer">
                  Download Project ZIP
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: University Contact */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Office of Alumni Affairs</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <p className="flex items-start">
                <MapPin className="w-4 h-4 mr-2 text-slate-500 shrink-0 mt-0.5" />
                Administrative Block, University Campus, Outer Ring Road, Bangalore - 560100
              </p>
              <p className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-slate-500 shrink-0" />
                alumni.relations@nite.ac.in
              </p>
              <p className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-slate-500 shrink-0" />
                +91 (080) 2839-4000
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} AlumniConnect. Developed for University Academic Demonstration.</p>
          <div className="flex items-center space-x-4">
            <span className="text-slate-400">Demo Accounts: admin@ / alumni@ / student@ / faculty@alumniconnect.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
