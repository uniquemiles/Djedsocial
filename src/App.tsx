import { useState, useEffect, useCallback, useRef } from 'react';
import type { User, Post, Community, Conversation, Notification, ReactionType } from './types/index.js';
import { Navbar } from './components/Navbar.js';
import { RightSidebar } from './components/RightSidebar.js';
import { PostCard } from './components/PostCard.js';
import { ComposePost } from './components/ComposePost.js';
import { MessagesView } from './components/MessagesView.js';
import { CommunitiesView } from './components/CommunitiesView.js';
import { ProfileView } from './components/ProfileView.js';
import { NotificationsView } from './components/NotificationsView.js';
import { ExploreView } from './components/ExploreView.js';
import { AdminView } from './components/AdminView.js';
import { AuthModal } from './components/AuthModal.js';
import { LandingPage } from './components/LandingPage.js';
import { DjedLogo } from './components/DjedLogo.js';
import { Sparkles, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentTab, setCurrentTab] = useState<string>('feed');
  const [feedFilter, setFeedFilter] = useState<'all' | 'following'>('all');
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | undefined>();
  const [viewingUsername, setViewingUsername] = useState<string | null>(null);

  // App Data
  const [posts, setPosts] = useState<Post[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showLanding, setShowLanding] = useState(false);
  const [exploreInitialQuery, setExploreInitialQuery] = useState('');

  // WebSocket
  const socketRef = useRef<WebSocket | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);

  // 1. Fetch Current User
  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/auth/me');
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        setShowLanding(false);
      } else {
        // If not logged in, fetch default users for preview
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch auth session', err);
    }
  }, []);

  // 2. Fetch Directory of Users
  const fetchAllUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/users/all');
      const data = await res.json();
      setAllUsers(data.users || []);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  }, []);

  // 3. Fetch Posts
  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      let url = `/api/v1/posts?filter=${feedFilter}`;
      if (selectedCommunityId) {
        url += `&communityId=${selectedCommunityId}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      setLoadingPosts(false);
    }
  }, [feedFilter, selectedCommunityId]);

  // 4. Fetch Communities
  const fetchCommunities = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/communities');
      const data = await res.json();
      setCommunities(data.communities || []);
    } catch (err) {
      console.error('Failed to fetch communities', err);
    }
  }, []);

  // 5. Fetch Conversations
  const fetchConversations = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/v1/conversations');
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  }, [currentUser]);

  // 6. Fetch Notifications
  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/v1/notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  }, [currentUser]);

  // Initialize Data
  useEffect(() => {
    fetchCurrentUser();
    fetchAllUsers();
    fetchCommunities();
  }, [fetchCurrentUser, fetchAllUsers, fetchCommunities]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (currentUser) {
      fetchConversations();
      fetchNotifications();
    }
  }, [currentUser, fetchConversations, fetchNotifications]);

  // Setup WebSocket connection
  useEffect(() => {
    if (!currentUser) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setSocketConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'new_notification') {
          setNotifications((prev) => [payload.notification, ...prev]);
        }
      } catch (e) {
        console.error('WS parse error', e);
      }
    };

    ws.onclose = () => {
      setSocketConnected(false);
    };

    socketRef.current = ws;

    return () => {
      ws.close();
    };
  }, [currentUser]);

  // Handlers
  const handleSwitchAccount = async (userId: string) => {
    try {
      const res = await fetch('/api/v1/auth/switch-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        setShowLanding(false);
        fetchPosts();
        fetchConversations();
        fetchNotifications();
      }
    } catch (err) {
      console.error('Failed to switch persona', err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      setConversations([]);
      setNotifications([]);
      fetchPosts();
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  const handleReact = async (postId: string, type: ReactionType) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    try {
      const res = await fetch(`/api/v1/posts/${postId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (data.post) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? data.post : p)));
      }
    } catch (err) {
      console.error('Failed to react', err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/v1/posts/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch (err) {
      console.error('Failed to delete post', err);
    }
  };

  const handleRepost = async (postId: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    try {
      const res = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'Resonating sacred thought into the sanctuary.',
          repostOfId: postId,
        }),
      });
      const data = await res.json();
      if (data.post) {
        fetchPosts();
      }
    } catch (err) {
      console.error('Repost error', err);
    }
  };

  const handleReport = async (postId: string, reason: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    try {
      await fetch('/api/v1/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'post',
          targetId: postId,
          reason,
        }),
      });
    } catch (err) {
      console.error('Report error', err);
    }
  };

  const handleFollowUser = async (userId: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    try {
      const res = await fetch(`/api/v1/users/${userId}/follow`, { method: 'POST' });
      if (res.ok) {
        fetchAllUsers();
      }
    } catch (err) {
      console.error('Follow error', err);
    }
  };

  const handleUpdateProfile = async (updates: Partial<User>) => {
    const res = await fetch('/api/v1/users/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (data.user) {
      setCurrentUser(data.user);
      fetchAllUsers();
      fetchPosts();
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await fetch('/api/v1/auth/account', { method: 'DELETE' });
      setCurrentUser(null);
      fetchAllUsers();
      fetchPosts();
    } catch (err) {
      console.error('Failed to delete account', err);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    await fetch(`/api/v1/notifications/${id}/read`, { method: 'POST' });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllNotificationsRead = async () => {
    await fetch('/api/v1/notifications/read-all', { method: 'POST' });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadMessagesCount = conversations.reduce(
    (acc, c) => acc + (c.unreadCount || 0),
    0
  );
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  // Active viewing profile user
  const activeProfileUser = viewingUsername
    ? allUsers.find((u) => u.username.toLowerCase() === viewingUsername.toLowerCase()) || currentUser
    : currentUser;

  // If user chooses to view landing page
  if (showLanding && !currentUser) {
    return (
      <LandingPage
        onEnter={() => {
          setShowLanding(false);
          setShowAuthModal(true);
        }}
        onExploreGuest={() => setShowLanding(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#080706] text-ivory flex justify-center selection:bg-[#C58B42] selection:text-black">
      <div className="w-full max-w-[1440px] flex flex-col md:flex-row">
        {/* ================= 1. LEFT NAVIGATION ================= */}
        <Navbar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setViewingUsername(null);
          }}
          currentUser={currentUser}
          unreadMessagesCount={unreadMessagesCount}
          unreadNotifsCount={unreadNotifsCount}
          onOpenCompose={() => setShowComposeModal(true)}
          onOpenAuth={() => setShowAuthModal(true)}
          onLogout={handleLogout}
          onSwitchAccountClick={() => setShowAuthModal(true)}
        />

        {/* ================= 2. MAIN CENTER CONTENT AREA ================= */}
        <main className="flex-1 min-w-0 border-r border-bronze-subtle min-h-screen pb-20 md:pb-8">
          {/* Top Bar for Feed View */}
          {currentTab === 'feed' && (
            <div className="sticky top-0 z-30 bg-[#0c0907]/90 backdrop-blur-md border-b border-bronze-subtle p-3.5 px-4 md:px-6 flex items-center justify-between">
              <div>
                <h2 className="font-cinzel text-base md:text-lg font-bold text-gold flex items-center gap-2">
                  <DjedLogo size={20} />
                  <span>
                    {selectedCommunityId
                      ? `Guild Chamber: ${
                          communities.find((c) => c.id === selectedCommunityId)?.name || 'Guild'
                        }`
                      : 'The Grand Sanctuary'}
                  </span>
                </h2>
                <span className="text-[11px] text-muted-bronze">
                  {selectedCommunityId ? (
                    <button
                      onClick={() => setSelectedCommunityId(undefined)}
                      className="text-gold hover:underline cursor-pointer"
                    >
                      ← Return to Global Sanctuary
                    </button>
                  ) : (
                    'Enduring inscriptions etched into the communal pillar'
                  )}
                </span>
              </div>

              {/* Feed Filters */}
              {!selectedCommunityId && (
                <div className="flex items-center gap-1 p-1 rounded-lg bg-[#15100D] border border-bronze-subtle">
                  <button
                    onClick={() => setFeedFilter('all')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                      feedFilter === 'all'
                        ? 'bg-[#8C542E] text-white shadow-sm'
                        : 'text-muted-bronze hover:text-ivory'
                    }`}
                  >
                    All Inscriptions
                  </button>
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        setShowAuthModal(true);
                      } else {
                        setFeedFilter('following');
                      }
                    }}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                      feedFilter === 'following'
                        ? 'bg-[#8C542E] text-white shadow-sm'
                        : 'text-muted-bronze hover:text-ivory'
                    }`}
                  >
                    Bonded Artisans
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 1: SANCTUARY FEED */}
          {currentTab === 'feed' && (
            <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
              {/* Compose box if logged in */}
              {currentUser ? (
                <ComposePost
                  currentUser={currentUser}
                  communities={communities}
                  onCreated={fetchPosts}
                  defaultCommunityId={selectedCommunityId}
                />
              ) : (
                <div className="p-4 rounded-xl bg-gradient-to-r from-[#201711] to-[#15100D] border border-bronze-subtle flex items-center justify-between gap-4 shadow-md">
                  <div>
                    <h3 className="font-cinzel text-sm font-bold text-gold">
                      The Sanctuary Welcomes You
                    </h3>
                    <p className="text-xs text-muted-bronze mt-0.5">
                      Sign in with an artisan persona to inscribe thoughts, react, and bond.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="px-4 py-2 rounded-lg btn-primary-bronze text-xs font-semibold cursor-pointer shrink-0"
                  >
                    Enter Sanctuary
                  </button>
                </div>
              )}

              {/* Inscriptions Feed */}
              <div className="space-y-4">
                {loadingPosts ? (
                  <div className="py-16 text-center text-xs text-muted-bronze flex flex-col items-center gap-2">
                    <RefreshCw size={20} className="animate-spin text-gold" />
                    <span>Translating sacred hieroglyphs...</span>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-bronze rounded-xl bg-[#15100D] border border-bronze-subtle">
                    No inscriptions found for this filter. Be the first to carve your mark.
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUser={currentUser}
                      onReact={handleReact}
                      onDelete={handleDeletePost}
                      onRepost={handleRepost}
                      onReport={handleReport}
                      onTagClick={(tag) => {
                        setExploreInitialQuery(tag);
                        setCurrentTab('explore');
                      }}
                      onUserClick={(username) => {
                        setViewingUsername(username);
                        setCurrentTab('profile');
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: EXPLORE & SEARCH */}
          {currentTab === 'explore' && (
            <ExploreView
              currentUser={currentUser}
              onSelectUser={(username) => {
                setViewingUsername(username);
                setCurrentTab('profile');
              }}
              onSelectCommunity={(commId) => {
                setSelectedCommunityId(commId);
                setCurrentTab('feed');
              }}
              onReact={handleReact}
              onDeletePost={handleDeletePost}
              onRepost={handleRepost}
              onReport={handleReport}
              initialQuery={exploreInitialQuery}
            />
          )}

          {/* TAB 3: WHISPERS (MESSAGING) */}
          {currentTab === 'messages' && (
            currentUser ? (
              <MessagesView
                currentUser={currentUser}
                allUsers={allUsers}
                conversations={conversations}
                onRefreshConversations={fetchConversations}
                socket={socketRef.current}
              />
            ) : (
              <div className="p-12 text-center text-muted-bronze max-w-md mx-auto mt-12">
                <DjedLogo size={48} className="mx-auto mb-3 text-gold" />
                <h3 className="font-cinzel text-base font-bold text-gold mb-2">
                  Direct & Council Chambers
                </h3>
                <p className="text-xs mb-4">
                  Sign in to participate in real-time encrypted whispers and group councils.
                </p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-2 rounded-lg btn-primary-bronze text-xs font-semibold cursor-pointer"
                >
                  Enter Sanctuary
                </button>
              </div>
            )
          )}

          {/* TAB 4: GUILDS & COMMUNITIES */}
          {currentTab === 'communities' && (
            <CommunitiesView
              communities={communities}
              currentUser={currentUser}
              onSelectCommunity={(commId) => {
                setSelectedCommunityId(commId);
                setCurrentTab('feed');
              }}
              onRefreshCommunities={fetchCommunities}
            />
          )}

          {/* TAB 5: SIGNALS (NOTIFICATIONS) */}
          {currentTab === 'notifications' && (
            currentUser ? (
              <NotificationsView
                notifications={notifications}
                onMarkRead={handleMarkNotificationRead}
                onMarkAllRead={handleMarkAllNotificationsRead}
                onSelectNotificationTarget={(type) => {
                  if (type === 'message') setCurrentTab('messages');
                  else setCurrentTab('feed');
                }}
              />
            ) : (
              <div className="p-12 text-center text-muted-bronze max-w-md mx-auto mt-12">
                <p className="text-xs">Sign in to observe your incoming signals and reactions.</p>
              </div>
            )
          )}

          {/* TAB 6: USER PROFILE */}
          {currentTab === 'profile' && (
            activeProfileUser ? (
              <ProfileView
                profileUser={activeProfileUser}
                currentUser={currentUser}
                userPosts={posts.filter((p) => p.authorId === activeProfileUser.id)}
                isFollowing={false}
                onFollowToggle={() => handleFollowUser(activeProfileUser.id)}
                onUpdateProfile={handleUpdateProfile}
                onDeleteAccount={handleDeleteAccount}
                onReact={handleReact}
                onDeletePost={handleDeletePost}
                onRepost={handleRepost}
                onReport={handleReport}
              />
            ) : (
              <div className="p-12 text-center text-xs text-muted-bronze">
                Sign in or select an artisan to view their sovereign seal.
              </div>
            )
          )}

          {/* TAB 7: ADMIN HALL OF MA'AT */}
          {currentTab === 'admin' && <AdminView />}
        </main>

        {/* ================= 3. RIGHT DISCOVERY SIDEBAR ================= */}
        <RightSidebar
          allUsers={allUsers}
          currentUser={currentUser}
          onFollowUser={handleFollowUser}
          onSwitchUser={handleSwitchAccount}
          onSearchClick={() => setCurrentTab('explore')}
          onSelectTag={(tag) => {
            setExploreInitialQuery(tag);
            setCurrentTab('explore');
          }}
        />
      </div>

      {/* ================= GLOBAL MODALS ================= */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setShowLanding(false);
          fetchPosts();
          fetchConversations();
          fetchNotifications();
        }}
        allUsers={allUsers}
        onSwitchUser={handleSwitchAccount}
      />

      {showComposeModal && currentUser && (
        <ComposePost
          currentUser={currentUser}
          communities={communities}
          onCreated={fetchPosts}
          defaultCommunityId={selectedCommunityId}
          isModal
          onClose={() => setShowComposeModal(false)}
        />
      )}
    </div>
  );
}
