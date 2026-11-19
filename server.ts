import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

export interface MiniAppPayload {
  type: 'poll' | 'bill_split' | 'checklist' | 'secret_note';
  data: any;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  date?: string;
  type: 'text' | 'voice' | 'mini_app' | 'image' | 'video' | 'document';
  voiceDuration?: number;
  miniApp?: MiniAppPayload;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  reactions: Record<string, string[]>; // emoji -> array of userIds
  status: 'sent' | 'delivered' | 'read';
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  isGroup: boolean;
  online?: boolean;
  status?: string;
  lastMessage?: string;
  lastTimestamp?: string;
  unreadCount: number;
  pinned?: boolean;
  participants: string[];
}

// Initial mock data
let chats: Chat[] = [
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
];

let messages: Message[] = [
  {
    id: 'msg-david-1',
    chatId: 'chat-david',
    senderId: 'user-3',
    senderName: 'David Chen',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    text: 'Looking forward to the architecture review.',
    timestamp: '10:30 AM',
    date: 'Yesterday',
    type: 'text',
    reactions: {},
    status: 'read'
  },
  {
    id: 'msg-1',
    chatId: 'chat-ai',
    senderId: 'ai-bot',
    senderName: 'Nexus AI',
    senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    text: 'Hello. I am the on-device Nexus Copilot. You can request message drafts, task breakdowns, or multilingual translation.',
    timestamp: '10:00 AM',
    date: 'Yesterday',
    type: 'text',
    reactions: { '👍': ['user-1'] },
    status: 'read'
  },
  {
    id: 'msg-2',
    chatId: 'chat-priya',
    senderId: 'user-2',
    senderName: 'Priya Sharma',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    text: 'Hey! Are we still meeting for the project sprint review today?',
    timestamp: '10:14 AM',
    type: 'text',
    reactions: {},
    status: 'read'
  },
  {
    id: 'msg-3',
    chatId: 'chat-priya',
    senderId: 'user-2',
    senderName: 'Priya Sharma',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    text: 'Here is the dinner split from yesterday!',
    timestamp: '10:16 AM',
    type: 'mini_app',
    miniApp: {
      type: 'bill_split',
      data: {
        title: 'Dinner at Olive Bistro',
        totalAmount: 1850,
        currency: '₹',
        participants: [
          { id: 'user-2', name: 'Priya Sharma', share: 925, paid: true },
          { id: 'user-1', name: 'You (Alex)', share: 925, paid: false }
        ]
      }
    },
    reactions: { '👍': ['user-1'] },
    status: 'read'
  },
  {
    id: 'msg-4',
    chatId: 'chat-group-apex',
    senderId: 'user-3',
    senderName: 'David Chen',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    text: 'Quick poll for the team architecture choice:',
    timestamp: '10:30 AM',
    type: 'mini_app',
    miniApp: {
      type: 'poll',
      data: {
        question: 'Which architecture for our messaging engine?',
        options: [
          { id: 'opt-1', label: 'Erlang/Elixir + WebSocket Matrix', votes: ['user-2', 'user-3'] },
          { id: 'opt-2', label: 'Rust + Libp2p Mesh Network', votes: ['user-1'] },
          { id: 'opt-3', label: 'Node.js Micro-App Cluster', votes: [] }
        ]
      }
    },
    reactions: { '🔥': ['user-1', 'user-2'] },
    status: 'delivered'
  }
];

// Active users tracking
const activeUsers = new Map<string, { socketId: string; user: any }>();

