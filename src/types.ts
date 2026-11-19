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
  reactions: Record<string, string[]>;
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

export interface User {
  id: string;
  name: string;
  avatar: string;
  status: string;
}
