import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Plus,
  Users,
  Image as ImageIcon,
  CheckCheck,
  Search,
} from 'lucide-react';
import type { Conversation, Message, User } from '../types/index.js';

interface MessagesViewProps {
  currentUser: User;
  allUsers: User[];
  conversations: Conversation[];
  onRefreshConversations: () => void;
  socket: WebSocket | null;
}

export function MessagesView({
  currentUser,
  allUsers,
  conversations,
  onRefreshConversations,
  socket,
}: MessagesViewProps) {
  const [selectedConvId, setSelectedConvId] = useState<string | null>(
    conversations[0]?.id || null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // New Chat Modal state
  const [showNewModal, setShowNewModal] = useState(false);
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [groupTitle, setGroupTitle] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [creatingChat, setCreatingChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === selectedConvId);

  // Fetch messages when selected conversation changes
  useEffect(() => {
    if (!selectedConvId) return;

    setLoadingMessages(true);
    fetch(`/api/v1/conversations/${selectedConvId}/messages`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages || []);
      })
      .catch((err) => console.error('Failed to load messages', err))
      .finally(() => setLoadingMessages(false));

    // Join conversation room on websocket
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: 'join_conversation',
          conversationId: selectedConvId,
        })
      );
    }
  }, [selectedConvId, socket]);

  // Listen for real-time messages via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'new_message') {
          if (payload.conversationId === selectedConvId) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === payload.message.id)) return prev;
              return [...prev, payload.message];
            });
          }
          onRefreshConversations();
        }
      } catch (err) {
        console.error('Error parsing WS message', err);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, selectedConvId, onRefreshConversations]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConvId) return;

    const text = inputText.trim();
    setInputText('');

    try {
      const res = await fetch(`/api/v1/conversations/${selectedConvId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
        onRefreshConversations();
      }
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const handleCreateChat = async () => {
    if (isGroupMode) {
      if (!groupTitle.trim() || selectedMemberIds.length === 0) return;
    } else {
      if (selectedMemberIds.length === 0) return;
    }

    setCreatingChat(true);
    try {
      const body = isGroupMode
        ? {
            isGroup: true,
            title: groupTitle.trim(),
            memberIds: selectedMemberIds,
          }
        : {
            isGroup: false,
            recipientId: selectedMemberIds[0],
          };

      const res = await fetch('/api/v1/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.conversation) {
        onRefreshConversations();
        setSelectedConvId(data.conversation.id);
        setShowNewModal(false);
        setGroupTitle('');
        setSelectedMemberIds([]);
      }
    } catch (err) {
      console.error('Failed to start chat', err);
    } finally {
      setCreatingChat(false);
    }
  };

  const getPartner = (conv: Conversation) => {
    return conv.members.find((m) => m.userId !== currentUser.id) || conv.members[0];
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    if (c.title?.toLowerCase().includes(q)) return true;
    return c.members.some(
      (m) => m.displayName.toLowerCase().includes(q) || m.username.toLowerCase().includes(q)
    );
  });

  return (
    <div className="h-[calc(100vh-4rem)] md:h-screen flex flex-col md:flex-row bg-[#080706] text-ivory overflow-hidden">
      {/* ================= LEFT CONVERSATION LIST ================= */}
      <div
        className={`${
          selectedConvId ? 'hidden md:flex' : 'flex'
        } flex-col w-full md:w-80 lg:w-96 border-r border-bronze-subtle bg-[#0c0907] shrink-0`}
      >
        {/* Header */}
        <div className="p-4 border-b border-bronze-subtle flex items-center justify-between">
          <div>
            <h2 className="font-cinzel text-lg font-bold text-gold">Whispers & Chambers</h2>
            <span className="text-[11px] text-muted-bronze">Enduring peer-to-peer dialogues</span>
          </div>

          <button
            onClick={() => {
              setShowNewModal(true);
              setIsGroupMode(false);
              setSelectedMemberIds([]);
            }}
            className="p-2 rounded-lg btn-primary-bronze text-white cursor-pointer"
            title="Start New Whisper / Group"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-bronze-subtle/50">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#15100D] border border-bronze-subtle text-xs">
            <Search size={14} className="text-muted-bronze" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-transparent w-full text-ivory focus:outline-none placeholder-muted-bronze/60"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-bronze-subtle/30">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-bronze">
              No conversations found. Inscribe a new whisper to begin.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const partner = getPartner(conv);
              const isSelected = conv.id === selectedConvId;
              const title = conv.isGroup ? conv.title : partner?.displayName || 'Unknown';
              const avatar = conv.isGroup ? conv.avatarUrl : partner?.avatarUrl;

              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full p-3.5 flex items-start gap-3 text-left transition-colors cursor-pointer ${
                    isSelected ? 'bg-[#201711] border-l-2 border-gold' : 'hover:bg-[#15100D]'
                  }`}
                >
                  <img
                    src={avatar}
                    alt={title}
                    className="w-11 h-11 rounded-full object-cover border border-bronze-subtle shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-semibold text-ivory truncate">{title}</span>
                      {conv.lastMessage && (
                        <span className="text-[10px] text-muted-bronze shrink-0 ml-1">
                          {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-bronze">
                      <p className="truncate mr-2">
                        {conv.lastMessage ? (
                          <>
                            {conv.isGroup && (
                              <span className="text-gold/90 mr-1">
                                {conv.lastMessage.senderName.split(' ')[0]}:
                              </span>
                            )}
                            {conv.lastMessage.content}
                          </>
                        ) : (
                          <span className="italic">Chamber established</span>
                        )}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#8C542E] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ================= RIGHT CHAT WINDOW ================= */}
      <div
        className={`${
          selectedConvId ? 'flex' : 'hidden md:flex'
        } flex-col flex-1 bg-[#080706] h-full overflow-hidden`}
      >
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="p-3.5 px-4 border-b border-bronze-subtle bg-[#0c0907] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConvId(null)}
                  className="md:hidden text-xs text-gold font-semibold pr-1"
                >
                  ← Back
                </button>

                <img
                  src={activeConv.isGroup ? activeConv.avatarUrl : getPartner(activeConv)?.avatarUrl}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border border-gold"
                />

                <div>
                  <h3 className="text-sm font-bold text-ivory flex items-center gap-1.5">
                    {activeConv.isGroup ? activeConv.title : getPartner(activeConv)?.displayName}
                    {activeConv.isGroup && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#201711] text-gold border border-bronze-subtle">
                        Council of {activeConv.members.length}
                      </span>
                    )}
                  </h3>
                  <span className="text-[11px] text-muted-bronze block">
                    {activeConv.isGroup
                      ? activeConv.members.map((m) => m.displayName.split(' ')[0]).join(', ')
                      : `@${getPartner(activeConv)?.username} · Active in sanctuary`}
                  </span>
                </div>
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-[#080706] to-[#0c0907]">
              {loadingMessages ? (
                <div className="text-center py-8 text-xs text-muted-bronze">
                  Retrieving chamber scrolls...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted-bronze max-w-xs mx-auto">
                  <Users size={24} className="mx-auto mb-2 text-gold opacity-60" />
                  No messages exchanged yet. Speak your mind into the permanence of the chamber.
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full`}
                    >
                      {!isMe && activeConv.isGroup && (
                        <span className="text-[10px] text-gold font-medium mb-1 px-1">
                          {msg.sender.displayName}
                        </span>
                      )}

                      <div
                        className={`max-w-[80%] md:max-w-[70%] p-3 rounded-2xl text-xs md:text-sm leading-relaxed ${
                          isMe
                            ? 'bg-gradient-to-br from-[#8C542E] to-[#60391F] text-ivory rounded-tr-none border border-gold/30 shadow-md'
                            : 'bg-[#1a130e] text-[#F3E8D7] rounded-tl-none border border-bronze-subtle'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>

                        <div
                          className={`flex items-center gap-1 justify-end mt-1 text-[9px] ${
                            isMe ? 'text-ivory/70' : 'text-muted-bronze'
                          }`}
                        >
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isMe && <CheckCheck size={12} className="text-gold" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-bronze-subtle bg-[#0c0907] flex items-center gap-2"
            >
              <button
                type="button"
                className="p-2 rounded text-muted-bronze hover:text-gold cursor-pointer"
                title="Attach Document or Artifact"
              >
                <ImageIcon size={18} />
              </button>

              <input
                type="text"
                placeholder="Inscribe your whisper..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#15100D] border border-bronze-subtle text-xs md:text-sm text-ivory placeholder-muted-bronze/60 focus:outline-none focus:border-gold"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-lg btn-primary-bronze text-white disabled:opacity-40 cursor-pointer shadow"
              >
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-bronze">
            <Users size={36} className="text-gold mb-3 opacity-50" />
            <h3 className="font-cinzel text-base font-bold text-gold mb-1">Select a Chamber</h3>
            <p className="text-xs max-w-sm">
              Engage in one-on-one counsel or convene a council group of multiple artisans.
            </p>
          </div>
        )}
      </div>

      {/* ================= NEW CHAT MODAL ================= */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-xl bg-[#201711] border border-bronze-subtle p-5 shadow-2xl">
            <h3 className="font-cinzel text-base font-bold text-gold mb-3">
              Establish New Communication
            </h3>

            {/* Mode switch: 1-on-1 vs Group */}
            <div className="flex items-center gap-2 p-1 rounded-lg bg-[#15100D] mb-4 border border-bronze-subtle">
              <button
                type="button"
                onClick={() => {
                  setIsGroupMode(false);
                  setSelectedMemberIds([]);
                }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  !isGroupMode ? 'bg-[#8C542E] text-white shadow-sm' : 'text-muted-bronze'
                }`}
              >
                Direct Whisper
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsGroupMode(true);
                  setSelectedMemberIds([]);
                }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  isGroupMode ? 'bg-[#8C542E] text-white shadow-sm' : 'text-muted-bronze'
                }`}
              >
                Council Group
              </button>
            </div>

            {isGroupMode && (
              <div className="mb-4">
                <label className="text-xs text-ivory block mb-1">Chamber Name</label>
                <input
                  type="text"
                  placeholder="e.g. Pyramid Blueprint Working Group"
                  value={groupTitle}
                  onChange={(e) => setGroupTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#15100D] border border-bronze-subtle text-xs text-ivory focus:outline-none focus:border-gold"
                />
              </div>
            )}

            <label className="text-xs text-ivory block mb-1.5">
              {isGroupMode ? 'Select Chamber Members' : 'Select Companion'}
            </label>
            <div className="max-h-52 overflow-y-auto divide-y divide-bronze-subtle/30 rounded border border-bronze-subtle bg-[#15100D] mb-4">
              {allUsers
                .filter((u) => u.id !== currentUser.id)
                .map((user) => {
                  const isChecked = selectedMemberIds.includes(user.id);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        if (isGroupMode) {
                          setSelectedMemberIds((prev) =>
                            isChecked ? prev.filter((id) => id !== user.id) : [...prev, user.id]
                          );
                        } else {
                          setSelectedMemberIds([user.id]);
                        }
                      }}
                      className={`w-full p-2.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                        isChecked ? 'bg-[#2B2017]' : 'hover:bg-[#201711]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.avatarUrl}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover border border-bronze-subtle"
                        />
                        <div>
                          <span className="text-xs font-semibold text-ivory block">
                            {user.displayName}
                          </span>
                          <span className="text-[10px] text-muted-bronze block">
                            @{user.username}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isChecked ? 'border-gold bg-[#8C542E]' : 'border-muted-bronze'
                        }`}
                      >
                        {isChecked && <CheckCheck size={10} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-3.5 py-1.5 rounded text-xs btn-secondary-bronze cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateChat}
                disabled={creatingChat || selectedMemberIds.length === 0}
                className="px-4 py-1.5 rounded text-xs btn-primary-bronze disabled:opacity-50 cursor-pointer"
              >
                {creatingChat ? 'Establishing...' : 'Open Chamber'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
