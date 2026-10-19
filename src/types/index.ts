export type UserRole = 'user' | 'moderator' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  coverUrl?: string;
  website?: string;
  role: UserRole;
  isPrivate: boolean;
  isVerified?: boolean;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

export interface UserSession {
  user: User;
  sessionId: string;
}

export type ReactionType = 'like' | 'flame' | 'eye_of_horus' | 'ankh' | 'djed';

export interface PostMedia {
  id: string;
  url: string;
  mimeType: string;
  aspectRatio?: string;
  caption?: string;
}

export interface Post {
  id: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    role: UserRole;
    isVerified?: boolean;
  };
  content: string;
  media?: PostMedia[];
  communityId?: string;
  communityName?: string;
  parentId?: string; // Reply parent
  parentPost?: {
    id: string;
    content: string;
    author: {
      username: string;
      displayName: string;
    };
  };
  repostOfId?: string;
  repostPost?: Post;
  reactions: {
    [key in ReactionType]?: number;
  };
  userReaction?: ReactionType;
  repliesCount: number;
  repostsCount: number;
  isRepostedByMe?: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
  };
  content: string;
  parentId?: string;
  reactionsCount: number;
  userReacted?: boolean;
  createdAt: string;
}

export interface ConversationMember {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  role: 'admin' | 'member';
  joinedAt: string;
  lastReadAt?: string;
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  title?: string;
  avatarUrl?: string;
  members: ConversationMember[];
  lastMessage?: {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    createdAt: string;
  };
  unreadCount: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
  };
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  readBy: string[]; // array of userIds
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  actorId: string;
  actor: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
  };
  type: 'follow' | 'reaction' | 'comment' | 'repost' | 'mention' | 'message' | 'community_invite';
  targetId?: string; // Post id or conversation id
  contentSummary?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  avatarUrl: string;
  bannerUrl?: string;
  isPrivate: boolean;
  creatorId: string;
  membersCount: number;
  postsCount: number;
  isMember?: boolean;
  myRole?: 'admin' | 'moderator' | 'member';
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'post' | 'comment' | 'message' | 'user';
  targetId: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  details?: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminUsername: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}
