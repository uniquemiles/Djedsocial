import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type {
  User,
  Post,
  Comment,
  ReactionType,
  Conversation,
  Message,
  Notification,
  Community,
  Report,
  AuditLog,
} from '../types/index.js';

interface StoredUser extends User {
  passwordHash: string;
}

interface StoredSession {
  id: string;
  token: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
}

interface StoredReaction {
  id: string;
  userId: string;
  postId?: string;
  commentId?: string;
  type: ReactionType;
  createdAt: string;
}

interface StoredFollow {
  followerId: string;
  followingId: string;
  createdAt: string;
}

interface StoredBlock {
  blockerId: string;
  blockedId: string;
  createdAt: string;
}

interface DatabaseState {
  users: StoredUser[];
  sessions: StoredSession[];
  posts: Post[];
  comments: Comment[];
  reactions: StoredReaction[];
  follows: StoredFollow[];
  blocks: StoredBlock[];
  conversations: Conversation[];
  messages: Message[];
  notifications: Notification[];
  communities: Community[];
  reports: Report[];
  auditLogs: AuditLog[];
}

const DATA_FILE_PATH = path.resolve(process.cwd(), '.djed_data.json');

class DatabaseRepository {
  private state: DatabaseState = {
    users: [],
    sessions: [],
    posts: [],
    comments: [],
    reactions: [],
    follows: [],
    blocks: [],
    conversations: [],
    messages: [],
    notifications: [],
    communities: [],
    reports: [],
    auditLogs: [],
  };

  constructor() {
    this.load();
    if (this.state.users.length === 0) {
      this.seed();
    }
  }

