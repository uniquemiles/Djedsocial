import { Router } from 'express';
import { z } from 'zod';
import { db } from './db.js';
import {
  hashPassword,
  verifyPassword,
  setSessionCookie,
  clearSessionCookie,
  authenticate,
  optionalAuthenticate,
  requireRole,
  rateLimit,
  type AuthenticatedRequest,
} from './auth.js';
import { realtimeHub } from './websocket.js';
import type { ReactionType } from '../types/index.js';

export const apiRouter = Router();

// ==========================================
// 1. HEALTH CHECK
// ==========================================
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    platform: 'DJED Social Network',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    database: {
      provider: process.env.DATABASE_URL ? 'Neon PostgreSQL' : 'Embedded SQLite/JSON (Isolated Dev)',
      connected: true,
    },
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// ==========================================
// 2. AUTHENTICATION
// ==========================================

const RegisterSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be under 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username may only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(1, 'Display name is required').max(60),
  bio: z.string().max(280).optional(),
});

apiRouter.post('/auth/register', rateLimit(10, 60000), (req, res) => {
  const result = RegisterSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0]?.message || 'Validation failed' });
    return;
  }

  const { username, email, password, displayName, bio } = result.data;

  if (db.getUserByUsername(username)) {
    res.status(400).json({ error: 'Username is already taken' });
    return;
  }

  if (db.getUserByEmail(email)) {
    res.status(400).json({ error: 'Email is already registered' });
    return;
  }

  const passwordHash = hashPassword(password);
  const user = db.createUser({
    username,
    email,
    passwordHash,
    displayName,
    bio,
  });

  const session = db.createSession(user.id);
  setSessionCookie(res, session.token);

  res.status(201).json({
    user,
    token: session.token,
    message: 'Welcome to DJED. Your account has been forged.',
  });
});

const LoginSchema = z.object({
  login: z.string().min(1, 'Username or email required'),
  password: z.string().min(1, 'Password required'),
});

apiRouter.post('/auth/login', rateLimit(15, 60000), (req, res) => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0]?.message || 'Validation failed' });
    return;
  }

  const { login, password } = result.data;
  const userWithHash = login.includes('@') ? db.getUserByEmail(login) : db.getUserByUsername(login);

  if (!userWithHash || !verifyPassword(password, userWithHash.passwordHash)) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  const session = db.createSession(userWithHash.id);
  setSessionCookie(res, session.token);

  const { passwordHash: _, ...safeUser } = userWithHash;
  res.json({
    user: safeUser,
    token: session.token,
    message: 'Signed in successfully.',
  });
});

apiRouter.post('/auth/logout', authenticate, (req: AuthenticatedRequest, res) => {
  if (req.sessionId) {
    const token = req.cookies?.['djed_session'];
    if (token) db.deleteSession(token);
  }
  clearSessionCookie(res);
  res.json({ message: 'Signed out successfully' });
});

apiRouter.get('/auth/me', optionalAuthenticate, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.json({ user: null });
    return;
  }
  res.json({ user: req.user });
});

// Quick switch for interactive demonstration / testing of multi-user features
apiRouter.post('/auth/switch-account', (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    res.status(400).json({ error: 'userId required' });
    return;
  }
  const user = db.getUserById(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const session = db.createSession(user.id);
  setSessionCookie(res, session.token);

  res.json({
    user,
    token: session.token,
    message: `Switched active session to @${user.username}`,
  });
});

apiRouter.delete('/auth/account', authenticate, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  db.deleteUser(userId);
  clearSessionCookie(res);
  res.json({ message: 'Account and associated records successfully erased' });
});

// ==========================================
// 3. USERS & PROFILES
// ==========================================

apiRouter.get('/users/all', (_req, res) => {
  // Returns list of public users for discovery / account switcher
  const publicUsers = (db as any).state.users.map(({ passwordHash: _, ...u }: any) => u);
  res.json({ users: publicUsers });
});