io.on('connection', (socket: Socket) => {
  socket.on('user_join', (user) => {
    activeUsers.set(socket.id, { socketId: socket.id, user });
    io.emit('active_users_update', Array.from(activeUsers.values()).map(u => u.user));
  });

  socket.on('join_chat', (chatId: string) => {
    socket.join(chatId);
  });

  socket.on('send_message', (msg: Message) => {
    messages.push(msg);
    io.emit('new_message', msg);

    // If sent to AI Copilot, simulate typing and smart response
    if (msg.chatId === 'chat-ai' && msg.senderId !== 'ai-bot') {
      io.emit('user_typing', { chatId: 'chat-ai', userName: 'Nexus AI', isTyping: true });

      setTimeout(() => {
        io.emit('user_typing', { chatId: 'chat-ai', userName: 'Nexus AI', isTyping: false });

        let reply = "Nexus provides direct on-device encryption, seamless animations, and sub-20ms communication latency.";
        const lower = msg.text.toLowerCase();
        if (lower.includes('hello') || lower.includes('hi')) {
          reply = "Hello! Send photos, videos, or documents, or tap '+' to launch interactive polls and tools.";
        } else if (lower.includes('poll') || lower.includes('feature')) {
          reply = "Tools run directly inside the active thread without requiring external browser tabs or app switches.";
        } else if (lower.includes('translate') || lower.includes('hindi') || lower.includes('spanish')) {
          reply = "Multilingual engine ready: real-time local translation supported.";
        }

        const aiMsg: Message = {
          id: 'msg-' + Date.now(),
          chatId: 'chat-ai',
          senderId: 'ai-bot',
          senderName: 'Nexus AI',
          senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
          reactions: {},
          status: 'read'
        };
        messages.push(aiMsg);
        io.emit('new_message', aiMsg);
      }, 1100);
    }
  });

  socket.on('typing', ({ chatId, userName, isTyping }: { chatId: string; userName: string; isTyping: boolean }) => {
    socket.broadcast.emit('user_typing', { chatId, userName, isTyping });
  });

  socket.on('toggle_reaction', ({ messageId, chatId, emoji, userId }: { messageId: string; chatId: string; emoji: string; userId: string }) => {
    const msg = messages.find(m => m.id === messageId);
    if (msg) {
      if (!msg.reactions[emoji]) {
        msg.reactions[emoji] = [];
      }
      const idx = msg.reactions[emoji].indexOf(userId);
      if (idx > -1) {
        msg.reactions[emoji].splice(idx, 1);
        if (msg.reactions[emoji].length === 0) {
          delete msg.reactions[emoji];
        }
      } else {
        msg.reactions[emoji].push(userId);
      }
      io.to(chatId).emit('message_updated', msg);
    }
  });

  socket.on('update_mini_app', ({ messageId, chatId, miniAppData }: { messageId: string; chatId: string; miniAppData: any }) => {
    const msg = messages.find(m => m.id === messageId);
    if (msg && msg.miniApp) {
      msg.miniApp.data = miniAppData;
      io.to(chatId).emit('message_updated', msg);
    }
  });

  socket.on('disconnect', () => {
    activeUsers.delete(socket.id);
    io.emit('active_users_update', Array.from(activeUsers.values()).map(u => u.user));
  });
});

app.get('/api/chats', (_req, res) => {
  const enriched = chats.map(c => {
    const chatMsgs = messages.filter(m => m.chatId === c.id);
    const last = chatMsgs.length > 0 ? chatMsgs[chatMsgs.length - 1] : null;
    return {
      ...c,
      lastMessage: last
        ? (last.type === 'voice' ? 'Voice memo'
            : last.type === 'mini_app' ? 'Applet'
            : last.type === 'image' ? '📷 Photo'
            : last.type === 'video' ? '🎥 Video'
            : last.type === 'document' ? `📄 ${last.fileName || 'Document'}`
            : last.text)
        : c.lastMessage,
      lastTimestamp: last ? last.timestamp : (c.lastTimestamp || '10:30')
    };
  });
  res.json(enriched);
});

app.get('/api/messages/:chatId', (req, res) => {
  const chatMessages = messages.filter(m => m.chatId === req.params.chatId);
  res.json(chatMessages);
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Nexus Realtime Server running on http://localhost:${PORT}`);
});
