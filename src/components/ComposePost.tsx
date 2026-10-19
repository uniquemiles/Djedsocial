import { useState, useRef } from 'react';
import { Image, X, Feather, Hash } from 'lucide-react';
import type { User, Community, PostMedia } from '../types/index.js';

interface ComposePostProps {
  currentUser: User;
  communities: Community[];
  onCreated: () => void;
  defaultCommunityId?: string;
  isModal?: boolean;
  onClose?: () => void;
}

export function ComposePost({
  currentUser,
  communities,
  onCreated,
  defaultCommunityId,
  isModal,
  onClose,
}: ComposePostProps) {
  const [content, setContent] = useState('');
  const [selectedCommunityId, setSelectedCommunityId] = useState(defaultCommunityId || '');
  const [mediaList, setMediaList] = useState<PostMedia[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const curatedImages = [
    {
      url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
      caption: 'Bedrock masonry foundation',
    },
    {
      url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
      caption: 'Molten bronze casting',
    },
    {
      url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&auto=format&fit=crop&q=80',
      caption: 'Sacred geometric blueprints',
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Media size cannot exceed 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setMediaList([
        {
          id: `med_${Date.now()}`,
          url: result,
          mimeType: file.type,
          caption: file.name,
        },
      ]);
    };
    reader.readAsDataURL(file);
  };

  const handleAddCuratedMedia = (img: { url: string; caption: string }) => {
    setMediaList([
      {
        id: `med_${Date.now()}`,
        url: img.url,
        mimeType: 'image/jpeg',
        caption: img.caption,
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          communityId: selectedCommunityId || undefined,
          media: mediaList.length > 0 ? mediaList : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to inscribe post');
      }

      setContent('');
      setMediaList([]);
      onCreated();
      if (isModal && onClose) onClose();
    } catch (err: any) {
      setError(err.message || 'Error occurred while creating post');
    } finally {
      setSubmitting(false);
    }
  };

  const insertTag = (tag: string) => {
    setContent((prev) => (prev ? `${prev} #${tag} ` : `#${tag} `));
  };

  const contentComponent = (
    <div className="p-4 rounded-xl bg-[#15100D] border border-bronze-subtle shadow-md">
      {error && (
        <div className="mb-3 p-2.5 rounded bg-[#2B1717] border border-[#E47770]/40 text-xs text-[#E47770]">
          {error}
        </div>
      )}

      <div className="flex items-start gap-3">
        <img
          src={currentUser.avatarUrl}
          alt={currentUser.displayName}
          className="w-10 h-10 rounded-full object-cover border border-[#C58B42] shrink-0 mt-1"
        />

        <div className="flex-1">
          {/* Community Picker */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <label className="text-[11px] text-muted-bronze font-medium">Sphere of Influence:</label>
            <select
              value={selectedCommunityId}
              onChange={(e) => setSelectedCommunityId(e.target.value)}
              className="px-2.5 py-1 rounded bg-[#201711] border border-bronze-subtle text-xs text-gold focus:outline-none focus:border-gold cursor-pointer"
            >
              <option value="">Public Sanctuary (Global Feed)</option>
              {communities.map((c) => (
                <option key={c.id} value={c.id}>
                  Guild: {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Text Area */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Inscribe what shall endure, ${currentUser.displayName.split(' ')[0]}...`}
            rows={isModal ? 4 : 3}
            maxLength={2000}
            className="w-full bg-transparent resize-none text-sm text-ivory placeholder-muted-bronze/60 focus:outline-none leading-relaxed"
          />

          {/* Media Preview if attached */}
          {mediaList.length > 0 && (
            <div className="relative mt-2 rounded-lg overflow-hidden border border-bronze-subtle bg-[#080706] max-h-56">
              <img
                src={mediaList[0].url}
                alt="Upload preview"
                className="w-full h-auto max-h-56 object-cover"
              />
              <button
                onClick={() => setMediaList([])}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black cursor-pointer"
                title="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Hashtag Quick-Picks */}
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto py-1">
            <span className="text-[10px] text-muted-bronze flex items-center gap-0.5">
              <Hash size={10} /> Hieroglyphs:
            </span>
            {['Architecture', 'BronzeFoundry', 'AlexandriaLogic', 'Permanence'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => insertTag(tag)}
                className="text-[10px] text-gold/80 hover:text-gold px-1.5 py-0.5 rounded bg-[#201711] border border-bronze-subtle/50 cursor-pointer"
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-bronze-subtle/40">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded hover:bg-[#201711] text-muted-bronze hover:text-gold transition-colors cursor-pointer"
                title="Attach Media File"
              >
                <Image size={18} />
              </button>

              {/* Sample Artifacts Picker */}
              <div className="flex items-center gap-1 ml-1">
                <span className="text-[10px] text-muted-bronze hidden sm:inline">Artifacts:</span>
                {curatedImages.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddCuratedMedia(c)}
                    className="w-5 h-5 rounded overflow-hidden border border-bronze-subtle hover:border-gold transition-all cursor-pointer"
                    title={c.caption}
                  >
                    <img src={c.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-muted-bronze">
                {2000 - content.length}
              </span>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !content.trim()}
                className="py-1.5 px-4 rounded-lg btn-primary-bronze text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <Feather size={14} />
                <span>{submitting ? 'Inscribing...' : 'Inscribe'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-lg relative">
          <button
            onClick={onClose}
            className="absolute -top-10 right-0 p-1.5 rounded-full bg-[#201711] text-muted-bronze hover:text-white"
          >
            <X size={18} />
          </button>
          {contentComponent}
        </div>
      </div>
    );
  }

  return contentComponent;
}
