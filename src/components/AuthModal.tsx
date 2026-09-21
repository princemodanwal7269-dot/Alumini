import React, { useState } from 'react';
import { User, UserRole, Department } from '../types';
import { X, Lock, Mail, GraduationCap, Sparkles, CheckCircle2, Terminal } from 'lucide-react';
import { StudentApiService } from '../services/studentApiService';
import { StorageService } from '../services/storageService';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [department, setDepartment] = useState<Department>('Computer Science & Engineering');
  const [graduationYear, setGraduationYear] = useState<number>(2025);
  const [semester, setSemester] = useState('6th Semester');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [skillsStr, setSkillsStr] = useState('Java, Spring Boot, MySQL');
  const [isAvailableForMentoring, setIsAvailableForMentoring] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  // Demo accounts quick login
  const handleQuickLogin = async (demoRole: UserRole) => {
    let emailToUse = '';
    switch (demoRole) {
      case 'ADMIN':
        emailToUse = 'admin@alumniconnect.com';
        break;
      case 'ALUMNI':
        emailToUse = 'alumni@alumniconnect.com';
        break;
      case 'FACULTY':
        emailToUse = 'faculty@alumniconnect.com';
        break;
      case 'STUDENT':
      default:
        emailToUse = 'student@alumniconnect.com';
        break;
    }

    try {
      const res = await StudentApiService.loginStudent(emailToUse, 'password123');
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setLoginError(err.message || 'Demo login failed');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await StudentApiService.loginStudent(loginEmail.trim(), loginPassword);
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setLoginError(err.message || 'Invalid credentials. Tip: default demo password is "password123".');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setIsRegistering(true);

    try {
      const parsedSkills = skillsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      let registeredUser: User;
      if (role === 'ALUMNI') {
        const newUser = StorageService.registerUser({
          name: name.trim(),
          email: email.trim(),
          role: 'ALUMNI',
          department,
          graduationYear: Number(graduationYear),
          company: company.trim() || 'Tech Enterprise',
          jobTitle: jobTitle.trim() || 'Software Engineer',
          skills: parsedSkills,
          isAvailableForMentoring: isAvailableForMentoring,
        });

        StudentApiService.recordCustomLog({
          method: 'POST',
          endpoint: '/api/auth/register',
          controller: 'com.alumniconnect.controller.AuthController',
          javaMethod: 'public ResponseEntity<?> registerAlumni(@Valid @RequestBody AlumniRegisterRequest req)',
          status: 201,
          statusText: 'Created',
          durationMs: 65,
          requestPayload: { name, email, role: 'ALUMNI', company, jobTitle, department, graduationYear },
          responsePayload: { success: true, userId: newUser.id, role: 'ALUMNI', message: 'Alumni registration successful.' },
          sqlQuery: `INSERT INTO users (id, name, email, role, department, graduation_year, company, job_title, status) VALUES ('${newUser.id}', '${name}', '${email}', 'ALUMNI', '${department}', ${graduationYear}, '${company}', '${jobTitle}', 'ACTIVE');`,
        });

        registeredUser = newUser;
      } else {
        const res = await StudentApiService.registerStudent({
          name: name.trim(),
          email: email.trim(),
          password,
          rollNumber: rollNumber.trim() || `2024CSB${Math.floor(1000 + Math.random() * 9000)}`,
          department,
          graduationYear: Number(graduationYear),
          semester,
          skills: parsedSkills,
        });
        registeredUser = res.user;
      }

      onLoginSuccess(registeredUser);
      onClose();
    } catch (err: any) {
      setLoginError(err.message || 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">AlumniConnect Authentication</h3>
              <p className="text-[11px] text-blue-200">Spring Boot REST API Security Layer</p>
            </div>
          </div>
        </div>

        {/* 1-Click Fast Switcher for Viva Evaluation */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 mr-1" />
            Instant 1-Click Demo Login:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickLogin('STUDENT')}
              className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-left cursor-pointer flex items-center justify-between"
            >
              <span>Student Account</span>
              <span className="text-[10px] bg-emerald-200/60 px-1 rounded">Active</span>
            </button>
            <button
              onClick={() => handleQuickLogin('ALUMNI')}
              className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-left cursor-pointer flex items-center justify-between"
            >
              <span>Alumni Account</span>
              <span className="text-[10px] bg-blue-200/60 px-1 rounded">Active</span>
            </button>
            <button
              onClick={() => handleQuickLogin('FACULTY')}
              className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-left cursor-pointer flex items-center justify-between"
            >
              <span>Faculty Admin</span>
              <span className="text-[10px] bg-amber-200/60 px-1 rounded">Active</span>
            </button>
            <button
              onClick={() => handleQuickLogin('ADMIN')}
              className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-left cursor-pointer flex items-center justify-between"
            >
              <span>Super Admin</span>
              <span className="text-[10px] bg-purple-200/60 px-1 rounded">Active</span>
            </button>
          </div>
        </div>

        {/* Tab Switching */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              authMode === 'login'
                ? 'border-blue-600 text-blue-600 bg-blue-50/20'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In (POST /api/auth/login)
          </button>
          <button
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              authMode === 'register'
                ? 'border-blue-600 text-blue-600 bg-blue-50/20'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Student Registration (POST /api/auth/register)
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {loginError && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {loginError}
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Registered Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="student@alumniconnect.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="text-right mt-1">
                  <span className="text-[10px] text-slate-400">Default demo password: password123</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>{isLoggingIn ? 'Authenticating...' : 'Sign In (POST /api/auth/login)'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs max-h-[50vh] overflow-y-auto pr-1">
              {/* Role Selection for Registration */}
              <div className="flex rounded-lg p-1 bg-slate-100 mb-2">
                <button
                  type="button"
                  onClick={() => setRole('STUDENT')}
                  className={`flex-1 py-1.5 rounded-md font-bold text-xs transition-colors cursor-pointer ${
                    role === 'STUDENT' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Student Registration
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ALUMNI')}
                  className={`flex-1 py-1.5 rounded-md font-bold text-xs transition-colors cursor-pointer ${
                    role === 'ALUMNI' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Alumni Registration
                </button>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {role === 'ALUMNI' ? 'Alumni Full Name *' : 'Student Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={role === 'ALUMNI' ? 'e.g. Priya Sharma' : 'e.g. Rahul Sharma'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder={role === 'ALUMNI' ? 'priya.sharma@google.com' : 'rahul.sharma@university.edu'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {role === 'ALUMNI' ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Current Company *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Google India"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Job Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Senior Software Engineer"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Batch / Graduation Year *</label>
                      <input
                        type="number"
                        required
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Department *</label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value as Department)}
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="Computer Science & Engineering">CSE</option>
                        <option value="Information Science & Engineering">ISE</option>
                        <option value="Electronics & Communication">ECE</option>
                        <option value="Mechanical Engineering">Mech</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-blue-900 block">Available for Student Mentoring</span>
                      <span className="text-[10px] text-blue-700">Guide campus juniors in career &amp; coding</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isAvailableForMentoring}
                      onChange={(e) => setIsAvailableForMentoring(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Roll Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 2022CSB1090"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Graduation Year *</label>
                      <input
                        type="number"
                        required
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Department *</label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value as Department)}
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="Computer Science & Engineering">CSE</option>
                        <option value="Information Science & Engineering">ISE</option>
                        <option value="Electronics & Communication">ECE</option>
                        <option value="Mechanical Engineering">Mech</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Current Semester</label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="4th Semester">4th Sem</option>
                        <option value="5th Semester">5th Sem</option>
                        <option value="6th Semester">6th Sem</option>
                        <option value="7th Semester">7th Sem</option>
                        <option value="8th Semester">8th Sem</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Technical Skills &amp; Keywords</label>
                <input
                  type="text"
                  placeholder="Java, Spring Boot, React, Cloud"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {isRegistering
                    ? 'Registering in DB...'
                    : `Register ${role === 'ALUMNI' ? 'Alumni' : 'Student'} via REST API`}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
