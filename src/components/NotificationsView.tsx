import { Bell, Heart, MessageCircle, UserPlus, Repeat, CheckCheck, Sparkles } from 'lucide-react';
import type { Notification } from '../types/index.js';
import { DjedLogo } from './DjedLogo.js';

interface NotificationsViewProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onSelectNotificationTarget: (type: Notification['type'], targetId?: string) => void;
}

export function NotificationsView({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onSelectNotificationTarget,
}: NotificationsViewProps) {
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reaction':
        return <Heart size={14} className="text-[#E47770]" />;
      case 'comment':
        return <MessageCircle size={14} className="text-gold" />;
      case 'follow':
        return <UserPlus size={14} className="text-[#69B88A]" />;
      case 'repost':
        return <Repeat size={14} className="text-[#B77A49]" />;
      case 'message':
        return <Sparkles size={14} className="text-gold" />;
      default:
        return <DjedLogo size={14} />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-bronze-subtle">
        <div>
          <h1 className="font-cinzel text-xl font-bold text-gold flex items-center gap-2">
            <Bell size={20} />
            <span>Signals from the Sanctuary</span>
          </h1>
          <p className="text-xs text-muted-bronze mt-0.5">
            Real-time echoes and bonds from fellow artisans.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-secondary-bronze text-xs cursor-pointer hover:text-gold"
          >
            <CheckCheck size={14} />
            <span>Mark All Acknowledged</span>
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-16 text-muted-bronze">
            <DjedLogo size={36} className="mx-auto mb-3 opacity-40" />
            <h3 className="font-cinzel text-sm font-semibold text-gold mb-1">Silence in the Hall</h3>
            <p className="text-xs">No signals recorded yet. Engage in discourse to generate resonance.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                if (!notif.isRead) onMarkRead(notif.id);
                onSelectNotificationTarget(notif.type, notif.targetId);
              }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                notif.isRead
                  ? 'bg-[#15100D]/70 border-bronze-subtle/40 opacity-80'
                  : 'bg-[#201711] border-gold/40 shadow-sm'
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={notif.actor.avatarUrl}
                  alt={notif.actor.displayName}
                  className="w-10 h-10 rounded-full object-cover border border-[#C58B42]"
                />
                <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#080706] border border-bronze-subtle">
                  {getIcon(notif.type)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-ivory">
                    {notif.actor.displayName}{' '}
                    <span className="text-muted-bronze font-normal">@{notif.actor.username}</span>
                  </span>
                  <span className="text-[10px] text-muted-bronze">
                    {new Date(notif.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <p className="text-xs text-[#F3E8D7] leading-relaxed">
                  {notif.contentSummary || `Interacted with your sanctuary.`}
                </p>
              </div>

              {!notif.isRead && (
                <div className="w-2 h-2 rounded-full bg-gold shrink-0 mt-2" title="Unread" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
