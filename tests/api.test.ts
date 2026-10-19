import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../src/server/auth.js';
import { db } from '../src/server/db.js';

describe('DJED Authentication & Cryptography', () => {
  test('should hash and verify passwords with salt using PBKDF2-SHA512', () => {
    const raw = 'DjedPillar2026!Secret';
    const hash = hashPassword(raw);
    assert.ok(hash.includes(':'), 'Hash format must contain salt separator');
    assert.equal(verifyPassword(raw, hash), true, 'Valid password must verify');
    assert.equal(verifyPassword('WrongPassword', hash), false, 'Invalid password must fail verification');
  });

  test('should reject malformed password hashes without throwing', () => {
    assert.equal(verifyPassword('test', 'not-a-valid-hash'), false);
    assert.equal(verifyPassword('test', ''), false);
  });
});

describe('DJED Database & Social Feed Operations', () => {
  test('seed data should include prominent historical and tech personas', () => {
    const imhotep = db.getUserByUsername('imhotep');
    assert.ok(imhotep, 'Imhotep must exist in seed');
    assert.equal(imhotep.role, 'admin');

    const hypatia = db.getUserByUsername('hypatia');
    assert.ok(hypatia, 'Hypatia must exist in seed');
    assert.equal(hypatia.role, 'moderator');
  });

  test('should create post and allow toggling of sacred Egyptian reactions', () => {
    const imhotep = db.getUserByUsername('imhotep')!;
    const post = db.createPost({
      authorId: imhotep.id,
      content: 'Testing monumental statics #Architecture #Permanence',
    });

    assert.ok(post.id);
    assert.equal(post.authorId, imhotep.id);

    // Add Djed Pillar reaction
    const reacted = db.togglePostReaction(post.id, imhotep.id, 'djed');
    assert.equal(reacted.userReaction, 'djed');
    assert.equal(reacted.reactions.djed, 1);

    // Toggle off
    const unreacted = db.togglePostReaction(post.id, imhotep.id, 'djed');
    assert.equal(unreacted.userReaction, undefined);
    assert.equal(unreacted.reactions.djed || 0, 0);
  });

  test('blocking user must filter their posts from viewer feed', () => {
    const userA = db.createUser({
      username: `test_blocker_${Date.now()}`,
      email: `blocker_${Date.now()}@test.com`,
      passwordHash: hashPassword('testpass123'),
      displayName: 'Blocker User',
    });

    const userB = db.createUser({
      username: `test_blocked_${Date.now()}`,
      email: `blocked_${Date.now()}@test.com`,
      passwordHash: hashPassword('testpass123'),
      displayName: 'Blocked User',
    });

    db.createPost({
      authorId: userB.id,
      content: 'This post should be hidden from blocker',
    });

    // Before block, userA sees userB post
    const feedBefore = db.getFeed(userA.id);
    assert.ok(feedBefore.some((p) => p.authorId === userB.id));

    // User A blocks User B
    db.blockUser(userA.id, userB.id);

    // After block, userA must NOT see userB post
    const feedAfter = db.getFeed(userA.id);
    assert.equal(feedAfter.some((p) => p.authorId === userB.id), false);
  });
});

describe('DJED Messaging & Group Chamber Authorization', () => {
  test('group conversation must enforce membership and prevent unauthorized access', () => {
    const imhotep = db.getUserByUsername('imhotep')!;
    const hypatia = db.getUserByUsername('hypatia')!;
    const outsider = db.createUser({
      username: `outsider_${Date.now()}`,
      email: `outsider_${Date.now()}@test.com`,
      passwordHash: hashPassword('testpass123'),
      displayName: 'Outsider User',
    });

    const group = db.createGroupConversation(imhotep.id, 'Secret Blueprint Chamber', [hypatia.id]);

    // Member can access
    const memberMessages = db.getMessages(group.id, imhotep.id);
    assert.ok(Array.isArray(memberMessages));

    // Outsider must be denied with Unauthorized error
    assert.throws(() => {
      db.getMessages(group.id, outsider.id);
    }, /Unauthorized/);
  });
});

describe('DJED Moderation & Audit Logs', () => {
  test('should create report, resolve report, and append to audit log', () => {
    const imhotep = db.getUserByUsername('imhotep')!;
    const report = db.createReport({
      reporterId: imhotep.id,
      targetType: 'post',
      targetId: 'post_001',
      reason: 'Testing moderation pipeline',
      details: 'Audit verification',
    });

    assert.equal(report.status, 'pending');

    const resolved = db.resolveReport(report.id, 'resolved', imhotep);
    assert.ok(resolved);
    assert.equal(resolved.status, 'resolved');

    const auditLogs = db.getAuditLogs();
    assert.ok(auditLogs.some((l) => l.action === 'REPORT_RESOLVED'));
  });
});
