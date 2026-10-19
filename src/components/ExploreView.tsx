import React, { useState, useEffect } from 'react';
import { Search, Flame, Users, FileText, ArrowRight } from 'lucide-react';
import type { User, Post, Community, ReactionType } from '../types/index.js';
import { PostCard } from './PostCard.js';

interface ExploreViewProps {
  currentUser: User | null;
  onSelectUser: (username: string) => void;
  onSelectCommunity: (communityId: string) => void;
  onReact: (postId: string, type: ReactionType) => void;
  onDeletePost: (postId: string) => void;
  onRepost: (postId: string) => void;
  onReport: (postId: string, reason: string) => void;
  initialQuery?: string;
}

export function ExploreView({
  currentUser,
  onSelectUser,
  onSelectCommunity,
  onReact,
  onDeletePost,
  onRepost,
  onReport,
  initialQuery = '',
}: ExploreViewProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<{
    users: User[];
    posts: Post[];
    communities: Community[];
  }>({ users: [], posts: [], communities: [] });
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'posts' | 'communities'>('all');

  const executeSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults({ users: [], posts: [], communities: [] });
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/v1/search?q=${encodeURIComponent(searchTerm.trim())}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      executeSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      {/* Search Header */}
      <div>
        <h1 className="font-cinzel text-xl md:text-2xl font-bold text-gold mb-2">
          The Great Library of Alexandria
        </h1>
        <p className="text-xs md:text-sm text-muted-bronze mb-4">
          Unearth artisans, guild archives, and inscribed wisdom across the ages.
        </p>

        <form onSubmit={handleSearchSubmit} className="relative">
          <Search size={18} className="absolute left-3.5 top-3 text-muted-bronze" />
          <input
            type="text"
            placeholder="Search hieroglyphs, artisans, #topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-24 py-2.5 rounded-xl bg-[#15100D] border border-bronze-subtle text-sm text-ivory placeholder-muted-bronze/60 focus:outline-none focus:border-gold"
          />
          <button
            type="submit"
            disabled={searching}
            className="absolute right-1.5 top-1.5 px-4 py-1.5 rounded-lg btn-primary-bronze text-xs font-semibold cursor-pointer"
          >
            {searching ? 'Seeking...' : 'Seek'}
          </button>
        </form>
      </div>

      {/* Suggested Curated Tags */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        <span className="text-xs text-muted-bronze flex items-center gap-1 shrink-0">
          <Flame size={14} className="text-gold" /> Resonant Edicts:
        </span>
        {['Architecture', 'BronzeFoundry', 'AlexandriaLogic', 'OsirisSpine', 'Permanence'].map(
          (tag) => (
            <button
              key={tag}
              onClick={() => {
                setQuery(tag);
                executeSearch(tag);
              }}
              className="text-xs px-2.5 py-1 rounded-md bg-[#201711] border border-bronze-subtle text-gold/90 hover:text-gold hover:border-gold cursor-pointer transition-colors shrink-0"
            >
              #{tag}
            </button>
          )
        )}
      </div>

      {/* Filter Tabs if query is active */}
      {query && (
        <div className="flex items-center gap-4 border-b border-bronze-subtle text-xs font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-2.5 cursor-pointer ${
              activeTab === 'all' ? 'text-gold border-b-2 border-gold' : 'text-muted-bronze'
            }`}
          >
            All Results
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-2.5 cursor-pointer ${
              activeTab === 'users' ? 'text-gold border-b-2 border-gold' : 'text-muted-bronze'
            }`}
          >
            Artisans ({results.users.length})
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-2.5 cursor-pointer ${
              activeTab === 'posts' ? 'text-gold border-b-2 border-gold' : 'text-muted-bronze'
            }`}
          >
            Inscriptions ({results.posts.length})
          </button>
          <button
            onClick={() => setActiveTab('communities')}
            className={`pb-2.5 cursor-pointer ${
              activeTab === 'communities' ? 'text-gold border-b-2 border-gold' : 'text-muted-bronze'
            }`}
          >
            Guilds ({results.communities.length})
          </button>
        </div>
      )}

      {/* Results Content */}
      <div className="space-y-6">
        {/* Users Section */}
        {(activeTab === 'all' || activeTab === 'users') && results.users.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
              <Users size={14} /> Artisans & Thinkers
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results.users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => onSelectUser(user.username)}
                  className="p-3.5 rounded-xl bg-[#15100D] border border-bronze-subtle hover:border-gold/50 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-[#C58B42] shrink-0"
                    />
                    <div className="truncate">
                      <span className="text-xs font-bold text-ivory block truncate">
                        {user.displayName}
                      </span>
                      <span className="text-[11px] text-muted-bronze block truncate">
                        @{user.username}
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-muted-bronze" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Communities Section */}
        {(activeTab === 'all' || activeTab === 'communities') && results.communities.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
              <Users size={14} /> Guilds
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {results.communities.map((comm) => (
                <div
                  key={comm.id}
                  onClick={() => onSelectCommunity(comm.id)}
                  className="p-3.5 rounded-xl bg-[#15100D] border border-bronze-subtle hover:border-gold/50 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={comm.avatarUrl}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover border border-[#C58B42]"
                    />
                    <div>
                      <span className="text-xs font-bold text-ivory block">{comm.name}</span>
                      <span className="text-[11px] text-muted-bronze block">
                        {comm.membersCount} members · {comm.description.slice(0, 70)}...
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-muted-bronze" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts Section */}
        {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
              <FileText size={14} /> Inscriptions
            </h3>
            <div className="space-y-4">
              {results.posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onReact={onReact}
                  onDelete={onDeletePost}
                  onRepost={onRepost}
                  onReport={onReport}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {query &&
          !searching &&
          results.users.length === 0 &&
          results.posts.length === 0 &&
          results.communities.length === 0 && (
            <div className="text-center py-12 text-xs text-muted-bronze">
              No matching wisdom or artisans found for "{query}". Try another hieroglyph or inquiry.
            </div>
          )}
      </div>
    </div>
  );
}
