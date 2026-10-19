import React, { useState } from 'react';
import { X, Sparkles, KeyRound, User as UserIcon, Mail } from 'lucide-react';
import { DjedLogo } from './DjedLogo.js';
import type { User } from '../types/index.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  allUsers: User[];
  onSwitchUser: (userId: string) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  allUsers,
  onSwitchUser,
}: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isRegister ? '/api/v1/auth/register' : '/api/v1/auth/login';
    const payload = isRegister
      ? { username, email, password, displayName, bio }
      : { login, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md rounded-2xl bg-[#15100D] border border-bronze-subtle p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-muted-bronze hover:text-ivory hover:bg-[#201711] cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <DjedLogo size={48} className="mb-2 djed-pillar-glow" />
          <h2 className="font-cinzel text-xl font-bold text-gold tracking-wider">
            {isRegister ? 'Inscribe New Soul' : 'Enter the Sanctuary'}
          </h2>
          <p className="text-xs text-muted-bronze mt-1">
            {isRegister
              ? 'Forge your permanent seal on the DJED network'
              : 'Sign in to access your chambers and inscriptions'}
          </p>
        </div>

        {/* Quick Demo Persona Matrix */}
        <div className="mb-5 p-3 rounded-xl bg-[#201711] border border-bronze-subtle">
          <div className="flex items-center gap-1.5 mb-2 text-gold">
            <Sparkles size={13} />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Quick Test Sign-In
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {allUsers.slice(0, 4).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  onSwitchUser(u.id);
                  onClose();
                }}
                className="flex items-center gap-2 p-1.5 rounded bg-[#15100D] hover:bg-[#2B2017] border border-bronze-subtle/60 text-left transition-all cursor-pointer"
              >
                <img
                  src={u.avatarUrl}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover border border-gold"
                />
                <div className="truncate">
                  <span className="text-xs font-semibold text-ivory block truncate leading-tight">
                    {u.displayName.split(' ')[0]}
                  </span>
                  <span className="text-[9px] text-muted-bronze block uppercase">
                    {u.role}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded bg-[#2B1717] border border-[#E47770]/40 text-xs text-[#E47770]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister ? (
            <>
              <div>
                <label className="text-xs text-ivory block mb-1">Display Name</label>
                <div className="relative">
                  <UserIcon size={14} className="absolute left-3 top-2.5 text-muted-bronze" />
                  <input
                    type="text"
                    placeholder="e.g. Ptah-Shepses"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0c0907] border border-bronze-subtle text-xs text-ivory focus:outline-none focus:border-gold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-ivory block mb-1">Unique Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-gold">@</span>
                  <input
                    type="text"
                    placeholder="architect_01"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#0c0907] border border-bronze-subtle text-xs text-ivory focus:outline-none focus:border-gold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-ivory block mb-1">Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-2.5 text-muted-bronze" />
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0c0907] border border-bronze-subtle text-xs text-ivory focus:outline-none focus:border-gold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-ivory block mb-1">Password</label>
                <div className="relative">
                  <KeyRound size={14} className="absolute left-3 top-2.5 text-muted-bronze" />
                  <input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0c0907] border border-bronze-subtle text-xs text-ivory focus:outline-none focus:border-gold"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-ivory block mb-1">Bio / Philosophical Motto</label>
                <input
                  type="text"
                  placeholder="Builder of permanent things..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0907] border border-bronze-subtle text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs text-ivory block mb-1">Username or Email</label>
                <div className="relative">
                  <UserIcon size={14} className="absolute left-3 top-2.5 text-muted-bronze" />
                  <input
                    type="text"
                    placeholder="imhotep or imhotep@djed.network"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0c0907] border border-bronze-subtle text-xs text-ivory focus:outline-none focus:border-gold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-ivory block mb-1">Password</label>
                <div className="relative">
                  <KeyRound size={14} className="absolute left-3 top-2.5 text-muted-bronze" />
                  <input
                    type="password"
                    placeholder="Enter your secret key"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0c0907] border border-bronze-subtle text-xs text-ivory focus:outline-none focus:border-gold"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg btn-primary-bronze text-xs font-bold uppercase tracking-wider cursor-pointer mt-4"
          >
            {loading ? 'Communing...' : isRegister ? 'Forge Inscription' : 'Enter Sanctuary'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-bronze-subtle/50 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-gold hover:underline cursor-pointer"
          >
            {isRegister
              ? 'Already sealed? Enter here'
              : 'Need a sovereign seal? Forge one here'}
          </button>
        </div>
      </div>
    </div>
  );
}