apiRouter.get('/users/:username', optionalAuthenticate, (req: AuthenticatedRequest, res) => {
  const user = db.getUserByUsername(req.params.username);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const { passwordHash: _, ...safeUser } = user;
  const isFollowing = req.user ? db.isFollowing(req.user.id, safeUser.id) : false;

  res.json({
    user: safeUser,
    isFollowing,
  });
});

const ProfileUpdateSchema = z.object({
  displayName: z.string().min(1).max(60).optional(),
  bio: z.string().max(280).optional(),
  avatarUrl: z.string().url().optional(),
  coverUrl: z.string().url().optional(),
  website: z.string().max(255).optional(),
  isPrivate: z.boolean().optional(),
});

apiRouter.patch('/users/profile', authenticate, (req: AuthenticatedRequest, res) => {
  const result = ProfileUpdateSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0]?.message || 'Validation failed' });
    return;
  }

  const updated = db.updateUser(req.user!.id, result.data);
  res.json({ user: updated });
});

// ==========================================
// 4. POSTS & FEED
// ==========================================

apiRouter.get('/posts', optionalAuthenticate, (req: AuthenticatedRequest, res) => {
  const filter = (req.query.filter as 'all' | 'following' | 'community') || 'all';
  const communityId = req.query.communityId as string | undefined;
  const feed = db.getFeed(req.user?.id, filter, communityId);
  res.json({ posts: feed });
});

apiRouter.get('/posts/:id', optionalAuthenticate, (req: AuthenticatedRequest, res) => {
  const post = db.getPostById(req.params.id, req.user?.id);
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }
  res.json({ post });
});

const CreatePostSchema = z.object({
  content: z.string().min(1, 'Post content cannot be empty').max(2000),
  communityId: z.string().optional(),
  media: z
    .array(
      z.object({
        id: z.string(),
        url: z.string().url(),
        mimeType: z.string(),
        caption: z.string().optional(),
      })
    )
    .optional(),
  parentId: z.string().optional(),
  repostOfId: z.string().optional(),
});

apiRouter.post('/posts', authenticate, rateLimit(30, 60000), (req: AuthenticatedRequest, res) => {
  const result = CreatePostSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0]?.message || 'Validation failed' });
    return;
  }

  try {
    const post = db.createPost({
      authorId: req.user!.id,
      ...result.data,
    });
    res.status(201).json({ post });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Failed to create post' });
  }
});

apiRouter.delete('/posts/:id', authenticate, (req: AuthenticatedRequest, res) => {
  try {
    const isAdmin = req.user!.role === 'admin' || req.user!.role === 'moderator';
    const deleted = db.deletePost(req.params.id, req.user!.id, isAdmin);
    if (!deleted) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.json({ success: true, message: 'Post removed' });
  } catch (e: any) {
    res.status(403).json({ error: e.message || 'Unauthorized to delete post' });
  }
});

// Post Reactions (Like, Flame, Eye of Horus, Ankh, Djed)
apiRouter.post('/posts/:id/react', authenticate, (req: AuthenticatedRequest, res) => {
  const reactionType = (req.body.type || 'like') as ReactionType;
  const validTypes: ReactionType[] = ['like', 'flame', 'eye_of_horus', 'ankh', 'djed'];
  if (!validTypes.includes(reactionType)) {
    res.status(400).json({ error: 'Invalid reaction type' });
    return;
  }

  try {
    const post = db.togglePostReaction(req.params.id, req.user!.id, reactionType);
    res.json({ post });
  } catch (e: any) {
    res.status(404).json({ error: e.message || 'Failed to react to post' });
  }
});

// Post Comments
apiRouter.get('/posts/:id/comments', (_req, res) => {
  const comments = db.getComments(_req.params.id);
  res.json({ comments });
});

