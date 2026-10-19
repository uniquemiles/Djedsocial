import React, { useState } from 'react';
import {
  Calendar,
  Link as LinkIcon,
  Edit3,
  Trash2,
  Check,
  Sparkles,
} from 'lucide-react';
import type { User, Post, ReactionType } from '../types/index.js';
import { PostCard } from './PostCard.js';

interface ProfileViewProps {
  profileUser: User;
  currentUser: User | null;
  userPosts: Post[];
  isFollowing: boolean;
  onFollowToggle: () => void;
  onUpdateProfile: (updates: Partial<User>) => Promise<void>;
  onDeleteAccount: () => void;
  onReact: (postId: string, type: ReactionType) => void;
  onDeletePost: (postId: string) => void;
  onRepost: (postId: string) => void;
  onReport: (postId: string, reason: string) => void;
}

export function ProfileView({
  profileUser,
  currentUser,
  userPosts,
  isFollowing,
  onFollowToggle,
  onUpdateProfile,
  onDeleteAccount,
  onReact,
  onDeletePost,
  onRepost,
  onReport,
}: ProfileViewProps) {
  const isMe = currentUser?.id === profileUser.id;
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'about'>('posts');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Edit form state
  const [displayName, setDisplayName] = useState(profileUser.displayName);
  const [bio, setBio] = useState(profileUser.bio);
  const [website, setWebsite] = useState(profileUser.website || '');
  const [avatarUrl, setAvatarUrl] = useState(profileUser.avatarUrl);
  const [coverUrl, setCoverUrl] = useState(profileUser.coverUrl || '');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdateProfile({
        displayName,
        bio,
        website: website || undefined,
        avatarUrl,
        coverUrl: coverUrl || undefined,
      });
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setSaving(false);
    }
  };

  const mediaPosts = userPosts.filter((p) => p.media && p.media.length > 0);

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* Cover Banner */}
      <div className="relative h-44 sm:h-56 w-full bg-[#15100D] border-b border-bronze-subtle overflow-hidden">
        {profileUser.coverUrl ? (
          <img
            src={profileUser.coverUrl}
            alt="Profile cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#201711] via-[#2B2017] to-[#15100D]" />
        )}
      </div>

      {/* Profile Info Header */}
      <div className="px-4 md:px-6 relative">
        {/* Avatar & Action Button Bar */}
        <div className="flex items-end justify-between -mt-16 sm:-mt-20 mb-4">
          <div className="relative">
            <img
              src={profileUser.avatarUrl}
              alt={profileUser.displayName}
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-[#080706] shadow-2xl"
            />
            {profileUser.isVerified && (
              <div
                className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-[#8C542E] border-2 border-[#080706] flex items-center justify-center text-gold text-sm shadow"
                title="Verified Sovereign Pillar"
              >
                ✦
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-1">
            {isMe ? (
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 rounded-lg btn-secondary-bronze text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Edit3 size={14} />
                <span>Refine Seal</span>
              </button>
            ) : currentUser ? (
              <button
                onClick={onFollowToggle}
                className={`px-5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-sm ${
                  isFollowing ? 'btn-secondary-bronze text-gold' : 'btn-primary-bronze'
                }`}
              >
                {isFollowing ? (
                  <span className="flex items-center gap-1.5">
                    <Check size={14} /> Bonded
                  </span>
                ) : (
                  'Bond With Artisan'
                )}
              </button>
            ) : null}
          </div>
        </div>

        {/* User Details */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold font-cinzel text-ivory">
                {profileUser.displayName}
              </h1>
              {profileUser.role !== 'user' && (
                <span className="text-[11px] font-semibold tracking-wider uppercase text-gold px-2 py-0.5 rounded bg-[#201711] border border-bronze-subtle">
                  {profileUser.role}
                </span>
              )}
            </div>
            <span className="text-sm text-muted-bronze">@{profileUser.username}</span>
          </div>

          {profileUser.bio && (
            <p className="text-sm text-[#F3E8D7] leading-relaxed max-w-2xl">
              {profileUser.bio}
            </p>
          )}

          {/* Metadata: Website & Join Date */}
          <div className="flex items-center gap-4 text-xs text-muted-bronze flex-wrap pt-1">
            {profileUser.website && (
              <a
                href={profileUser.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-gold hover:underline"
              >
                <LinkIcon size={13} />
                <span>{profileUser.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}

            <div className="flex items-center gap-1">
              <Calendar size={13} />
              <span>
                Joined{' '}
                {new Date(profileUser.createdAt).toLocaleDateString(undefined, {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Social Stats */}
          <div className="flex items-center gap-5 text-sm pt-2">
            <div>
              <span className="font-bold text-ivory">{profileUser.followingCount}</span>{' '}
              <span className="text-muted-bronze">Bonded</span>
            </div>
            <div>
              <span className="font-bold text-ivory">{profileUser.followersCount}</span>{' '}
              <span className="text-muted-bronze">Companions</span>
            </div>
            <div>
              <span className="font-bold text-ivory">{userPosts.length}</span>{' '}
              <span className="text-muted-bronze">Inscriptions</span>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex items-center gap-6 mt-6 border-b border-bronze-subtle text-sm">
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-3 font-semibold transition-colors cursor-pointer ${
              activeTab === 'posts'
                ? 'text-gold border-b-2 border-gold'
                : 'text-muted-bronze hover:text-ivory'
            }`}
          >
            Inscriptions ({userPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`pb-3 font-semibold transition-colors cursor-pointer ${
              activeTab === 'media'
                ? 'text-gold border-b-2 border-gold'
                : 'text-muted-bronze hover:text-ivory'
            }`}
          >
            Artifacts ({mediaPosts.length})
          </button>
          {isMe && (
            <button
              onClick={() => setActiveTab('about')}
              className={`pb-3 font-semibold transition-colors cursor-pointer ${
                activeTab === 'about'
                  ? 'text-gold border-b-2 border-gold'
                  : 'text-muted-bronze hover:text-ivory'
              }`}
            >
              Sanctuary Settings
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="mt-6 space-y-4">
          {activeTab === 'posts' && (
            <>
              {userPosts.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted-bronze">
                  No inscriptions recorded under this seal yet.
                </div>
              ) : (
                userPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    onReact={onReact}
                    onDelete={onDeletePost}
                    onRepost={onRepost}
                    onReport={onReport}
                  />
                ))
              )}
            </>
          )}

          {activeTab === 'media' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {mediaPosts.length === 0 ? (
                <div className="col-span-full text-center py-12 text-xs text-muted-bronze">
                  No visual artifacts recorded.
                </div>
              ) : (
                mediaPosts.flatMap((post) =>
                  (post.media || []).map((med) => (
                    <div
                      key={med.id}
                      className="rounded-lg overflow-hidden border border-bronze-subtle aspect-square relative group bg-[#0c0907]"
                    >
                      <img
                        src={med.url}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {med.caption && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex items-end text-xs text-ivory">
                          {med.caption}
                        </div>
                      )}
                    </div>
                  ))
                )
              )}
            </div>
          )}

          {activeTab === 'about' && isMe && (
            <div className="p-5 rounded-xl bg-[#15100D] border border-bronze-subtle space-y-6">
              <div>
                <h3 className="font-cinzel text-base font-bold text-gold mb-1">
                  Privacy & Data Sovereignty
                </h3>
                <p className="text-xs text-muted-bronze leading-relaxed">
                  In accordance with the DJED engineering specification, your data is stored securely
                  and you retain the right to complete erasure and session revocation.
                </p>
              </div>

              <div className="pt-4 border-t border-bronze-subtle flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-ivory">Oblivion (Account Erasure)</h4>
                  <p className="text-xs text-muted-bronze">
                    Permanently delete your profile, sessions, and messages from the datastore.
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-3.5 py-2 rounded-lg bg-[#2B1717] border border-[#E47770]/50 text-[#E47770] text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-[#3D1A1A]"
                >
                  <Trash2 size={14} />
                  <span>Erase Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-xl bg-[#201711] border border-bronze-subtle p-5 shadow-2xl">
            <h3 className="font-cinzel text-base font-bold text-gold mb-3">Refine Sovereign Seal</h3>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-xs text-ivory block mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#15100D] border border-bronze-subtle text-xs text-ivory focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-ivory block mb-1">Bio / Inscribed Philosophy</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded bg-[#15100D] border border-bronze-subtle text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="text-xs text-ivory block mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#15100D] border border-bronze-subtle text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="text-xs text-ivory block mb-1">Cover Banner URL</label>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#15100D] border border-bronze-subtle text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="text-xs text-ivory block mb-1">External Codex / Website</label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#15100D] border border-bronze-subtle text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3.5 py-1.5 rounded text-xs btn-secondary-bronze cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded text-xs btn-primary-bronze cursor-pointer"
                >
                  {saving ? 'Engraving...' : 'Save Refinements'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm rounded-xl bg-[#201711] border border-[#E47770]/60 p-5 shadow-2xl">
            <h3 className="font-cinzel text-base font-bold text-[#E47770] mb-2">
              Confirm Account Erasure
            </h3>
            <p className="text-xs text-muted-bronze leading-relaxed mb-4">
              Are you certain? This action will permanently dissolve your identity, sessions, and all
              inscribed records in accordance with GDPR right to erasure.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-3 py-1.5 rounded text-xs btn-secondary-bronze cursor-pointer"
              >
                Retain
              </button>
              <button
                onClick={onDeleteAccount}
                className="px-4 py-1.5 rounded text-xs bg-[#E47770] text-black font-bold cursor-pointer"
              >
                Erase Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
