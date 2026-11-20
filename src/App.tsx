import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageSquare, Radio, Compass, Radar, ArrowLeft } from 'lucide-react';
import { Chat, Message, User, MiniAppPayload } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { MomentsFeed } from './components/MomentsFeed';
import { RadarView } from './components/RadarView';
import { MiniAppsHub } from './components/MiniAppsHub';
import { MiniAppModal } from './components/MiniAppModal';
import { VideoCallModal } from './components/VideoCallModal';

const TEST_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Alex Morgan',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    status: 'Available'
  },
  {
    id: 'user-2',
    name: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    status: 'Building the next gen'
  },
  {
    id: 'user-3',
    name: 'David Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    status: 'In flow'
  }
];

export function App() {
  const [currentUser, setCurrentUser] = useState<User>(TEST_USERS[0]);
  const [activeTab, setActiveTab] = useState<'chats' | 'radar' | 'moments' | 'miniapps'>('chats');
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>('chat-ai');
  const activeChatIdRef = useRef<string>(activeChatId);
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [cardRect, setCardRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [transitionStage, setTransitionStage] = useState<'idle' | 'expanding' | 'expanded' | 'collapsing'>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const [isMiniAppModalOpen, setIsMiniAppModalOpen] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize Socket connection
  useEffect(() => {
    const s = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5
    });

    s.on('connect', () => {
      setIsConnected(true);
      s.emit('user_join', currentUser);
    });

    s.on('disconnect', () => {
      setIsConnected(false);
    });

    s.on('new_message', (msg: Message) => {
      setMessages((prev) => {
        if (prev.some(m => m.id === msg.id)) return prev;
        if (msg.chatId === activeChatIdRef.current) {
          return [...prev, msg];
        }
        return prev;
      });
      const preview = msg.type === 'voice' ? 'Voice memo'
        : msg.type === 'mini_app' ? 'Applet'
        : msg.type === 'image' ? '📷 Photo'
        : msg.type === 'video' ? '🎥 Video'
        : msg.type === 'document' ? `📄 ${msg.fileName || 'Document'}`
        : msg.text;
      setChats(prev => prev.map(c => c.id === msg.chatId ? { ...c, lastMessage: preview, lastTimestamp: msg.timestamp } : c));
    });

    s.on('message_updated', (updatedMsg: Message) => {
      setMessages((prev) => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
    });

    s.on('user_typing', ({ chatId, userName, isTyping }: { chatId: string; userName: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        const next = { ...prev };
        if (isTyping) {
          next[chatId] = userName;
        } else {
          delete next[chatId];
        }
        return next;
      });
    });

    setSocket(s);

    // Initial fetch of chats and messages
    fetch('http://localhost:3001/api/chats')
      .then(r => r.json())
      .then(data => {
        setChats(data);
        if (data.length > 0) {
          setActiveChatId(data[0].id);
        }
      })
      .catch(() => {
        // Offline / fallback mock if server not yet ready
        setChats([
          {
            id: 'chat-ai',
            name: 'Nexus AI Copilot',
            avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
            isGroup: false,
            online: true,
            status: 'Online',
            lastMessage: 'Instant smart answers, summary & translation',
            unreadCount: 0,
            pinned: true,
            participants: ['user-1', 'ai-bot']
          },
          {
            id: 'chat-group-apex',
            name: 'Global Tech Innovators',
            avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80',
            isGroup: true,
            online: true,
            status: '14 members • In-chat tools enabled',
            lastMessage: 'Quick poll for the team architecture choice',
            unreadCount: 2,
            pinned: true,
            participants: ['user-1', 'user-2', 'user-3']
          },
          {
            id: 'chat-priya',
            name: 'Priya Sharma',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
            isGroup: false,
            online: true,
            status: 'Online • Bengaluru, IN',
            lastMessage: 'Here is the dinner split from yesterday!',
            lastTimestamp: '10:16 AM',
            unreadCount: 1,
            pinned: false,
            participants: ['user-1', 'user-2']
          },
          {
            id: 'chat-david',
            name: 'David Chen',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
            isGroup: false,
            online: false,
            status: 'Last seen 15m ago',
            lastMessage: 'Looking forward to the architecture review.',
            lastTimestamp: '10:30 AM',
            unreadCount: 0,
            pinned: false,
            participants: ['user-1', 'user-3']
          }
        ]);
      });

    return () => {
      s.disconnect();
    };
  }, []);

  // When activeChatId changes, fetch messages and join room
  useEffect(() => {
    if (!activeChatId) return;

    if (socket) {
      socket.emit('join_chat', activeChatId);
    }

    fetch(`http://localhost:3001/api/messages/${activeChatId}`)
      .then(r => r.json())
      .then(data => setMessages(data))
      .catch(() => {
        // Fallback default sample messages if standalone
        setMessages([
          {
            id: 'm-fallback-1',
            chatId: activeChatId,
            senderId: 'ai-bot',
            senderName: 'Nexus System',
            senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
            text: 'Welcome to Nexus! Tap the "+" button below to try out interactive Polls, Bill Splits, and Tasks.',
            timestamp: '10:00 AM',
            type: 'text',
            reactions: { '⚡': ['user-1'] },
            status: 'read'
          }
        ]);
      });
  }, [activeChatId, socket]);

  const handleSendMessage = (
    text: string,
    type: 'text' | 'voice' | 'mini_app' | 'image' | 'video' | 'document' = 'text',
    miniApp?: MiniAppPayload,
    extra?: { fileUrl?: string; fileName?: string; fileSize?: string }
  ) => {
    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      chatId: activeChatId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      type,
      miniApp,
      reactions: {},
      status: 'sent',
      ...extra,
    };

    const preview = type === 'voice' ? 'Voice memo'
      : type === 'mini_app' ? 'Applet'
      : type === 'image' ? '📷 Photo'
      : type === 'video' ? '🎥 Video'
      : type === 'document' ? `📄 ${extra?.fileName || 'Document'}`
      : text;
    setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, lastMessage: preview, lastTimestamp: newMsg.timestamp } : c));

    // Optimistically show sent message immediately with spring entrance animation
    setMessages(prev => [...prev, newMsg]);

    if (socket && isConnected) {
      socket.emit('send_message', newMsg);
    }
  };

  const handleToggleReaction = (messageId: string, emoji: string) => {
    if (socket && isConnected) {
      socket.emit('toggle_reaction', {
        messageId,
        chatId: activeChatId,
        emoji,
        userId: currentUser.id
      });
    } else {
      setMessages(prev => prev.map(m => {
        if (m.id !== messageId) return m;
        const reactions = { ...m.reactions };
        if (!reactions[emoji]) reactions[emoji] = [];
        const idx = reactions[emoji].indexOf(currentUser.id);
        if (idx > -1) {
          reactions[emoji].splice(idx, 1);
          if (reactions[emoji].length === 0) delete reactions[emoji];
        } else {
          reactions[emoji].push(currentUser.id);
        }
        return { ...m, reactions };
      }));
    }
  };

  const handleUpdateMiniApp = (messageId: string, updatedData: any) => {
    if (socket && isConnected) {
      socket.emit('update_mini_app', {
        messageId,
        chatId: activeChatId,
        miniAppData: updatedData
      });
    } else {
      setMessages(prev => prev.map(m => {
        if (m.id === messageId && m.miniApp) {
          return {
            ...m,
            miniApp: { ...m.miniApp, data: updatedData }
          };
        }
        return m;
      }));
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (socket && isConnected) {
      socket.emit('typing', {
        chatId: activeChatId,
        userName: currentUser.name,
        isTyping
      });
    }
  };

  const activeChat = chats.find(c => c.id === activeChatId);

  const handleSelectChat = (id: string, rect?: { top: number; left: number; width: number; height: number }) => {
    setActiveChatId(id);
    if (rect) setCardRect(rect);
    setIsMobileChatOpen(true);
    setTransitionStage('expanding');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransitionStage('expanded');
      });
    });
  };

  const handleBackFromChat = () => {
    setTransitionStage('collapsing');
    setTimeout(() => {
      setIsMobileChatOpen(false);
      setTransitionStage('idle');
    }, 310);
  };

  const isCollapsing = transitionStage === 'collapsing';
  const isExpanding = transitionStage === 'expanding';
  const isExpanded = transitionStage === 'expanded';
  const isMorphingToCard = isExpanding || isCollapsing;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Swipe-to-go-back gesture handling for mobile
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDraggingBack, setIsDraggingBack] = useState<boolean>(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleOverlayTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || !isMobileChatOpen || transitionStage !== 'expanded') return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleOverlayTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    if (!isDraggingBack) {
      if (dx > 10 && dx > Math.abs(dy) * 1.5) {
        setIsDraggingBack(true);
      } else if (Math.abs(dy) > 10) {
        touchStartRef.current = null;
        return;
      }
    }

    if (isDraggingBack) {
      const offset = Math.max(0, dx);
      setDragOffset(offset);
    }
  };

  const handleOverlayTouchEnd = () => {
    if (!touchStartRef.current || !isDraggingBack) {
      touchStartRef.current = null;
      setIsDraggingBack(false);
      setDragOffset(0);
      return;
    }

    const elapsed = Date.now() - touchStartRef.current.time;
    const velocity = dragOffset / Math.max(1, elapsed);

    if (dragOffset > 75 || velocity > 0.35) {
      setDragOffset(0);
      setIsDraggingBack(false);
      touchStartRef.current = null;
      handleBackFromChat();
    } else {
      setDragOffset(0);
      setIsDraggingBack(false);
      touchStartRef.current = null;
    }
  };

  const mobileOverlayStyle: React.CSSProperties = (isMobile && isMobileChatOpen) ? {
    position: 'fixed',
    zIndex: 40,
    overflow: 'hidden',
    backgroundColor: 'var(--bg-panel)',
    willChange: 'transform, top, left, width, height',
    transition: isDraggingBack
      ? 'none'
      : (isExpanded || isCollapsing)
        ? 'transform 260ms cubic-bezier(0.2, 0.9, 0.2, 1), top 300ms cubic-bezier(0.2, 0.9, 0.2, 1), left 300ms cubic-bezier(0.2, 0.9, 0.2, 1), width 300ms cubic-bezier(0.2, 0.9, 0.2, 1), height 300ms cubic-bezier(0.2, 0.9, 0.2, 1)'
        : 'none',
    transform: dragOffset > 0 ? `translate3d(${dragOffset}px, 0, 0)` : 'translate3d(0, 0, 0)',
    top: isMorphingToCard && cardRect ? `${cardRect.top}px` : '0px',
    left: isMorphingToCard && cardRect ? `${cardRect.left}px` : '0px',
    width: isMorphingToCard && cardRect ? `${cardRect.width}px` : '100vw',
    height: isMorphingToCard && cardRect ? `${cardRect.height}px` : '100dvh',
    boxShadow: dragOffset > 0 ? '-6px 0 25px rgba(0,0,0,0.25)' : undefined,
  } : {};

  return (
    <div className="w-screen h-screen h-[100dvh] flex flex-col overflow-hidden font-sans" style={{ backgroundColor: 'var(--bg)', color: 'var(--text-1)' }}>
      {/* Top Header */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'chats') setIsMobileChatOpen(false);
        }}
        currentUser={currentUser}
        onSwitchUser={setCurrentUser}
        availableUsers={TEST_USERS}
        isConnected={isConnected}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {activeTab === 'chats' && (
          <>
            <Sidebar
              chats={chats}
              activeChatId={activeChatId}
              isMobileChatOpen={isMobileChatOpen}
              onSelectChat={handleSelectChat}
              onNewChat={() => setIsMiniAppModalOpen(true)}
              typingUsers={typingUsers}
              className={`w-full md:w-80 lg:w-96 shrink-0 ${isMobileChatOpen
                ? 'pointer-events-none md:pointer-events-auto'
                : ''
                }`}
            />
            <div
              className={`flex-1 h-full ${!isMobileChatOpen ? 'hidden md:flex' : 'flex'}`}
              style={mobileOverlayStyle}
              onTouchStart={handleOverlayTouchStart}
              onTouchMove={handleOverlayTouchMove}
              onTouchEnd={handleOverlayTouchEnd}
            >
              {dragOffset > 10 && (
                <div
                  className="fixed left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white z-50 pointer-events-none shadow-lg transition-transform"
                  style={{
                    opacity: Math.min(1, dragOffset / 60),
                    transform: `translateY(-50%) scale(${Math.min(1.15, 0.6 + dragOffset / 120)})`,
                  }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </div>
              )}
              <ChatArea
                chat={activeChat}
                messages={messages}
                currentUserId={currentUser.id}
                isCollapsing={isCollapsing}
                transitionStage={transitionStage}
                cardRect={cardRect}
                typingUser={typingUsers[activeChatId]}
                onSendMessage={handleSendMessage}
                onToggleReaction={handleToggleReaction}
                onUpdateMiniApp={handleUpdateMiniApp}
                onOpenMiniAppModal={() => setIsMiniAppModalOpen(true)}
                onTyping={handleTyping}
                onBack={handleBackFromChat}
                onStartVideoCall={() => setIsVideoCallOpen(true)}
              />
            </div>
          </>
        )}

        {activeTab === 'radar' && (
          <RadarView
            onStartChatWithUser={(userName, userAvatar) => {
              const newChatId = `chat-radar-${Date.now()}`;
              const newChat: Chat = {
                id: newChatId,
                name: userName,
                avatar: userAvatar,
                isGroup: false,
                online: true,
                status: 'Connected via Radar',
                lastMessage: 'Connected via Nexus Radar',
                lastTimestamp: 'Now',
                unreadCount: 0,
                pinned: false,
                participants: [currentUser.id, newChatId]
              };
              setChats(prev => [newChat, ...prev]);
              setActiveChatId(newChatId);
              setActiveTab('chats');
              setIsMobileChatOpen(true);
              setMessages(prev => [
                ...prev,
                {
                  id: `msg-${Date.now()}`,
                  chatId: newChatId,
                  senderId: 'system',
                  senderName: 'System',
                  senderAvatar: userAvatar,
                  text: 'Connected securely via Nexus Radar. No phone numbers were exchanged.',
                  timestamp: 'Now',
                  type: 'text',
                  reactions: {},
                  status: 'delivered'
                }
              ]);
            }}
          />
        )}

        {activeTab === 'moments' && <MomentsFeed />}

        {activeTab === 'miniapps' && <MiniAppsHub />}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden h-14 grid grid-cols-4 shrink-0 z-30 select-none pb-safe border-t" style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)' }}>
        <button
          onClick={() => {
            setActiveTab('chats');
            setIsMobileChatOpen(false);
          }}
          className="flex flex-col items-center justify-center gap-1 transition"
          style={{ color: activeTab === 'chats' ? 'var(--accent)' : 'var(--text-2)', fontWeight: activeTab === 'chats' ? 600 : 400 }}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px]">Messages</span>
        </button>

        <button
          onClick={() => setActiveTab('radar')}
          className="flex flex-col items-center justify-center gap-1 transition"
          style={{ color: activeTab === 'radar' ? 'var(--accent)' : 'var(--text-2)', fontWeight: activeTab === 'radar' ? 600 : 400 }}
        >
          <Radar className="w-5 h-5" />
          <span className="text-[10px]">Radar</span>
        </button>

        <button
          onClick={() => setActiveTab('moments')}
          className="flex flex-col items-center justify-center gap-1 transition"
          style={{ color: activeTab === 'moments' ? 'var(--accent)' : 'var(--text-2)', fontWeight: activeTab === 'moments' ? 600 : 400 }}
        >
          <Radio className="w-5 h-5" />
          <span className="text-[10px]">Feed</span>
        </button>

        <button
          onClick={() => setActiveTab('miniapps')}
          className="flex flex-col items-center justify-center gap-1 transition"
          style={{ color: activeTab === 'miniapps' ? 'var(--accent)' : 'var(--text-2)', fontWeight: activeTab === 'miniapps' ? 600 : 400 }}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">Applets</span>
        </button>
      </nav>

      {/* Mini App Creator Modal */}
      <MiniAppModal
        isOpen={isMiniAppModalOpen}
        onClose={() => setIsMiniAppModalOpen(false)}
        onSubmit={(payload, description) => {
          handleSendMessage(description, 'mini_app', payload);
        }}
      />

      {/* Video Call Modal */}
      <VideoCallModal
        isOpen={isVideoCallOpen}
        onClose={() => setIsVideoCallOpen(false)}
        chat={activeChat}
        currentUser={currentUser}
      />
    </div>
  );
}

export default App;
