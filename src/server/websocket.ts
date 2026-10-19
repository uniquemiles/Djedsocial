import { WebSocketServer, WebSocket } from 'ws';
import type { Server as HttpServer } from 'node:http';
import { db } from './db.js';
import type { Message, Notification } from '../types/index.js';

interface ClientConnection {
  ws: WebSocket;
  userId: string;
  rooms: Set<string>;
}

class RealtimeHub {
  private wss: WebSocketServer | null = null;
  private clients = new Map<WebSocket, ClientConnection>();
  private userClients = new Map<string, Set<WebSocket>>();

  public initialize(server: HttpServer): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req) => {
      // Extract session token from cookie header or query string
      let token: string | null = null;

      if (req.headers.cookie) {
        const match = req.headers.cookie.match(/djed_session=([^;]+)/);
        if (match) token = match[1];
      }

      if (!token && req.url) {
        const url = new URL(req.url, 'http://localhost');
        token = url.searchParams.get('token');
      }

      if (!token) {
        ws.send(JSON.stringify({ type: 'error', message: 'Authentication required' }));
        ws.close(1008, 'Unauthorized');
        return;
      }

      const session = db.getSessionByToken(token);
      if (!session) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid session' }));
        ws.close(1008, 'Invalid session');
        return;
      }

      const userId = session.user.id;
      const clientConn: ClientConnection = {
        ws,
        userId,
        rooms: new Set([`user:${userId}`]),
      };

      this.clients.set(ws, clientConn);
      if (!this.userClients.has(userId)) {
        this.userClients.set(userId, new Set());
      }
      this.userClients.get(userId)!.add(ws);

      ws.send(
        JSON.stringify({
          type: 'connected',
          userId,
          message: 'Connected to DJED Realtime Pillar',
        })
      );

      ws.on('message', (data: string) => {
        try {
          const payload = JSON.parse(data.toString());
          this.handleClientMessage(clientConn, payload);
        } catch (e) {
          console.error('[WS] Malformed message', e);
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        const userSet = this.userClients.get(userId);
        if (userSet) {
          userSet.delete(ws);
          if (userSet.size === 0) {
            this.userClients.delete(userId);
          }
        }
      });
    });

    console.log('[WS] Realtime hub initialized on /ws');
  }

  private handleClientMessage(client: ClientConnection, msg: any): void {
    switch (msg.type) {
      case 'join_conversation': {
        const convId = msg.conversationId;
        if (convId) {
          // Authorize membership
          const conv = db.getConversationById(convId, client.userId);
          if (conv) {
            client.rooms.add(`conv:${convId}`);
            client.ws.send(JSON.stringify({ type: 'joined_conversation', conversationId: convId }));
          } else {
            client.ws.send(JSON.stringify({ type: 'error', message: 'Unauthorized conversation room' }));
          }
        }
        break;
      }

      case 'leave_conversation': {
        if (msg.conversationId) {
          client.rooms.delete(`conv:${msg.conversationId}`);
        }
        break;
      }

      case 'typing': {
        const convId = msg.conversationId;
        if (convId && client.rooms.has(`conv:${convId}`)) {
          this.broadcastToRoom(`conv:${convId}`, {
            type: 'user_typing',
            conversationId: convId,
            userId: client.userId,
            isTyping: !!msg.isTyping,
          }, client.ws);
        }
        break;
      }

      case 'ping': {
        client.ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;
      }
    }
  }

  public broadcastToRoom(room: string, payload: any, senderWs?: WebSocket): void {
    const raw = JSON.stringify(payload);
    for (const [ws, conn] of this.clients.entries()) {
      if (conn.rooms.has(room) && ws !== senderWs && ws.readyState === WebSocket.OPEN) {
        ws.send(raw);
      }
    }
  }

  public sendToUser(userId: string, payload: any): void {
    const raw = JSON.stringify(payload);
    const userWsSet = this.userClients.get(userId);
    if (userWsSet) {
      for (const ws of userWsSet) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(raw);
        }
      }
    }
  }

  public notifyNewMessage(convId: string, message: Message): void {
    this.broadcastToRoom(`conv:${convId}`, {
      type: 'new_message',
      conversationId: convId,
      message,
    });
  }

  public notifyNewNotification(userId: string, notification: Notification): void {
    this.sendToUser(userId, {
      type: 'new_notification',
      notification,
    });
  }
}

export const realtimeHub = new RealtimeHub();