apiRouter.post('/posts/:id/comments', authenticate, rateLimit(30, 60000), (req: AuthenticatedRequest, res) => {
  const { content, parentId } = req.body;
  if (!content || typeof content !== 'string' || !content.trim()) {
    res.status(400).json({ error: 'Comment content cannot be empty' });
    return;
  }

  try {
    const comment = db.createComment({
      postId: req.params.id,
      authorId: req.user!.id,
      content: content.trim(),
      parentId,
    });
    res.status(201).json({ comment });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Failed to post comment' });
  }
});

// ==========================================
// 5. SOCIAL RELATIONSHIPS (Follow, Block)
// ==========================================

apiRouter.post('/users/:id/follow', authenticate, (req: AuthenticatedRequest, res) => {
  const success = db.followUser(req.user!.id, req.params.id);
  if (!success) {
    res.status(400).json({ error: 'Unable to follow account or already following' });
    return;
  }
  res.json({ success: true, message: 'Followed user' });
});

apiRouter.post('/users/:id/unfollow', authenticate, (req: AuthenticatedRequest, res) => {
  const success = db.unfollowUser(req.user!.id, req.params.id);
  res.json({ success, message: success ? 'Unfollowed user' : 'Not following' });
});

apiRouter.post('/users/:id/block', authenticate, (req: AuthenticatedRequest, res) => {
  const success = db.blockUser(req.user!.id, req.params.id);
  res.json({ success, message: 'User blocked' });
});

apiRouter.post('/users/:id/unblock', authenticate, (req: AuthenticatedRequest, res) => {
  const success = db.unblockUser(req.user!.id, req.params.id);
  res.json({ success, message: 'User unblocked' });
});

// ==========================================
// 6. MESSAGING & CONVERSATIONS
// ==========================================

apiRouter.get('/conversations', authenticate, (req: AuthenticatedRequest, res) => {
  const conversations = db.getConversations(req.user!.id);
  res.json({ conversations });
});

apiRouter.post('/conversations', authenticate, (req: AuthenticatedRequest, res) => {
  const { recipientId, isGroup, title, memberIds } = req.body;

  if (isGroup) {
    if (!title || !memberIds || !Array.isArray(memberIds)) {
      res.status(400).json({ error: 'Group title and members required' });
      return;
    }
    const conv = db.createGroupConversation(req.user!.id, title, memberIds);
    res.status(201).json({ conversation: conv });
    return;
  }

  if (!recipientId) {
    res.status(400).json({ error: 'Recipient ID required for 1-to-1 conversation' });
    return;
  }

  const conv = db.getOrCreateDirectConversation(req.user!.id, recipientId);
  res.json({ conversation: conv });
});

apiRouter.get('/conversations/:id/messages', authenticate, (req: AuthenticatedRequest, res) => {
  try {
    const messages = db.getMessages(req.params.id, req.user!.id);
    res.json({ messages });
  } catch {
    res.status(403).json({ error: 'Access denied to this conversation' });
  }
});

apiRouter.post('/conversations/:id/messages', authenticate, (req: AuthenticatedRequest, res) => {
  const { content, mediaUrl } = req.body;
  if (!content || !content.trim()) {
    res.status(400).json({ error: 'Message content cannot be empty' });
    return;
  }

  try {
    const message = db.sendMessage({
      conversationId: req.params.id,
      senderId: req.user!.id,
      content: content.trim(),
      mediaUrl,
    });

    // Broadcast in real-time to active WebSocket rooms
    realtimeHub.notifyNewMessage(req.params.id, message);

    res.status(201).json({ message });
  } catch (e: any) {
    res.status(403).json({ error: e.message || 'Failed to deliver message' });
  }
});

// ==========================================
// 7. NOTIFICATIONS
// ==========================================

apiRouter.get('/notifications', authenticate, (req: AuthenticatedRequest, res) => {
  const notifications = db.getNotifications(req.user!.id);
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  res.json({ notifications, unreadCount });
});

apiRouter.post('/notifications/:id/read', authenticate, (req: AuthenticatedRequest, res) => {
  db.markNotificationAsRead(req.params.id, req.user!.id);
  res.json({ success: true });
});

