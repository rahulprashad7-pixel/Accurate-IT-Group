import React, { useState } from 'react';
import {
  Layers,
  Shield,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Laptop,
  TicketCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogle, loginAsDemoPersona } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your corporate email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password || 'password123');
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err?.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const demoPersonas = [
    {
      id: 'usr-super-admin',
      name: 'Rahul Prashad',
      roleLabel: 'Super Admin / Group CIO',
      roleBadge: 'bg-blue-50 text-blue-700 border-blue-200',
      company: 'Group Portal (All 3 Companies)',
      companyBadge: 'bg-slate-900 text-white',
      desc: 'Full administrative access across AGIPL, ASSPL & ONYX Precision systems.',
    },
    {
      id: 'usr-agipl-admin',
      name: 'Vikramaditya Sharma',
      roleLabel: 'Company Admin',
      roleBadge: 'bg-sky-50 text-sky-700 border-sky-200',
      company: 'AGIPL (Manufacturing)',
      companyBadge: 'bg-sky-600 text-white',
      desc: 'Scoped administrative permissions for AGIPL heavy engineering and CNC lines.',
    },
    {
      id: 'usr-asspl-admin',
      name: 'Sunita Menon',
      roleLabel: 'Company Admin',
      roleBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      company: 'ASSPL (Logistics & Supply)',
      companyBadge: 'bg-emerald-600 text-white',
      desc: 'Scoped administrative permissions for ASSPL warehouse distribution nodes.',
    },
    {
      id: 'usr-onyx-admin',
      name: 'Kiran Deshmukh',
      roleLabel: 'Company Admin',
      roleBadge: 'bg-purple-50 text-purple-700 border-purple-200',
      company: 'ONYX Precision (High Tech)',
      companyBadge: 'bg-purple-600 text-white',
      desc: 'Scoped administrative permissions for ONYX cleanrooms and CAD clusters.',
    },
    {
      id: 'usr-it-staff-2',
      name: 'Pooja Varma',
      roleLabel: 'IT Support Engineer',
      roleBadge: 'bg-amber-50 text-amber-700 border-amber-200',
      company: 'ASSPL IT Support',
      companyBadge: 'bg-emerald-600 text-white',
      desc: 'Can triage tickets, perform hardware audits, and log maintenance notes.',
    },
    {
      id: 'usr-emp-onyx-1',
      name: 'Dr. Tanya Banerjee',
      roleLabel: 'Employee / End User',
      roleBadge: 'bg-slate-100 text-slate-700 border-slate-200',
      company: 'ONYX Precision (R&D)',
      companyBadge: 'bg-purple-600 text-white',
      desc: 'Can raise tickets and view assigned workstation & VR CAD headset.',
    },
  ];

  return (
    <div className="min-h-screen w-screen flex flex-col justify-between bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Top Bar */}
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-bold shadow-xs">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 tracking-tight">OmniIT Enterprise</span>
            <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
              Multi-Company
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
          <span className="hidden sm:inline">Portal for AGIPL • ASSPL • ONYX Precision</span>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto my-auto w-full max-w-6xl p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Login Form & Overview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xs">
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Enterprise Access</span>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Sign In to OmniIT</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Single sign-on for IT asset custody, service desk ticketing & multi-tier SLA monitoring.
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="login-email-input"
                      type="email"
                      required
                      placeholder="e.g. rahul.prashad@omni-holdings.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="login-password-input"
                      type="password"
                      placeholder="Enter password (demo mode accepts any)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-xs hover:bg-blue-600 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <span>Enter IT Portal</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>

                <div className="relative my-3 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <span className="relative bg-white px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Or Continue With
                  </span>
                </div>

                <button
                  id="google-signin-btn"
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5 text-emerald-600" />
                  Role-Based Security (RBAC)
                </span>
                <span>Protected by Cloud Auth</span>
              </div>
            </div>

            {/* Companies Badge Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Supported Companies
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-3 text-center">
                  <div className="text-xs font-bold text-sky-900">AGIPL</div>
                  <div className="text-[10px] text-sky-700">Engineering</div>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3 text-center">
                  <div className="text-xs font-bold text-emerald-900">ASSPL</div>
                  <div className="text-[10px] text-emerald-700">Logistics</div>
                </div>
                <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-3 text-center">
                  <div className="text-xs font-bold text-purple-900">ONYX</div>
                  <div className="text-[10px] text-purple-700">High Tech</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Demo Personas 1-Click Switcher */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600">
                    <Sparkles className="h-4 w-4" />
                    <span>Instant Demo Personas</span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                    Click Any Persona to Enter
                  </h2>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  Select a role to test multi-tenancy
                </span>
              </div>

              <div className="space-y-3">
                {demoPersonas.map((persona) => (
                  <button
                    key={persona.id}
                    id={`demo-persona-${persona.id}`}
                    onClick={() => loginAsDemoPersona(persona.id)}
                    className="w-full text-left rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 hover:border-slate-300 hover:bg-white hover:shadow-md transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white text-xs font-bold group-hover:bg-blue-600 transition-colors">
                          {persona.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm">
                            {persona.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${persona.roleBadge}`}>
                              {persona.roleLabel}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500">
                              {persona.company}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors flex items-center gap-1">
                        <span>Launch</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>

                    <p className="mt-2 text-[11px] text-slate-500 pl-10.5">
                      {persona.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-400">
        OmniIT Multi-Tenant Asset & Help Desk Management Platform • All rights reserved.
      </footer>
    </div>
  );
};
