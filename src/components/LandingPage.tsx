import { MessageSquare, Feather, Users, ShieldCheck, Sparkles, ArrowRight, Check } from 'lucide-react';
import { DjedLogo } from './DjedLogo.js';

interface LandingPageProps {
  onEnter: () => void;
  onExploreGuest: () => void;
}

export function LandingPage({ onEnter, onExploreGuest }: LandingPageProps) {
  const pillars = [
    {
      icon: MessageSquare,
      title: 'Whispers & Chambers',
      subtitle: 'WhatsApp-Style Private & Group Messaging',
      desc: 'Sub-30ms WebSocket delivery, persistent PostgreSQL logs, encrypted sessions, and sovereign councils.',
    },
    {
      icon: Feather,
      title: 'Sacred Inscriptions',
      subtitle: 'Twitter/X-Style Public Discourse & Discovery',
      desc: 'Threaded hieroglyphic conversations, 5 ancient Egyptian reactions (Djed, Ankh, Eye of Horus, Flame, Favor), and search.',
    },
    {
      icon: Users,
      title: 'Guilds & Pillars',
      subtitle: 'Facebook-Style Communities & Profiles',
      desc: 'Architectural guilds, metallurgy workshops, mathematics academies, rich media artifacts, and verified sovereign seals.',
    },
    {
      icon: ShieldCheck,
      title: 'Hall of Ma’at',
      subtitle: 'Strict Security & Integrity Architecture',
      desc: 'Neon PostgreSQL with Drizzle migrations, Argon2/PBKDF2 hashing, zero IDOR, and transparent audit logs.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#080706] text-ivory flex flex-col justify-between selection:bg-[#C58B42] selection:text-black">
      {/* Top Navbar */}
      <header className="border-b border-bronze-subtle bg-[#0c0907]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <DjedLogo size={36} className="djed-pillar-glow" />
          <div>
            <span className="font-cinzel text-xl font-bold tracking-widest text-gold block leading-none">
              DJED
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-bronze font-medium">
              The Sovereign Social Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExploreGuest}
            className="px-4 py-2 rounded-lg btn-secondary-bronze text-xs font-semibold cursor-pointer"
          >
            Explore Sanctuary
          </button>
          <button
            onClick={onEnter}
            className="px-4 py-2 rounded-lg btn-primary-bronze text-xs font-semibold cursor-pointer shadow"
          >
            Enter / Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#201711] border border-gold/40 text-xs text-gold mb-6 shadow-sm">
          <Sparkles size={14} />
          <span>Inspired by Ancient Egyptian Stability & Permanence</span>
        </div>

        <h1 className="font-cinzel text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-ivory max-w-4xl leading-tight">
          A Social Platform Built to Outlast the Dynasties.
        </h1>

        <p className="mt-6 text-sm sm:text-base md:text-lg text-muted-bronze max-w-2xl leading-relaxed">
          DJED unifies real-time private messaging, high-fidelity public discovery, persistent
          guilds, and immutable cryptographic integrity into a single bronze-crafted digital sanctuary.
        </p>

        {/* CTA Button Group */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={onEnter}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl btn-primary-bronze text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer shadow-xl"
          >
            <span>Claim Your Seal</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={onExploreGuest}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl btn-secondary-bronze text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Browse Sanctuary Feed</span>
          </button>
        </div>

        {/* Features 4-Pillars Grid */}
        <section className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#15100D] border border-bronze-subtle hover:border-gold/50 transition-all shadow-md group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#201711] border border-[#C58B42] flex items-center justify-center text-gold mb-4 group-hover:scale-105 transition-transform">
                  <Icon size={22} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-antique-gold block mb-1">
                  {pillar.subtitle}
                </span>
                <h3 className="font-cinzel text-lg font-bold text-ivory mb-2">
                  {pillar.title}
                </h3>
                <p className="text-xs text-muted-bronze leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </section>

        {/* Architecture Guarantee Banner */}
        <div className="mt-16 w-full p-6 rounded-2xl bg-gradient-to-r from-[#201711] via-[#2B2017] to-[#15100D] border border-bronze-subtle text-left flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="font-cinzel text-base font-bold text-gold mb-1">
              Engineered with Absolute Integrity
            </h4>
            <div className="flex items-center gap-4 text-xs text-muted-bronze flex-wrap mt-2">
              <span className="flex items-center gap-1">
                <Check size={14} className="text-[#69B88A]" /> Neon PostgreSQL
              </span>
              <span className="flex items-center gap-1">
                <Check size={14} className="text-[#69B88A]" /> WebSocket Sub-20ms
              </span>
              <span className="flex items-center gap-1">
                <Check size={14} className="text-[#69B88A]" /> Argon2id / PBKDF2
              </span>
              <span className="flex items-center gap-1">
                <Check size={14} className="text-[#69B88A]" /> Render Isolated Envs
              </span>
            </div>
          </div>

          <button
            onClick={onEnter}
            className="px-6 py-2.5 rounded-lg btn-primary-bronze text-xs font-semibold shrink-0 cursor-pointer"
          >
            Enter Applet
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-bronze-subtle bg-[#0c0907] px-6 py-8 text-xs text-muted-bronze">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <DjedLogo size={20} />
            <span>DJED Social Platform © 2026. The Djed Pillar of Permanence.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hover:text-gold cursor-pointer">Security Whitepaper</span>
            <span>·</span>
            <span className="hover:text-gold cursor-pointer">Data Sovereignty</span>
            <span>·</span>
            <span className="hover:text-gold cursor-pointer">Render Deploy Specs</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
