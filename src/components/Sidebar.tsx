import React, { useState } from 'react';
import { Search, Plus, Pin, Users, Sparkles, Radar } from 'lucide-react';
import { Chat } from '../types';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string;
  isMobileChatOpen?: boolean;
  onSelectChat: (chatId: string, rect?: { top: number; left: number; width: number; height: number }) => void;
  onNewChat: () => void;
  typingUsers: Record<string, string>;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats, activeChatId, isMobileChatOpen = false, onSelectChat, onNewChat, typingUsers, className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'radar' | 'groups' | 'ai'>('all');

  const radarCount = chats.filter(c => c.isRadar).length;

  const filteredChats = chats.filter(chat => {
    const match = chat.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!match) return false;
    if (filter === 'unread') return chat.unreadCount > 0;
    if (filter === 'radar') return Boolean(chat.isRadar);
    if (filter === 'groups') return chat.isGroup;
    if (filter === 'ai') return chat.id === 'chat-ai';
    return true;
  });

  return (
    <div
      className={`w-full md:w-80 lg:w-[340px] h-full flex flex-col select-none ${className}`}
      style={{ backgroundColor: 'var(--bg-panel)', borderRight: '1px solid var(--border)' }}
    >
      {/* Search bar */}
      <div className="px-3 pt-3 pb-2.5 space-y-2"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-3)' }} />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs py-2 pl-9 pr-3 rounded-xl focus:outline-none transition"
              style={{
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border)',
                color: 'var(--text-1)',
              }}
            />
          </div>
          <button
            onClick={onNewChat}
            className="p-2 rounded-xl transition active:scale-95 shadow-sm"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {(['all', 'unread', 'radar', 'groups', 'ai'] as const).map(f => {
            const active = filter === f;
            return (
              <button key={f} onClick={() => setFilter(f)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition active:scale-95 flex items-center gap-1"
                style={active
                  ? { backgroundColor: 'var(--accent)', color: '#fff' }
                  : { backgroundColor: 'var(--bg-input)', color: 'var(--text-2)', border: '1px solid var(--border)' }
                }
              >
                <span>{f === 'ai' ? 'Copilot' : f.charAt(0).toUpperCase() + f.slice(1)}</span>
                {f === 'radar' && radarCount > 0 && (
                  <span
                    className={`text-[9px] px-1 rounded-full font-bold ${
                      active ? 'bg-white text-blue-600' : 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400'
                    }`}
                  >
                    {radarCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map(chat => {
          const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 768 : false;
          const isActiveDesktop = chat.id === activeChatId && isDesktop;
          const typing = typingUsers[chat.id];

          return (
            <div
              key={chat.id}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                onSelectChat(chat.id, {
                  top: rect.top,
                  left: rect.left,
                  width: rect.width,
                  height: rect.height,
                });
              }}
              className="flex items-center gap-3 px-3 py-3.5 cursor-pointer transition-colors duration-100"
              style={{
                backgroundColor: isActiveDesktop ? 'var(--accent-subtle)' : undefined,
                borderBottom: '1px solid var(--border)',
              }}
              onMouseEnter={e => { if (!isActiveDesktop) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
              onMouseLeave={e => { if (!isActiveDesktop) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <img src={chat.avatar} alt={chat.name}
                  className="w-11 h-11 rounded-full object-cover"
                  style={isActiveDesktop ? { outline: `2px solid var(--accent)`, outlineOffset: '1px' } : {}} />
                {chat.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                    style={{ backgroundColor: 'var(--status-online)', borderColor: 'var(--bg-panel)' }} />
                )}
                {chat.id === 'chat-ai' && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center shadow"
                    style={{ backgroundColor: 'var(--accent)' }}>
                    <Sparkles className="w-2.5 h-2.5 text-white" />
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--text-1)' }}>{chat.name}</span>
                    {chat.isRadar && (
                      <span className="flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shrink-0">
                        <Radar className="w-2.5 h-2.5" />
                        <span>Radar</span>
                      </span>
                    )}
                    {chat.radarDetails?.exchangeStatus === 'exchanged' && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                        Saved
                      </span>
                    )}
                    {chat.isGroup && <Users className="w-3 h-3 shrink-0" style={{ color: 'var(--text-3)' }} />}
                  </div>
                  <span className="text-[11px] ml-2 shrink-0" style={{ color: 'var(--text-3)' }}>
                    {chat.lastTimestamp || (chat.id === 'chat-ai' ? 'Now' : '10:30')}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs truncate" style={{ color: typing ? 'var(--accent-text)' : 'var(--text-2)' }}>
                    {typing ? `${typing} is typing…` : (chat.lastMessage || 'No messages yet')}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {chat.pinned && <Pin className="w-3 h-3 rotate-45" style={{ color: 'var(--text-3)' }} />}
                    {chat.unreadCount > 0 && (
                      <span className="text-[10px] font-semibold text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                        style={{ backgroundColor: 'var(--status-unread)' }}>
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