  private load(): void {
    try {
      if (fs.existsSync(DATA_FILE_PATH)) {
        const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
        this.state = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[DB] Could not load persisted data file, initializing fresh state', e);
    }
  }

  public save(): void {
    try {
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (e) {
      console.error('[DB] Failed to save state to disk', e);
    }
  }

  // --- Seed Data ---
  private seed(): void {
    // Default password for seeded accounts: "DjedPillar2026!"
    const salt = 'a1b2c3d4e5f60718';
    const hash = crypto.pbkdf2Sync('DjedPillar2026!', salt, 100000, 64, 'sha512').toString('hex');
    const defaultPasswordHash = `${salt}:${hash}`;

    const imhotep: StoredUser = {
      id: 'usr_imhotep_001',
      username: 'imhotep',
      email: 'imhotep@djed.network',
      passwordHash: defaultPasswordHash,
      displayName: 'Imhotep the Architect',
      bio: 'Master of stonework, early mathematics, and monumental architecture. Stability in form and mind.',
      avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&auto=format&fit=crop&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
      role: 'admin',
      isPrivate: false,
      isVerified: true,
      website: 'https://djed.network/imhotep',
      createdAt: '2026-01-01T00:00:00.000Z',
      followersCount: 1420,
      followingCount: 42,
      postsCount: 3,
    };

    const hypatia: StoredUser = {
      id: 'usr_hypatia_002',
      username: 'hypatia',
      email: 'hypatia@djed.network',
      passwordHash: defaultPasswordHash,
      displayName: 'Hypatia of Alexandria',
      bio: 'Mathematician, astronomer, neo-Platonist teacher. Seeking the geometric truths underpinning human society.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
      role: 'moderator',
      isPrivate: false,
      isVerified: true,
      website: 'https://djed.network/hypatia',
      createdAt: '2026-01-02T00:00:00.000Z',
      followersCount: 890,
      followingCount: 18,
      postsCount: 2,
    };

    const tariq: StoredUser = {
      id: 'usr_tariq_003',
      username: 'tariq_metals',
      email: 'tariq@djed.network',
      passwordHash: defaultPasswordHash,
      displayName: 'Tariq Al-Mansoor',
      bio: 'Bronze casting specialist & metallurgy historian. Exploring lost wax casting & high-tensile alloys.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
      role: 'user',
      isPrivate: false,
      isVerified: false,
      createdAt: '2026-01-10T00:00:00.000Z',
      followersCount: 340,
      followingCount: 65,
      postsCount: 2,
    };

    const amira: StoredUser = {
      id: 'usr_amira_004',
      username: 'amira_cairo',
      email: 'amira@djed.network',
      passwordHash: defaultPasswordHash,
      displayName: 'Amira Vance',
      bio: 'Distributed systems engineer in New Cairo. Building permanent infrastructure that outlasts the century.',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&auto=format&fit=crop&q=80',
      role: 'user',
      isPrivate: false,
      isVerified: true,
      createdAt: '2026-01-15T00:00:00.000Z',
      followersCount: 612,
      followingCount: 110,
      postsCount: 2,
    };

    this.state.users = [imhotep, hypatia, tariq, amira];

    // Communities
    const comm1: Community = {
      id: 'comm_arch_01',
      name: 'Monumental Architecture & Statics',
      slug: 'monumental-architecture',
      description: 'Discussing civilizational engineering, column math, stone foundations, and structures built to span millennia.',
      avatarUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=240&auto=format&fit=crop&q=80',
      isPrivate: false,
      creatorId: imhotep.id,
      membersCount: 4,
      postsCount: 2,
      createdAt: '2026-01-05T00:00:00.000Z',
    };

    const comm2: Community = {
      id: 'comm_bronze_02',
      name: 'Bronze Guild & Artisanry',
      slug: 'bronze-guild',
      description: 'The chemistry, patination, and artistic mastery of copper-tin bronzes from antiquity to present.',
      avatarUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=240&auto=format&fit=crop&q=80',
      isPrivate: false,
      creatorId: tariq.id,
      membersCount: 3,
      postsCount: 2,
      createdAt: '2026-01-08T00:00:00.000Z',
    };

    const comm3: Community = {
      id: 'comm_alexandria_03',
      name: 'Alexandria Mathematics & Logic',
      slug: 'alexandria-logic',
      description: 'Geometry, celestial navigation, and logical philosophy for modern digital builders.',
      avatarUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=240&auto=format&fit=crop&q=80',
      isPrivate: false,
      creatorId: hypatia.id,
      membersCount: 4,
      postsCount: 1,
      createdAt: '2026-01-12T00:00:00.000Z',
    };

    this.state.communities = [comm1, comm2, comm3];

    // Seed Posts
    const post1: Post = {
      id: 'post_001',
      authorId: imhotep.id,
      author: {
        id: imhotep.id,
        username: imhotep.username,
        displayName: imhotep.displayName,
        avatarUrl: imhotep.avatarUrl,
        role: imhotep.role,
        isVerified: imhotep.isVerified,
      },
      content: 'True stability is not rigidity; it is the deliberate distribution of load. The Djed pillar represents the spine of Osiris — vertical strength rooted deep into bedrock, capable of bearing weight through centuries of tempest and change.\n\nToday we inaugurate this digital platform upon those exact geometric principles.',
      media: [
        {
          id: 'media_001',
          url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
          mimeType: 'image/jpeg',
          caption: 'Foundation stones designed for eternal equilibrium.',
        },
      ],
      communityId: comm1.id,
      communityName: comm1.name,
      reactions: {
        djed: 48,
        flame: 22,
        ankh: 19,
        like: 64,
      },
      repliesCount: 3,
      repostsCount: 14,
      createdAt: '2026-02-01T10:30:00.000Z',
    };

    const post2: Post = {
      id: 'post_002',
      authorId: hypatia.id,
      author: {
        id: hypatia.id,
        username: hypatia.username,
        displayName: hypatia.displayName,
        avatarUrl: hypatia.avatarUrl,
        role: hypatia.role,
        isVerified: hypatia.isVerified,
      },
      content: 'Reserve your right to think, for even to think wrongly is better than not to think at all. In an era where information spreads at the speed of light, clarity of thought and mathematical rigor remain our rarest alloy. #Philosophy #Alexandria #Truth',
      reactions: {
        eye_of_horus: 36,
        djed: 28,
        like: 85,
      },
      repliesCount: 2,
      repostsCount: 9,
      createdAt: '2026-02-02T14:15:00.000Z',
    };

    const post3: Post = {
      id: 'post_003',
      authorId: tariq.id,
      author: {
        id: tariq.id,
        username: tariq.username,
        displayName: tariq.displayName,
        avatarUrl: tariq.avatarUrl,
        role: tariq.role,
      },
      content: 'Finished a ceremonial bronze pour this morning with 88% copper and 12% tin. The oxidation finish displays a deep, burnished patina under sunlight. Bronze does not rot like iron or crumble like stone; it holds form across thousands of years.',
      media: [
        {
          id: 'media_002',
          url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
          mimeType: 'image/jpeg',
          caption: 'Molten bronze casting and lustrous patination.',
        },
      ],
      communityId: comm2.id,
      communityName: comm2.name,
      reactions: {
        flame: 41,
        like: 52,
        djed: 15,
      },
      repliesCount: 1,
      repostsCount: 5,
      createdAt: '2026-02-03T09:45:00.000Z',
    };

    const post4: Post = {
      id: 'post_004',
      authorId: amira.id,
      author: {
        id: amira.id,
        username: amira.username,
        displayName: amira.displayName,
        avatarUrl: amira.avatarUrl,
        role: amira.role,
        isVerified: amira.isVerified,
      },
      content: 'Modern distributed architectures often chase ephemeral complexity. Real resilience comes from clear boundaries, predictable state machines, and reliable datastores. Building DJED with full PostgreSQL integrity and real-time sockets is like laying dry-stone joints: clean and durable.',
      reactions: {
        djed: 33,
        like: 44,
      },
      repliesCount: 1,
      repostsCount: 7,
      createdAt: '2026-02-04T16:20:00.000Z',
    };

    this.state.posts = [post4, post3, post2, post1];

    // Seed Comments
    const comment1: Comment = {
      id: 'comm_post1_01',
      postId: post1.id,
      authorId: hypatia.id,
      author: {
        id: hypatia.id,
        username: hypatia.username,
        displayName: hypatia.displayName,
        avatarUrl: hypatia.avatarUrl,
      },
      content: 'The vertical alignment of the pillar mirrors the celestial axis. Architecture is merely geometry solidified into stone.',
      reactionsCount: 12,
      createdAt: '2026-02-01T11:00:00.000Z',
    };

    const comment2: Comment = {
      id: 'comm_post1_02',
      postId: post1.id,
      authorId: amira.id,
      author: {
        id: amira.id,
        username: amira.username,
        displayName: amira.displayName,
        avatarUrl: amira.avatarUrl,
      },
      content: 'Agreed. The same applies to data integrity — foreign keys and strict schemas protect the architecture against human entropy.',
      reactionsCount: 8,
      createdAt: '2026-02-01T11:45:00.000Z',
    };

    this.state.comments = [comment1, comment2];

    // Seed Follows
    this.state.follows = [
      { followerId: hypatia.id, followingId: imhotep.id, createdAt: '2026-01-03T00:00:00.000Z' },
      { followerId: tariq.id, followingId: imhotep.id, createdAt: '2026-01-11T00:00:00.000Z' },
      { followerId: amira.id, followingId: imhotep.id, createdAt: '2026-01-16T00:00:00.000Z' },
      { followerId: amira.id, followingId: hypatia.id, createdAt: '2026-01-17T00:00:00.000Z' },
    ];

    // Seed 1-to-1 Conversation & Group Conversation
    const conv1Id = 'conv_group_council';
    const groupConv: Conversation = {
      id: conv1Id,
      isGroup: true,
      title: 'Djed Council of Builders',
      avatarUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=240&auto=format&fit=crop&q=80',
      members: [
        {
          userId: imhotep.id,
          username: imhotep.username,
          displayName: imhotep.displayName,
          avatarUrl: imhotep.avatarUrl,
          role: 'admin',
          joinedAt: '2026-01-01T00:00:00.000Z',
        },
        {
          userId: hypatia.id,
          username: hypatia.username,
          displayName: hypatia.displayName,
          avatarUrl: hypatia.avatarUrl,
          role: 'member',
          joinedAt: '2026-01-02T00:00:00.000Z',
        },
        {
          userId: amira.id,
          username: amira.username,
          displayName: amira.displayName,
          avatarUrl: amira.avatarUrl,
          role: 'member',
          joinedAt: '2026-01-15T00:00:00.000Z',
        },
      ],
      lastMessage: {
        id: 'msg_003',
        senderId: amira.id,
        senderName: amira.displayName,
        content: 'WebSocket latency is sub-20ms across test nodes. Ready for real-time chatter.',
        createdAt: '2026-02-04T17:00:00.000Z',
      },
      unreadCount: 0,
      updatedAt: '2026-02-04T17:00:00.000Z',
    };

    const conv2Id = 'conv_direct_imhotep_hypatia';
    const directConv: Conversation = {
      id: conv2Id,
      isGroup: false,
      members: [
        {
          userId: imhotep.id,
          username: imhotep.username,
          displayName: imhotep.displayName,
          avatarUrl: imhotep.avatarUrl,
          role: 'member',
          joinedAt: '2026-01-02T00:00:00.000Z',
        },
        {
          userId: hypatia.id,
          username: hypatia.username,
          displayName: hypatia.displayName,
          avatarUrl: hypatia.avatarUrl,
          role: 'member',
          joinedAt: '2026-01-02T00:00:00.000Z',
        },
      ],
      lastMessage: {
        id: 'msg_004',
        senderId: hypatia.id,
        senderName: hypatia.displayName,
        content: 'I have calculated the celestial angle for the southern equinox alignment.',
        createdAt: '2026-02-03T18:30:00.000Z',
      },
      unreadCount: 0,
      updatedAt: '2026-02-03T18:30:00.000Z',
    };

    this.state.conversations = [groupConv, directConv];

    this.state.messages = [
      {
        id: 'msg_001',
        conversationId: conv1Id,
        senderId: imhotep.id,
        sender: {
          id: imhotep.id,
          username: imhotep.username,
          displayName: imhotep.displayName,
          avatarUrl: imhotep.avatarUrl,
        },
        content: 'Welcome to the inner council. Let us coordinate the launch of the Djed network.',
        readBy: [imhotep.id, hypatia.id, amira.id],
        createdAt: '2026-02-04T16:30:00.000Z',
      },
      {
        id: 'msg_002',
        conversationId: conv1Id,
        senderId: hypatia.id,
        sender: {
          id: hypatia.id,
          username: hypatia.username,
          displayName: hypatia.displayName,
          avatarUrl: hypatia.avatarUrl,
        },
        content: 'The cryptographic hashes and proof-of-authenticity mechanisms look solid.',
        readBy: [imhotep.id, hypatia.id, amira.id],
        createdAt: '2026-02-04T16:45:00.000Z',
      },
      {
        id: 'msg_003',
        conversationId: conv1Id,
        senderId: amira.id,
        sender: {
          id: amira.id,
          username: amira.username,
          displayName: amira.displayName,
          avatarUrl: amira.avatarUrl,
        },
        content: 'WebSocket latency is sub-20ms across test nodes. Ready for real-time chatter.',
        readBy: [imhotep.id, hypatia.id, amira.id],
        createdAt: '2026-02-04T17:00:00.000Z',
      },
      {
        id: 'msg_004',
        conversationId: conv2Id,
        senderId: hypatia.id,
        sender: {
          id: hypatia.id,
          username: hypatia.username,
          displayName: hypatia.displayName,
          avatarUrl: hypatia.avatarUrl,
        },
        content: 'I have calculated the celestial angle for the southern equinox alignment.',
        readBy: [imhotep.id, hypatia.id],
        createdAt: '2026-02-03T18:30:00.000Z',
      },
    ];

    // Seed Notifications
    this.state.notifications = [
      {
        id: 'notif_001',
        userId: imhotep.id,
        actorId: hypatia.id,
        actor: {
          id: hypatia.id,
          username: hypatia.username,
          displayName: hypatia.displayName,
          avatarUrl: hypatia.avatarUrl,
        },
        type: 'reaction',
        targetId: post1.id,
        contentSummary: 'reacted with Ankh to your post',
        isRead: false,
        createdAt: '2026-02-01T11:05:00.000Z',
      },
      {
        id: 'notif_002',
        userId: imhotep.id,
        actorId: amira.id,
        actor: {
          id: amira.id,
          username: amira.username,
          displayName: amira.displayName,
          avatarUrl: amira.avatarUrl,
        },
        type: 'comment',
        targetId: post1.id,
        contentSummary: 'commented on your post: "Agreed. The same applies to data integrity..."',
        isRead: false,
        createdAt: '2026-02-01T11:45:00.000Z',
      },
    ];

    this.save();
  }

  // --- Users & Sessions ---

  public getUserById(id: string): User | null {
    const user = this.state.users.find((u) => u.id === id);
    if (!user) return null;
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  public getUserByUsername(username: string): (User & { passwordHash: string }) | null {
    const user = this.state.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    return user || null;
  }

  public getUserByEmail(email: string): (User & { passwordHash: string }) | null {
    const user = this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  public createUser(userData: {
    username: string;
    email: string;
    passwordHash: string;
    displayName: string;
    bio?: string;
    avatarUrl?: string;
  }): User {
    const newUser: StoredUser = {
      id: `usr_${crypto.randomUUID().slice(0, 8)}`,
      username: userData.username.trim(),
      email: userData.email.trim().toLowerCase(),
      passwordHash: userData.passwordHash,
      displayName: userData.displayName.trim(),
      bio: userData.bio?.trim() || '',
      avatarUrl:
        userData.avatarUrl ||
        `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(userData.username)}`,
      role: 'user',
      isPrivate: false,
      isVerified: false,
      createdAt: new Date().toISOString(),
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
    };

    this.state.users.push(newUser);
    this.save();
    const { passwordHash: _, ...safeUser } = newUser;
    return safeUser;
  }

  public updateUser(
    id: string,
    updates: Partial<Pick<User, 'displayName' | 'bio' | 'avatarUrl' | 'coverUrl' | 'website' | 'isPrivate'>>
  ): User | null {
    const userIndex = this.state.users.findIndex((u) => u.id === id);
    if (userIndex === -1) return null;

    this.state.users[userIndex] = {
      ...this.state.users[userIndex],
      ...updates,
    };

    // Update denormalized author data in posts
    const updatedUser = this.state.users[userIndex];
    for (const post of this.state.posts) {
      if (post.authorId === id) {
        post.author.displayName = updatedUser.displayName;
        post.author.avatarUrl = updatedUser.avatarUrl;
      }
    }

    this.save();
    const { passwordHash: _, ...safeUser } = updatedUser;
    return safeUser;
  }

  public deleteUser(id: string): boolean {
    const index = this.state.users.findIndex((u) => u.id === id);
    if (index === -1) return false;

    // Delete related sessions, posts, comments, follows
    this.state.users.splice(index, 1);
    this.state.sessions = this.state.sessions.filter((s) => s.userId !== id);
    this.state.posts = this.state.posts.filter((p) => p.authorId !== id);
    this.state.comments = this.state.comments.filter((c) => c.authorId !== id);
    this.state.follows = this.state.follows.filter((f) => f.followerId !== id && f.followingId !== id);
    this.state.notifications = this.state.notifications.filter((n) => n.userId !== id && n.actorId !== id);
    this.save();
    return true;
  }

  public createSession(userId: string): StoredSession {
    const session: StoredSession = {
      id: crypto.randomUUID(),
      token: crypto.randomBytes(32).toString('hex'),
      userId,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.state.sessions.push(session);
    this.save();
    return session;
  }

  public getSessionByToken(token: string): { user: User; id: string } | null {
    const session = this.state.sessions.find((s) => s.token === token);
    if (!session) return null;

    if (new Date(session.expiresAt) < new Date()) {
      this.deleteSession(token);
      return null;
    }

    const user = this.getUserById(session.userId);
    if (!user) return null;

    return { user, id: session.id };
  }

  public deleteSession(token: string): void {
    this.state.sessions = this.state.sessions.filter((s) => s.token !== token);
    this.save();
  }

  // --- Posts & Feed ---

  public getFeed(viewerId?: string, filter?: 'all' | 'following' | 'community', communityId?: string): Post[] {
    let posts = [...this.state.posts];

    // Filter blocked users
    if (viewerId) {
      const blockedUserIds = new Set([
        ...this.state.blocks.filter((b) => b.blockerId === viewerId).map((b) => b.blockedId),
        ...this.state.blocks.filter((b) => b.blockedId === viewerId).map((b) => b.blockerId),
      ]);
      posts = posts.filter((p) => !blockedUserIds.has(p.authorId));
    }

    if (communityId) {
      posts = posts.filter((p) => p.communityId === communityId);
    } else if (filter === 'following' && viewerId) {
      const followingIds = new Set(
        this.state.follows.filter((f) => f.followerId === viewerId).map((f) => f.followingId)
      );
      followingIds.add(viewerId); // include own posts
      posts = posts.filter((p) => followingIds.has(p.authorId));
    }

    // Attach user-specific reaction and repost states
    return posts.map((post) => {
      const userReaction = viewerId
        ? this.state.reactions.find((r) => r.postId === post.id && r.userId === viewerId)?.type
        : undefined;

      const isRepostedByMe = viewerId
        ? this.state.posts.some((p) => p.repostOfId === post.id && p.authorId === viewerId)
        : false;

      return {
        ...post,
        userReaction,
        isRepostedByMe,
      };
    });
  }

  public getPostById(id: string, viewerId?: string): Post | null {
    const post = this.state.posts.find((p) => p.id === id);
    if (!post) return null;

    const userReaction = viewerId
      ? this.state.reactions.find((r) => r.postId === post.id && r.userId === viewerId)?.type
      : undefined;

    return {
      ...post,
      userReaction,
    };
  }

  public createPost(data: {
    authorId: string;
    content: string;
    communityId?: string;
    media?: Post['media'];
    parentId?: string;
    repostOfId?: string;
  }): Post {
    const author = this.getUserById(data.authorId);
    if (!author) throw new Error('Author not found');

    let communityName: string | undefined;
    if (data.communityId) {
      const comm = this.state.communities.find((c) => c.id === data.communityId);
      if (comm) {
        communityName = comm.name;
        comm.postsCount += 1;
      }
    }

    let parentPost: Post['parentPost'] | undefined;
    if (data.parentId) {
      const parent = this.state.posts.find((p) => p.id === data.parentId);
      if (parent) {
        parent.repliesCount += 1;
        parentPost = {
          id: parent.id,
          content: parent.content,
          author: {
            username: parent.author.username,
            displayName: parent.author.displayName,
          },
        };

        // Notify parent author
        if (parent.authorId !== author.id) {
          this.createNotification({
            userId: parent.authorId,
            actorId: author.id,
            type: 'comment',
            targetId: parent.id,
            contentSummary: `replied: "${data.content.slice(0, 50)}..."`,
          });
        }
      }
    }

    let repostPost: Post | undefined;
    if (data.repostOfId) {
      const original = this.state.posts.find((p) => p.id === data.repostOfId);
      if (original) {
        original.repostsCount += 1;
        repostPost = original;

        if (original.authorId !== author.id) {
          this.createNotification({
            userId: original.authorId,
            actorId: author.id,
            type: 'repost',
            targetId: original.id,
            contentSummary: 'reposted your post',
          });
        }
      }
    }

    const newPost: Post = {
      id: `post_${crypto.randomUUID().slice(0, 8)}`,
      authorId: author.id,
      author: {
        id: author.id,
        username: author.username,
        displayName: author.displayName,
        avatarUrl: author.avatarUrl,
        role: author.role,
        isVerified: author.isVerified,
      },
      content: data.content,
      media: data.media,
      communityId: data.communityId,
      communityName,
      parentId: data.parentId,
      parentPost,
      repostOfId: data.repostOfId,
      repostPost,
      reactions: {},
      repliesCount: 0,
      repostsCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.state.posts.unshift(newPost);

    // Update user's post count
    const authorUser = this.state.users.find((u) => u.id === author.id);
    if (authorUser) {
      authorUser.postsCount += 1;
    }

    this.save();
    return newPost;
  }

  public deletePost(postId: string, userId: string, isAdmin = false): boolean {
    const index = this.state.posts.findIndex((p) => p.id === postId);
    if (index === -1) return false;

    const post = this.state.posts[index];
    if (post.authorId !== userId && !isAdmin) {
      throw new Error('Unauthorized');
    }

    this.state.posts.splice(index, 1);
    this.state.comments = this.state.comments.filter((c) => c.postId !== postId);
    this.state.reactions = this.state.reactions.filter((r) => r.postId !== postId);

    const author = this.state.users.find((u) => u.id === post.authorId);
    if (author && author.postsCount > 0) {
      author.postsCount -= 1;
    }

    this.save();
    return true;
  }

  // --- Reactions ---

  public togglePostReaction(postId: string, userId: string, type: ReactionType): Post {
    const post = this.state.posts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');

    const existingIndex = this.state.reactions.findIndex(
      (r) => r.postId === postId && r.userId === userId
    );

    if (existingIndex !== -1) {
      const existing = this.state.reactions[existingIndex];
      // Decrement existing reaction count
      const currentCount = post.reactions[existing.type] || 1;
      if (currentCount <= 1) {
        delete post.reactions[existing.type];
      } else {
        post.reactions[existing.type] = currentCount - 1;
      }

      if (existing.type === type) {
        // Toggle off
        this.state.reactions.splice(existingIndex, 1);
        this.save();
        return { ...post, userReaction: undefined };
      } else {
        // Switch reaction type
        this.state.reactions[existingIndex].type = type;
        post.reactions[type] = (post.reactions[type] || 0) + 1;
        this.save();
        return { ...post, userReaction: type };
      }
    }

    // Add new reaction
    this.state.reactions.push({
      id: crypto.randomUUID(),
      postId,
      userId,
      type,
      createdAt: new Date().toISOString(),
    });

    post.reactions[type] = (post.reactions[type] || 0) + 1;

    // Send notification if not reacting to own post
    if (post.authorId !== userId) {
      const actor = this.getUserById(userId);
      if (actor) {
        this.createNotification({
          userId: post.authorId,
          actorId: userId,
          type: 'reaction',
          targetId: post.id,
          contentSummary: `reacted with ${type.replace(/_/g, ' ')} to your post`,
        });
      }
    }

    this.save();
    return { ...post, userReaction: type };
  }

  // --- Comments ---

  public getComments(postId: string): Comment[] {
    return this.state.comments.filter((c) => c.postId === postId);
  }

  public createComment(data: { postId: string; authorId: string; content: string; parentId?: string }): Comment {
    const author = this.getUserById(data.authorId);
    if (!author) throw new Error('Author not found');

    const post = this.state.posts.find((p) => p.id === data.postId);
    if (!post) throw new Error('Post not found');

    const newComment: Comment = {
      id: `cmt_${crypto.randomUUID().slice(0, 8)}`,
      postId: data.postId,
      authorId: author.id,
      author: {
        id: author.id,
        username: author.username,
        displayName: author.displayName,
        avatarUrl: author.avatarUrl,
      },
      content: data.content,
      parentId: data.parentId,
      reactionsCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.state.comments.push(newComment);
    post.repliesCount += 1;

    if (post.authorId !== author.id) {
      this.createNotification({
        userId: post.authorId,
        actorId: author.id,
        type: 'comment',
        targetId: post.id,
        contentSummary: `commented: "${data.content.slice(0, 60)}"`,
      });
    }

    this.save();
    return newComment;
  }

  // --- Social Relationships: Follow, Block, Mute ---

  public isFollowing(followerId: string, followingId: string): boolean {
    return this.state.follows.some((f) => f.followerId === followerId && f.followingId === followingId);
  }

  public followUser(followerId: string, followingId: string): boolean {
    if (followerId === followingId) return false;
    if (this.isFollowing(followerId, followingId)) return false;

    this.state.follows.push({
      followerId,
      followingId,
      createdAt: new Date().toISOString(),
    });

    const follower = this.state.users.find((u) => u.id === followerId);
    const following = this.state.users.find((u) => u.id === followingId);

    if (follower) follower.followingCount += 1;
    if (following) {
      following.followersCount += 1;
      this.createNotification({
        userId: followingId,
        actorId: followerId,
        type: 'follow',
        targetId: followerId,
        contentSummary: 'started following you',
      });
    }

    this.save();
    return true;
  }

  public unfollowUser(followerId: string, followingId: string): boolean {
    const index = this.state.follows.findIndex(
      (f) => f.followerId === followerId && f.followingId === followingId
    );
    if (index === -1) return false;

    this.state.follows.splice(index, 1);

    const follower = this.state.users.find((u) => u.id === followerId);
    const following = this.state.users.find((u) => u.id === followingId);

    if (follower && follower.followingCount > 0) follower.followingCount -= 1;
    if (following && following.followersCount > 0) following.followersCount -= 1;

    this.save();
    return true;
  }

  public blockUser(blockerId: string, blockedId: string): boolean {
    if (blockerId === blockedId) return false;
    if (this.state.blocks.some((b) => b.blockerId === blockerId && b.blockedId === blockedId)) return true;

    this.state.blocks.push({
      blockerId,
      blockedId,
      createdAt: new Date().toISOString(),
    });

    // Automatically remove follows between each other
    this.unfollowUser(blockerId, blockedId);
    this.unfollowUser(blockedId, blockerId);

    this.save();
    return true;
  }

  public unblockUser(blockerId: string, blockedId: string): boolean {
    const index = this.state.blocks.findIndex(
      (b) => b.blockerId === blockerId && b.blockedId === blockedId
    );
    if (index === -1) return false;
    this.state.blocks.splice(index, 1);
    this.save();
    return true;
  }

  // --- Conversations & Messages ---

  public getConversations(userId: string): Conversation[] {
    return this.state.conversations.filter((c) => c.members.some((m) => m.userId === userId));
  }

  public getConversationById(id: string, userId: string): Conversation | null {
    const conv = this.state.conversations.find((c) => c.id === id);
    if (!conv) return null;
    const isMember = conv.members.some((m) => m.userId === userId);
    if (!isMember) return null;
    return conv;
  }

  public getOrCreateDirectConversation(userAId: string, userBId: string): Conversation {
    const existing = this.state.conversations.find(
      (c) =>
        !c.isGroup &&
        c.members.some((m) => m.userId === userAId) &&
        c.members.some((m) => m.userId === userBId)
    );

    if (existing) return existing;

    const userA = this.getUserById(userAId);
    const userB = this.getUserById(userBId);
    if (!userA || !userB) throw new Error('User not found');

    const newConv: Conversation = {
      id: `conv_${crypto.randomUUID().slice(0, 8)}`,
      isGroup: false,
      members: [
        {
          userId: userA.id,
          username: userA.username,
          displayName: userA.displayName,
          avatarUrl: userA.avatarUrl,
          role: 'member',
          joinedAt: new Date().toISOString(),
        },
        {
          userId: userB.id,
          username: userB.username,
          displayName: userB.displayName,
          avatarUrl: userB.avatarUrl,
          role: 'member',
          joinedAt: new Date().toISOString(),
        },
      ],
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
    };

    this.state.conversations.unshift(newConv);
    this.save();
    return newConv;
  }

  public createGroupConversation(creatorId: string, title: string, memberIds: string[]): Conversation {
    const creator = this.getUserById(creatorId);
    if (!creator) throw new Error('Creator not found');

    const allMemberIds = Array.from(new Set([creatorId, ...memberIds]));
    const members = allMemberIds
      .map((id) => this.getUserById(id))
      .filter((u): u is User => !!u)
      .map((u) => ({
        userId: u.id,
        username: u.username,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        role: (u.id === creatorId ? 'admin' : 'member') as 'admin' | 'member',
        joinedAt: new Date().toISOString(),
      }));

    const newConv: Conversation = {
      id: `conv_${crypto.randomUUID().slice(0, 8)}`,
      isGroup: true,
      title: title.trim(),
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(title)}`,
      members,
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
    };

    this.state.conversations.unshift(newConv);
    this.save();
    return newConv;
  }

  public getMessages(conversationId: string, userId: string): Message[] {
    const conv = this.getConversationById(conversationId, userId);
    if (!conv) throw new Error('Unauthorized');

    return this.state.messages.filter((m) => m.conversationId === conversationId);
  }

  public sendMessage(data: {
    conversationId: string;
    senderId: string;
    content: string;
    mediaUrl?: string;
  }): Message {
    const conv = this.getConversationById(data.conversationId, data.senderId);
    if (!conv) throw new Error('Unauthorized: Not a conversation member');

    const sender = this.getUserById(data.senderId);
    if (!sender) throw new Error('Sender not found');

    const newMsg: Message = {
      id: `msg_${crypto.randomUUID().slice(0, 8)}`,
      conversationId: data.conversationId,
      senderId: sender.id,
      sender: {
        id: sender.id,
        username: sender.username,
        displayName: sender.displayName,
        avatarUrl: sender.avatarUrl,
      },
      content: data.content,
      mediaUrl: data.mediaUrl,
      readBy: [sender.id],
      createdAt: new Date().toISOString(),
    };

    this.state.messages.push(newMsg);

    // Update conversation last message
    conv.lastMessage = {
      id: newMsg.id,
      senderId: sender.id,
      senderName: sender.displayName,
      content: data.content,
      createdAt: newMsg.createdAt,
    };
    conv.updatedAt = newMsg.createdAt;

    // Send notifications to offline/other members
    for (const member of conv.members) {
      if (member.userId !== sender.id) {
        this.createNotification({
          userId: member.userId,
          actorId: sender.id,
          type: 'message',
          targetId: conv.id,
          contentSummary: `${sender.displayName}: "${data.content.slice(0, 50)}"`,
        });
      }
    }

    this.save();
    return newMsg;
  }

  // --- Notifications ---

  public getNotifications(userId: string): Notification[] {
    return this.state.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createNotification(data: {
    userId: string;
    actorId: string;
    type: Notification['type'];
    targetId?: string;
    contentSummary?: string;
  }): Notification | null {
    const actor = this.getUserById(data.actorId);
    if (!actor) return null;

    const notif: Notification = {
      id: `notif_${crypto.randomUUID().slice(0, 8)}`,
      userId: data.userId,
      actorId: actor.id,
      actor: {
        id: actor.id,
        username: actor.username,
        displayName: actor.displayName,
        avatarUrl: actor.avatarUrl,
      },
      type: data.type,
      targetId: data.targetId,
      contentSummary: data.contentSummary,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    this.state.notifications.unshift(notif);
    this.save();
    return notif;
  }

  public markNotificationAsRead(id: string, userId: string): void {
    const notif = this.state.notifications.find((n) => n.id === id && n.userId === userId);
    if (notif) {
      notif.isRead = true;
      this.save();
    }
  }

  public markAllNotificationsAsRead(userId: string): void {
    for (const n of this.state.notifications) {
      if (n.userId === userId) {
        n.isRead = true;
      }
    }
    this.save();
  }

  // --- Communities ---

  public getCommunities(): Community[] {
    return this.state.communities;
  }

  public getCommunityBySlug(slug: string): Community | null {
    return this.state.communities.find((c) => c.slug === slug) || null;
  }

  public createCommunity(data: {
    creatorId: string;
    name: string;
    description: string;
    isPrivate?: boolean;
    avatarUrl?: string;
  }): Community {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCommunity: Community = {
      id: `comm_${crypto.randomUUID().slice(0, 8)}`,
      name: data.name.trim(),
      slug,
      description: data.description.trim(),
      avatarUrl:
        data.avatarUrl ||
        `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(slug)}`,
      isPrivate: !!data.isPrivate,
      creatorId: data.creatorId,
      membersCount: 1,
      postsCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.state.communities.push(newCommunity);
    this.save();
    return newCommunity;
  }

  // --- Search ---

  public search(query: string, viewerId?: string): { users: User[]; posts: Post[]; communities: Community[] } {
    const q = query.toLowerCase().trim();
    if (!q) return { users: [], posts: [], communities: [] };

    const users = this.state.users
      .filter((u) => u.username.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q))
      .map(({ passwordHash: _, ...safe }) => safe);

    const posts = this.getFeed(viewerId).filter(
      (p) => p.content.toLowerCase().includes(q) || (p.communityName && p.communityName.toLowerCase().includes(q))
    );

    const communities = this.state.communities.filter(
      (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );

    return { users, posts, communities };
  }

  // --- Moderation & Reports ---

  public createReport(data: {
    reporterId: string;
    targetType: Report['targetType'];
    targetId: string;
    reason: string;
    details?: string;
  }): Report {
    const reporter = this.getUserById(data.reporterId);
    if (!reporter) throw new Error('Reporter not found');

    const newReport: Report = {
      id: `rep_${crypto.randomUUID().slice(0, 8)}`,
      reporterId: data.reporterId,
      reporterName: reporter.displayName,
      targetType: data.targetType,
      targetId: data.targetId,
      reason: data.reason,
      details: data.details,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.state.reports.unshift(newReport);
    this.save();
    return newReport;
  }

  public getReports(): Report[] {
    return this.state.reports;
  }

  public resolveReport(reportId: string, status: 'resolved' | 'dismissed', adminUser: User): Report | null {
    const report = this.state.reports.find((r) => r.id === reportId);
    if (!report) return null;

    report.status = status;
    this.addAuditLog({
      adminId: adminUser.id,
      adminUsername: adminUser.username,
      action: `REPORT_${status.toUpperCase()}`,
      targetType: report.targetType,
      targetId: report.targetId,
      details: `Report ${reportId} marked as ${status} by @${adminUser.username}`,
    });

    this.save();
    return report;
  }

  public addAuditLog(data: Omit<AuditLog, 'id' | 'timestamp'>): void {
    this.state.auditLogs.unshift({
      id: `audit_${crypto.randomUUID().slice(0, 8)}`,
      ...data,
      timestamp: new Date().toISOString(),
    });
    this.save();
  }

  public getAuditLogs(): AuditLog[] {
    return this.state.auditLogs;
  }
}

export const db = new DatabaseRepository();