apiRouter.post('/notifications/read-all', authenticate, (req: AuthenticatedRequest, res) => {
  db.markAllNotificationsAsRead(req.user!.id);
  res.json({ success: true });
});

// ==========================================
// 8. COMMUNITIES
// ==========================================

apiRouter.get('/communities', (_req, res) => {
  const communities = db.getCommunities();
  res.json({ communities });
});

apiRouter.get('/communities/:slug', (_req, res) => {
  const community = db.getCommunityBySlug(_req.params.slug);
  if (!community) {
    res.status(404).json({ error: 'Community not found' });
    return;
  }
  res.json({ community });
});

apiRouter.post('/communities', authenticate, (req: AuthenticatedRequest, res) => {
  const { name, description, isPrivate, avatarUrl } = req.body;
  if (!name || !description) {
    res.status(400).json({ error: 'Community name and description required' });
    return;
  }

  const community = db.createCommunity({
    creatorId: req.user!.id,
    name,
    description,
    isPrivate,
    avatarUrl,
  });

  res.status(201).json({ community });
});

// ==========================================
// 9. SEARCH & DISCOVERY
// ==========================================

apiRouter.get('/search', optionalAuthenticate, (req: AuthenticatedRequest, res) => {
  const query = (req.query.q as string) || '';
  const results = db.search(query, req.user?.id);
  res.json(results);
});

// ==========================================
// 10. MEDIA UPLOADS
// ==========================================

apiRouter.post('/media/upload', authenticate, (req: AuthenticatedRequest, res) => {
  const { dataUrl, filename, mimeType } = req.body;

  if (!dataUrl || !mimeType) {
    res.status(400).json({ error: 'Data URL and MIME type required' });
    return;
  }

  // Security check: only allow safe image/video mime types
  const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4'];
  if (!allowedMime.includes(mimeType)) {
    res.status(400).json({ error: 'Disallowed media format. Accepted: JPG, PNG, WEBP, GIF, MP4' });
    return;
  }

  // Approximate size check (max 10MB)
  if (dataUrl.length > 14 * 1024 * 1024) {
    res.status(400).json({ error: 'File size exceeds maximum 10MB limit' });
    return;
  }

  // Return formatted upload descriptor
  res.status(201).json({
    media: {
      id: `med_${Math.random().toString(36).substring(2, 9)}`,
      url: dataUrl,
      mimeType,
      filename: filename || 'attachment',
      sizeBytes: Math.round(dataUrl.length * 0.75),
    },
  });
});

// ==========================================
// 11. REPORTS & MODERATION (RBAC)
// ==========================================

apiRouter.post('/reports', authenticate, (req: AuthenticatedRequest, res) => {
  const { targetType, targetId, reason, details } = req.body;
  if (!targetType || !targetId || !reason) {
    res.status(400).json({ error: 'Target and reason required' });
    return;
  }

  const report = db.createReport({
    reporterId: req.user!.id,
    targetType,
    targetId,
    reason,
    details,
  });

  res.status(201).json({ report, message: 'Report submitted for review.' });
});

apiRouter.get('/admin/reports', authenticate, requireRole(['admin', 'moderator']), (_req, res) => {
  const reports = db.getReports();
  res.json({ reports });
});

apiRouter.post(
  '/admin/reports/:id/status',
  authenticate,
  requireRole(['admin', 'moderator']),
  (req: AuthenticatedRequest, res) => {
    const { status } = req.body;
    if (status !== 'resolved' && status !== 'dismissed') {
      res.status(400).json({ error: 'Status must be resolved or dismissed' });
      return;
    }

    const updated = db.resolveReport(req.params.id, status, req.user!);
    if (!updated) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    res.json({ report: updated });
  }
);

apiRouter.get('/admin/audit-logs', authenticate, requireRole(['admin']), (_req, res) => {
  const logs = db.getAuditLogs();
  res.json({ auditLogs: logs });
});
