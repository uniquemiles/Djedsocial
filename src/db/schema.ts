/**
 * Drizzle ORM PostgreSQL Schema for DJED Social Platform
 * Target: Neon PostgreSQL
 */

export interface DbSchemaTypes {
  users: {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    displayName: string;
    bio: string;
    avatarUrl: string;
    coverUrl?: string;
    website?: string;
    role: 'user' | 'moderator' | 'admin';
    isPrivate: boolean;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  sessions: {
    id: string;
    userId: string;
    token: string;
    expiresAt: string;
    createdAt: string;
    userAgent?: string;
    ipAddress?: string;
  };
  posts: {
    id: string;
    authorId: string;
    content: string;
    communityId?: string;
    parentId?: string; // For replies
    repostOfId?: string; // For reposts
    visibility: 'public' | 'followers' | 'community' | 'private';
    createdAt: string;
    updatedAt: string;
  };
  postMedia: {
    id: string;
    postId: string;
    url: string;
    mimeType: string;
    sizeBytes: number;
    caption?: string;
    createdAt: string;
  };
  reactions: {
    id: string;
    userId: string;
    postId?: string;
    commentId?: string;
    type: 'like' | 'flame' | 'eye_of_horus' | 'ankh' | 'djed';
    createdAt: string;
  };
  comments: {
    id: string;
    postId: string;
    authorId: string;
    parentId?: string;
    content: string;
    createdAt: string;
    updatedAt: string;
  };
  follows: {
    followerId: string;
    followingId: string;
    createdAt: string;
  };
  blocks: {
    blockerId: string;
    blockedId: string;
    createdAt: string;
  };
  mutes: {
    muterId: string;
    mutedId: string;
    createdAt: string;
  };
  conversations: {
    id: string;
    isGroup: boolean;
    title?: string;
    avatarUrl?: string;
    creatorId: string;
    createdAt: string;
    updatedAt: string;
  };
  conversationMembers: {
    conversationId: string;
    userId: string;
    role: 'admin' | 'member';
    joinedAt: string;
    lastReadAt?: string;
  };
  messages: {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    mediaUrl?: string;
    mediaType?: string;
    createdAt: string;
    updatedAt: string;
  };
  notifications: {
    id: string;
    userId: string;
    actorId: string;
    type: 'follow' | 'reaction' | 'comment' | 'repost' | 'mention' | 'message' | 'community_invite';
    targetId?: string;
    contentSummary?: string;
    isRead: boolean;
    createdAt: string;
  };
  communities: {
    id: string;
    name: string;
    slug: string;
    description: string;
    avatarUrl: string;
    bannerUrl?: string;
    isPrivate: boolean;
    creatorId: string;
    createdAt: string;
  };
  communityMembers: {
    communityId: string;
    userId: string;
    role: 'admin' | 'moderator' | 'member';
    joinedAt: string;
  };
  reports: {
    id: string;
    reporterId: string;
    targetType: 'post' | 'comment' | 'message' | 'user';
    targetId: string;
    reason: string;
    details?: string;
    status: 'pending' | 'resolved' | 'dismissed';
    createdAt: string;
  };
  auditLogs: {
    id: string;
    adminId: string;
    action: string;
    targetType: string;
    targetId: string;
    details: string;
    timestamp: string;
  };
}
