import React, { useState } from 'react';
import { Users, Plus, Shield, MessageSquare, ArrowRight } from 'lucide-react';
import type { Community, User } from '../types/index.js';

interface CommunitiesViewProps {
  communities: Community[];
  currentUser: User | null;
  onSelectCommunity: (communityId: string) => void;
  onRefreshCommunities: () => void;
}

export function CommunitiesView({
  communities,
  currentUser,
  onSelectCommunity,
  onRefreshCommunities,
}: CommunitiesViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || creating) return;

    setCreating(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          isPrivate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to establish guild');
      }

      setName('');
      setDescription('');
      setShowCreateModal(false);
      onRefreshCommunities();
    } catch (err: any) {
      setError(err.message || 'Error creating guild');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-bronze-subtle">
        <div>
          <h1 className="font-cinzel text-xl md:text-2xl font-bold text-gold">
            Guilds & Civilizational Pillars
          </h1>
          <p className="text-xs md:text-sm text-muted-bronze mt-1">
            Dedicated assemblies for architecture, metallurgy, philosophy, and permanent sciences.
          </p>
        </div>

        {currentUser && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="py-2 px-3.5 rounded-lg btn-primary-bronze text-xs md:text-sm flex items-center gap-2 cursor-pointer shadow"
          >
            <Plus size={16} />
            <span>Charter Guild</span>
          </button>
        )}
      </div>

      {/* Grid of Communities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {communities.map((comm) => (
          <div
            key={comm.id}
            className="p-5 rounded-xl bg-[#15100D] border border-bronze-subtle hover:border-gold/50 transition-all flex flex-col justify-between group shadow-md"
          >
            <div>
              <div className="flex items-start gap-3.5 mb-3">
                <img
                  src={comm.avatarUrl}
                  alt={comm.name}
                  className="w-14 h-14 rounded-xl object-cover border border-[#C58B42] shrink-0"
                />
                <div>
                  <h3 className="font-cinzel text-base font-bold text-ivory group-hover:text-gold transition-colors leading-snug">
                    {comm.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-bronze mt-1">
                    <span className="flex items-center gap-1">
                      <Users size={12} className="text-gold" />
                      {comm.membersCount} members
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={12} />
                      {comm.postsCount} inscriptions
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#d6c7b2] leading-relaxed mb-4 line-clamp-3">
                {comm.description}
              </p>
            </div>

            <div className="pt-3 border-t border-bronze-subtle/40 flex items-center justify-between">
              <span className="text-[11px] text-muted-bronze flex items-center gap-1">
                <Shield size={12} className="text-gold" />
                {comm.isPrivate ? 'Protected Archive' : 'Public Guild'}
              </span>

              <button
                onClick={() => onSelectCommunity(comm.id)}
                className="px-3 py-1.5 rounded-lg btn-secondary-bronze text-xs flex items-center gap-1.5 cursor-pointer group-hover:text-gold"
              >
                <span>Enter Chamber</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Charter Guild Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-xl bg-[#201711] border border-bronze-subtle p-5 shadow-2xl">
            <h3 className="font-cinzel text-base font-bold text-gold mb-2">Charter a New Guild</h3>
            <p className="text-xs text-muted-bronze mb-4">
              Create an enduring sanctuary for disciplined discourse and collective inquiry.
            </p>

            {error && (
              <div className="mb-3 p-2 rounded bg-[#2B1717] border border-[#E47770]/40 text-xs text-[#E47770]">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs text-ivory block mb-1">Guild Name</label>
                <input
                  type="text"
                  placeholder="e.g. Heliopolis Astronomers"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#15100D] border border-bronze-subtle text-xs text-ivory focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-ivory block mb-1">Purpose & Charter</label>
                <textarea
                  placeholder="Describe the discipline, foundational values, and inquiry of this guild..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded bg-[#15100D] border border-bronze-subtle text-xs text-ivory focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="privateCheck"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded border-bronze-subtle"
                />
                <label htmlFor="privateCheck" className="text-xs text-muted-bronze cursor-pointer">
                  Require admission review (Private Guild)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded text-xs btn-secondary-bronze cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 rounded text-xs btn-primary-bronze cursor-pointer"
                >
                  {creating ? 'Chartering...' : 'Charter Guild'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
