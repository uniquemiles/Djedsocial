import { Search, Flame, Users, Sparkles } from 'lucide-react';
import type { User } from '../types/index.js';

interface RightSidebarProps {
  allUsers: User[];
  currentUser: User | null;
  onFollowUser: (userId: string) => void;
  onSwitchUser: (userId: string) => void;
  onSearchClick: () => void;
  onSelectTag: (tag: string) => void;
}

export function RightSidebar({
  allUsers,
  currentUser,
  onFollowUser,
  onSwitchUser,
  onSearchClick,
  onSelectTag,
}: RightSidebarProps) {
  const suggestions = allUsers.filter((u) => u.id !== currentUser?.id).slice(0, 3);

  const trendingTopics = [
    { tag: 'MonumentalStatics', posts: '1.2k inscriptions', trend: '+42% this cycle' },
    { tag: 'BronzeFoundry', posts: '840 inscriptions', trend: '+18% this cycle' },
    { tag: 'AlexandriaLogic', posts: '620 inscriptions', trend: '+35% this cycle' },
    { tag: 'OsirisSpine', posts: '410 inscriptions', trend: '+12% this cycle' },
    { tag: 'CairoPillars', posts: '290 inscriptions', trend: '+8% this cycle' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-80 h-screen sticky top-0 px-4 py-6 gap-6 overflow-y-auto border-l border-bronze-subtle bg-[#0c0907] select-none">
      {/* Search Bar Button */}
      <button
        onClick={onSearchClick}
        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-[#15100D] border border-bronze-subtle text-muted-bronze hover:border-gold hover:text-ivory text-left text-sm cursor-pointer transition-all shadow-inner"
      >
        <Search size={16} className="text-muted-bronze" />
        <span className="truncate">Search inscriptions, artisans, guilds...</span>
      </button>

      {/* Interactive Persona / Test Switcher Banner */}
      <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#201711] to-[#15100D] border border-bronze-subtle shadow-md">
        <div className="flex items-center gap-2 mb-2 text-gold">
          <Sparkles size={16} />
          <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider">
            Active Persona Matrix
          </h3>
        </div>
        <p className="text-[11px] text-muted-bronze leading-relaxed mb-3">
          Experience DJED through different historical and architectural personas with unique roles.
        </p>

        <div className="grid grid-cols-2 gap-1.5">
          {allUsers.map((u) => {
            const isCurrent = currentUser?.id === u.id;
            return (
              <button
                key={u.id}
                onClick={() => onSwitchUser(u.id)}
                className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#8C542E]/40 border border-gold text-gold shadow-sm'
                    : 'bg-[#15100D] border border-bronze-subtle/50 text-[#d6c7b2] hover:border-bronze-subtle hover:text-white'
                }`}
              >
                <img
                  src={u.avatarUrl}
                  alt={u.displayName}
                  className="w-6 h-6 rounded-full object-cover border border-bronze-subtle"
                />
                <div className="truncate">
                  <span className="text-xs font-semibold block truncate leading-tight">
                    {u.displayName.split(' ')[0]}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-muted-bronze block">
                    {u.role}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="p-4 rounded-xl bg-[#15100D] border border-bronze-subtle">
        <div className="flex items-center gap-2 mb-3 text-gold">
          <Flame size={18} />
          <h3 className="font-cinzel text-sm font-bold tracking-wide">
            Edicts & Resonances
          </h3>
        </div>
        <div className="flex flex-col divide-y divide-bronze-subtle/40">
          {trendingTopics.map((item) => (
            <button
              key={item.tag}
              onClick={() => onSelectTag(item.tag)}
              className="py-2.5 text-left group hover:bg-[#201711]/50 px-1 rounded transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-[11px] text-muted-bronze">
                <span>Civilizational Trend</span>
                <span className="text-gold/80">{item.trend}</span>
              </div>
              <span className="text-sm font-semibold text-ivory group-hover:text-gold block mt-0.5">
                #{item.tag}
              </span>
              <span className="text-[11px] text-muted-bronze block mt-0.5">
                {item.posts}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Artisans to follow */}
      {suggestions.length > 0 && (
        <div className="p-4 rounded-xl bg-[#15100D] border border-bronze-subtle">
          <div className="flex items-center gap-2 mb-3 text-gold">
            <Users size={18} />
            <h3 className="font-cinzel text-sm font-bold tracking-wide">
              Guardians of the Craft
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            {suggestions.map((user) => (
              <div key={user.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="w-9 h-9 rounded-full object-cover border border-bronze-subtle shrink-0"
                  />
                  <div className="truncate">
                    <span className="text-xs font-semibold text-ivory block truncate">
                      {user.displayName}
                    </span>
                    <span className="text-[11px] text-muted-bronze block truncate">
                      @{user.username}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onFollowUser(user.id)}
                  className="px-3 py-1 rounded text-xs font-medium btn-secondary-bronze shrink-0 cursor-pointer"
                >
                  Bond
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-[11px] text-muted-bronze/70 leading-relaxed px-1">
        <p>DJED Social Platform © 2026. Built on stability, geometry, and permanent datastores.</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="hover:text-gold cursor-pointer">Constitution</span>
          <span>·</span>
          <span className="hover:text-gold cursor-pointer">Security</span>
          <span>·</span>
          <span className="hover:text-gold cursor-pointer">Ma’at Moderation</span>
        </div>
      </div>
    </aside>
  );
}
