import {
  Home,
  Compass,
  MessageSquare,
  Bell,
  Users,
  User as UserIcon,
  ShieldAlert,
  Feather,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { DjedLogo } from './DjedLogo.js';
import type { User } from '../types/index.js';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User | null;
  unreadMessagesCount: number;
  unreadNotifsCount: number;
  onOpenCompose: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onSwitchAccountClick: () => void;
}

export function Navbar({
  currentTab,
  onSelectTab,
  currentUser,
  unreadMessagesCount,
  unreadNotifsCount,
  onOpenCompose,
  onOpenAuth,
  onLogout,
  onSwitchAccountClick,
}: NavbarProps) {
  const navItems = [
    { id: 'feed', label: 'Sanctuary Feed', icon: Home },
    { id: 'explore', label: 'Explore & Search', icon: Compass },
    {
      id: 'messages',
      label: 'Whispers (Chats)',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
    {
      id: 'notifications',
      label: 'Signals',
      icon: Bell,
      badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
    },
    { id: 'communities', label: 'Guilds & Pillars', icon: Users },
    { id: 'profile', label: 'My Inscription', icon: UserIcon },
  ];

  if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'moderator')) {
    navItems.push({
      id: 'admin',
      label: 'Hall of Ma’at (Admin)',
      icon: ShieldAlert,
    });
  }

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 h-screen sticky top-0 bg-[#0c0907] border-r border-bronze-subtle px-4 py-6 justify-between select-none z-30">
        <div className="flex flex-col gap-6">
          {/* Logo & Platform Name */}
          <button
            onClick={() => onSelectTab('feed')}
            className="flex items-center gap-3.5 px-2 py-1 text-left group transition-all"
          >
            <DjedLogo size={42} className="group-hover:djed-pillar-glow transition-all duration-300" />
            <div>
              <span className="font-cinzel text-2xl font-bold tracking-widest text-gold block leading-none">
                DJED
              </span>
              <span className="text-[11px] tracking-wider uppercase text-muted-bronze block mt-1 font-medium">
                Pillar of Permanence
              </span>
            </div>
          </button>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1.5 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#201711] text-gold border border-[rgba(197,139,66,0.35)] shadow-sm'
                      : 'text-[#d6c7b2] hover:bg-[#1a120d] hover:text-ivory'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon
                      size={20}
                      className={isActive ? 'text-gold stroke-[2.2]' : 'text-muted-bronze stroke-[1.8]'}
                    />
                    <span className="tracking-wide">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#8C542E] text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Create Post Action */}
          {currentUser ? (
            <button
              onClick={onOpenCompose}
              className="mt-2 w-full py-3 px-4 rounded-lg btn-primary-bronze flex items-center justify-center gap-2.5 font-medium tracking-wide text-sm cursor-pointer shadow-lg"
            >
              <Feather size={18} />
              <span>Inscribe Thought</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="mt-2 w-full py-3 px-4 rounded-lg btn-primary-bronze flex items-center justify-center gap-2 font-medium tracking-wide text-sm cursor-pointer"
            >
              <span>Enter Sanctuary</span>
            </button>
          )}
        </div>

        {/* User Card at bottom */}
        {currentUser ? (
          <div className="pt-4 border-t border-bronze-subtle">
            <div className="p-2.5 rounded-lg bg-[#15100D] border border-bronze-subtle flex items-center justify-between">
              <button
                onClick={() => onSelectTab('profile')}
                className="flex items-center gap-3 text-left overflow-hidden mr-2 cursor-pointer group"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.displayName}
                  className="w-10 h-10 rounded-full object-cover border border-[#C58B42] group-hover:scale-105 transition-transform"
                />
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-ivory truncate group-hover:text-gold transition-colors">
                      {currentUser.displayName}
                    </span>
                    {currentUser.isVerified && (
                      <span className="text-gold text-xs" title="Verified Pillar">
                        ✦
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-bronze block truncate">
                    @{currentUser.username}
                  </span>
                </div>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={onSwitchAccountClick}
                  title="Switch Persona / Test Account"
                  className="p-1.5 rounded hover:bg-[#201711] text-muted-bronze hover:text-gold cursor-pointer transition-colors"
                >
                  <ChevronDown size={16} />
                </button>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 rounded hover:bg-[#201711] text-muted-bronze hover:text-[#E47770] cursor-pointer transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-bronze-subtle text-center">
            <p className="text-xs text-muted-bronze mb-2">Preserving human intellect and connection.</p>
            <button
              onClick={onOpenAuth}
              className="text-xs text-gold hover:underline font-medium cursor-pointer"
            >
              Sign In / Create Account
            </button>
          </div>
        )}
      </aside>

      {/* ================= MOBILE TOP HEADER ================= */}
      <header className="md:hidden sticky top-0 z-40 bg-[#0c0907]/95 backdrop-blur-md border-b border-bronze-subtle px-4 py-2.5 flex items-center justify-between">
        <button
          onClick={() => onSelectTab('feed')}
          className="flex items-center gap-2.5"
        >
          <DjedLogo size={28} />
          <span className="font-cinzel text-lg font-bold tracking-widest text-gold">
            DJED
          </span>
        </button>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              <button
                onClick={onOpenCompose}
                className="p-2 rounded-full bg-[#8C542E] text-white shadow"
                aria-label="New Post"
              >
                <Feather size={16} />
              </button>
              <button
                onClick={() => onSelectTab('profile')}
                className="relative"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.displayName}
                  className="w-8 h-8 rounded-full border border-gold object-cover"
                />
              </button>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-xs font-semibold px-3 py-1.5 rounded bg-[#8C542E] text-white"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* ================= MOBILE BOTTOM NAVIGATION ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0907] border-t border-bronze-subtle px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => onSelectTab('feed')}
          className={`flex flex-col items-center p-2 ${
            currentTab === 'feed' ? 'text-gold' : 'text-muted-bronze'
          }`}
        >
          <Home size={20} />
          <span className="text-[10px] mt-1">Feed</span>
        </button>

        <button
          onClick={() => onSelectTab('explore')}
          className={`flex flex-col items-center p-2 ${
            currentTab === 'explore' ? 'text-gold' : 'text-muted-bronze'
          }`}
        >
          <Compass size={20} />
          <span className="text-[10px] mt-1">Explore</span>
        </button>

        <button
          onClick={() => onSelectTab('messages')}
          className={`relative flex flex-col items-center p-2 ${
            currentTab === 'messages' ? 'text-gold' : 'text-muted-bronze'
          }`}
        >
          <MessageSquare size={20} />
          <span className="text-[10px] mt-1">Whispers</span>
          {unreadMessagesCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#FFB52E]" />
          )}
        </button>

        <button
          onClick={() => onSelectTab('notifications')}
          className={`relative flex flex-col items-center p-2 ${
            currentTab === 'notifications' ? 'text-gold' : 'text-muted-bronze'
          }`}
        >
          <Bell size={20} />
          <span className="text-[10px] mt-1">Signals</span>
          {unreadNotifsCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#E47770]" />
          )}
        </button>

        <button
          onClick={() => onSelectTab('communities')}
          className={`flex flex-col items-center p-2 ${
            currentTab === 'communities' ? 'text-gold' : 'text-muted-bronze'
          }`}
        >
          <Users size={20} />
          <span className="text-[10px] mt-1">Guilds</span>
        </button>
      </nav>
    </>
  );
}
