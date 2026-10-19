import React, { useState } from 'react';
import {
  Heart,
  Flame,
  Eye,
  Repeat,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Trash2,
  Flag,
  Sparkles,
  Send,
} from 'lucide-react';
import type { Post, Comment, ReactionType, User } from '../types/index.js';
import { DjedLogo } from './DjedLogo.js';

interface PostCardProps {
  post: Post;
  currentUser: User | null;
  onReact: (postId: string, type: ReactionType) => void;
  onDelete: (postId: string) => void;
  onRepost: (postId: string) => void;
  onReport: (postId: string, reason: string) => void;
  onTagClick?: (tag: string) => void;
  onUserClick?: (username: string) => void;
}

export function PostCard({
  post,
  currentUser,
  onReact,
  onDelete,
  onRepost,
  onReport,
  onTagClick,
  onUserClick,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Abuse or harassment');
  const [copiedLink, setCopiedLink] = useState(false);

  const canDelete =
    currentUser && (currentUser.id === post.authorId || currentUser.role === 'admin' || currentUser.role === 'moderator');

  const toggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      try {
        const res = await fetch(`/api/v1/posts/${post.id}/comments`);
        const data = await res.json();
        setComments(data.comments || []);
      } catch (err) {
        console.error('Failed to load comments', err);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser || submittingComment) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/v1/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      const data = await res.json();
      if (data.comment) {
        setComments((prev) => [...prev, data.comment]);
        setNewComment('');
        post.repliesCount += 1;
      }
    } catch (err) {
      console.error('Failed to add comment', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}?post=${post.id}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Render text with clickable #hashtags
  const renderFormattedContent = (text: string) => {
    const parts = text.split(/(#[a-zA-Z0-9_]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        const cleanTag = part.slice(1);
        return (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              onTagClick?.(cleanTag);
            }}
            className="text-gold font-medium hover:underline inline-block cursor-pointer"
          >
            {part}
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const reactionConfigs: { type: ReactionType; label: string; icon: any; color: string }[] = [
    { type: 'like', label: 'Favor', icon: Heart, color: 'text-[#E47770]' },
    { type: 'flame', label: 'Sacred Flame', icon: Flame, color: 'text-[#E8B65B]' },
    { type: 'eye_of_horus', label: 'Eye of Horus', icon: Eye, color: 'text-[#69B88A]' },
    { type: 'ankh', label: 'Ankh (Life)', icon: Sparkles, color: 'text-[#B77A49]' },
    { type: 'djed', label: 'Djed Pillar', icon: DjedLogo, color: 'text-gold' },
  ];

  const totalReactions = Object.values(post.reactions).reduce((acc: number, val) => acc + (val || 0), 0);

  return (
    <article className="p-5 rounded-xl bg-[#15100D] border border-bronze-subtle hover:border-[rgba(197,139,66,0.35)] transition-all duration-200">
      {/* Repost Header if applicable */}
      {post.repostOfId && (
        <div className="flex items-center gap-2 text-xs text-muted-bronze mb-3 pb-2 border-b border-bronze-subtle/40">
          <Repeat size={14} className="text-gold" />
          <span>Resonated by @{post.author.username}</span>
        </div>
      )}

      {/* Author Bar */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onUserClick?.(post.author.username)}
            className="cursor-pointer group relative"
          >
            <img
              src={post.author.avatarUrl}
              alt={post.author.displayName}
              className="w-11 h-11 rounded-full object-cover border border-[#C58B42] group-hover:scale-105 transition-transform"
            />
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => onUserClick?.(post.author.username)}
                className="text-sm font-bold text-ivory hover:text-gold transition-colors cursor-pointer"
              >
                {post.author.displayName}
              </button>
              {post.author.isVerified && (
                <span className="text-gold text-xs font-bold" title="Verified Sovereign Pillar">
                  ✦
                </span>
              )}
              {post.author.role !== 'user' && (
                <span className="text-[10px] font-semibold tracking-wider uppercase text-antique-gold px-1.5 py-0.5 rounded bg-[#201711] border border-bronze-subtle">
                  {post.author.role}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-bronze mt-0.5">
              <span>@{post.author.username}</span>
              <span aria-hidden="true">·</span>
              <span>
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              {post.communityName && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-gold/90 hover:underline cursor-pointer">
                    {post.communityName}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg text-muted-bronze hover:text-ivory hover:bg-[#201711] cursor-pointer transition-colors"
            aria-label="Post actions"
          >
            <MoreHorizontal size={18} />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-44 rounded-lg bg-[#201711] border border-bronze-subtle shadow-xl py-1 z-20">
              {canDelete && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(post.id);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-[#E47770] hover:bg-[#2B2017] flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Erase Inscription</span>
                </button>
              )}
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowReportModal(true);
                }}
                className="w-full px-3 py-2 text-left text-xs text-[#d6c7b2] hover:bg-[#2B2017] flex items-center gap-2 cursor-pointer"
              >
                <Flag size={14} />
                <span>Report Inscription</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Post Body */}
      <div className="text-sm text-[#F3E8D7] leading-relaxed whitespace-pre-line mb-3 font-normal">
        {renderFormattedContent(post.content)}
      </div>

      {/* Attached Media */}
      {post.media && post.media.length > 0 && (
        <div className="mt-3 mb-3 rounded-lg overflow-hidden border border-bronze-subtle max-h-96 bg-[#080706]">
          {post.media.map((item) => (
            <div key={item.id} className="relative">
              <img
                src={item.url}
                alt={item.caption || 'Attached image'}
                className="w-full h-auto max-h-96 object-cover"
                loading="lazy"
              />
              {item.caption && (
                <div className="p-2 bg-[#15100D]/90 text-xs text-muted-bronze border-t border-bronze-subtle">
                  {item.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Parent post preview if this is a quote post */}
      {post.parentPost && (
        <div className="p-3 mb-3 rounded-lg bg-[#0c0907] border border-bronze-subtle text-xs">
          <div className="font-semibold text-gold mb-1">
            @{post.parentPost.author.username} ({post.parentPost.author.displayName})
          </div>
          <p className="text-muted-bronze line-clamp-2">{post.parentPost.content}</p>
        </div>
      )}

      {/* Interaction & Reaction Bar */}
      <div className="pt-3 border-t border-bronze-subtle/50 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-bronze select-none">
        {/* Egyptian Reactions Cluster */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {reactionConfigs.map((cfg) => {
            const count = post.reactions[cfg.type] || 0;
            const isSelected = post.userReaction === cfg.type;
            const Icon = cfg.icon;

            return (
              <button
                key={cfg.type}
                onClick={() => onReact(post.id, cfg.type)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#2B2017] text-gold border border-gold/60 shadow-sm'
                    : 'hover:bg-[#201711] hover:text-ivory'
                }`}
                title={cfg.label}
              >
                {cfg.type === 'djed' ? (
                  <DjedLogo size={14} />
                ) : (
                  <Icon size={14} className={isSelected ? cfg.color : ''} />
                )}
                <span>{count > 0 ? count : ''}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Actions: Comments, Repost, Share */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleComments}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[#201711] hover:text-ivory transition-colors cursor-pointer"
            title="Replies"
          >
            <MessageCircle size={15} />
            <span>{post.repliesCount}</span>
          </button>

          <button
            onClick={() => onRepost(post.id)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[#201711] transition-colors cursor-pointer ${
              post.isRepostedByMe ? 'text-gold' : 'hover:text-ivory'
            }`}
            title="Resonate / Repost"
          >
            <Repeat size={15} />
            <span>{post.repostsCount}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[#201711] hover:text-gold transition-colors cursor-pointer"
            title="Copy link"
          >
            <Share2 size={15} />
            {copiedLink && <span className="text-[10px] text-gold font-bold">Copied!</span>}
          </button>
        </div>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-bronze-subtle/60 flex flex-col gap-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-bronze">
            Council Inscriptions ({comments.length})
          </h4>

          {loadingComments ? (
            <div className="py-4 text-center text-xs text-muted-bronze">
              Reading hieroglyphs...
            </div>
          ) : comments.length === 0 ? (
            <div className="py-2 text-xs text-muted-bronze">
              No replies yet. Inscribe the first response below.
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
              {comments.map((cmt) => (
                <div key={cmt.id} className="p-2.5 rounded-lg bg-[#0c0907] border border-bronze-subtle/40">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-gold">@{cmt.author.username}</span>
                    <span className="text-[10px] text-muted-bronze">
                      {new Date(cmt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-ivory leading-relaxed">{cmt.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment Input */}
          {currentUser ? (
            <form onSubmit={handleAddComment} className="flex items-center gap-2 mt-2">
              <input
                type="text"
                placeholder="Inscribe a thoughtful response..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-[#080706] border border-bronze-subtle text-xs text-ivory placeholder-muted-bronze/60 focus:outline-none focus:border-gold"
              />
              <button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
                className="p-2 rounded-lg btn-primary-bronze text-white disabled:opacity-50 cursor-pointer"
              >
                <Send size={14} />
              </button>
            </form>
          ) : (
            <div className="text-xs text-muted-bronze text-center py-1">
              Sign in to participate in the council discussion.
            </div>
          )}
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm rounded-xl bg-[#201711] border border-bronze-subtle p-5 shadow-2xl">
            <h3 className="font-cinzel text-base font-bold text-gold mb-2">Report Inscription</h3>
            <p className="text-xs text-muted-bronze mb-4">
              Submit this content for review by the Hall of Ma’at (Moderators).
            </p>

            <label className="text-xs text-ivory block mb-1">Reason for report</label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full p-2 rounded bg-[#15100D] border border-bronze-subtle text-xs text-ivory mb-4 focus:outline-none focus:border-gold"
            >
              <option value="Abuse or harassment">Abuse or harassment</option>
              <option value="Spam or harmful link">Spam or harmful link</option>
              <option value="Impersonation">Impersonation</option>
              <option value="Violates community harmony">Violates community harmony</option>
            </select>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-3 py-1.5 rounded text-xs btn-secondary-bronze cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onReport(post.id, reportReason);
                  setShowReportModal(false);
                }}
                className="px-3 py-1.5 rounded text-xs btn-primary-bronze cursor-pointer"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
