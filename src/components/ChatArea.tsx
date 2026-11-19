import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Mic, Smile, Phone, Video, MoreVertical, CheckCheck, Sparkles, Plus, ShieldCheck, Reply, X, Image, FileText, Download, Camera } from 'lucide-react';
import { Chat, Message, MiniAppPayload } from '../types';
import { MiniAppRenderer, VoicePlayer } from './MiniAppCards';

interface ChatAreaProps {
  chat: Chat | undefined;
  messages: Message[];
  currentUserId: string;
  isCollapsing?: boolean;
  transitionStage?: 'idle' | 'expanding' | 'expanded' | 'collapsing';
  cardRect?: { top: number; left: number; width: number; height: number } | null;
  typingUser?: string;
  onSendMessage: (
    text: string,
    type?: 'text' | 'voice' | 'mini_app' | 'image' | 'video' | 'document',
    miniApp?: MiniAppPayload,
    extra?: { fileUrl?: string; fileName?: string; fileSize?: string }
  ) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onUpdateMiniApp: (messageId: string, updatedData: any) => void;
  onOpenMiniAppModal: () => void;
  onTyping: (isTyping: boolean) => void;
  onBack?: () => void;
  onStartVideoCall?: () => void;
}

interface SwipeableBubbleProps {
  msg: Message;
  isMe: boolean;
  isGroup: boolean;
  currentUserId: string;
  onSwipeReply: (msg: Message) => void;
  onToggleReaction: (msgId: string, emoji: string) => void;
  onUpdateMiniApp: (msgId: string, data: any) => void;
}

const SwipeableBubble: React.FC<SwipeableBubbleProps> = ({
  msg, isMe, isGroup, currentUserId, onSwipeReply, onToggleReaction, onUpdateMiniApp
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.touches[0].clientX - touchStartRef.current.x;
    const dy = e.touches[0].clientY - touchStartRef.current.y;
    if (Math.abs(dy) > Math.abs(dx) && swipeOffset === 0) return;
    if (dx > 0) {
      setSwipeOffset(Math.min(50, dx * 0.6));
    }
  };

  const handleTouchEnd = () => {
    if (swipeOffset > 32) {
      onSwipeReply(msg);
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(25); } catch {}
      }
    }
    setSwipeOffset(0);
    touchStartRef.current = null;
  };

  return (
    <div
      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative select-none w-full ${
        isMe ? 'animate-msg-out' : 'animate-msg-in'
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe Reply indicator */}
      <div
        className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full pointer-events-none transition-all duration-150 shadow"
        style={{
          opacity: Math.min(1, swipeOffset / 25),
          transform: `translateY(-50%) translateX(${Math.max(0, swipeOffset - 24)}px) scale(${Math.min(1, swipeOffset / 30)})`,
          backgroundColor: 'var(--accent)',
          color: '#ffffff',
        }}
      >
        <Reply className="w-3.5 h-3.5" />
      </div>

      <div
        className="max-w-[82%] sm:max-w-[68%] rounded-2xl px-3.5 py-2.5 shadow-sm transition-transform duration-150"
        style={{
          transform: swipeOffset > 0 ? `translateX(${swipeOffset}px)` : 'none',
          backgroundColor: isMe ? 'var(--bubble-out)' : 'var(--bubble-in)',
          color: isMe ? 'var(--bubble-out-text)' : 'var(--bubble-in-text)',
          border: isMe ? 'none' : '1px solid var(--bubble-in-border)',
          borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        }}
      >
        {isGroup && !isMe && (
          <span className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--accent-text)' }}>
            {msg.senderName}
          </span>
        )}

        {msg.type === 'text' && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
        )}
        {msg.type === 'image' && (
          <div className="rounded-xl overflow-hidden my-1 max-w-xs">
            <img src={msg.fileUrl} alt={msg.fileName || 'Photo'} className="w-full max-h-60 object-cover rounded-xl" />
            {msg.text && msg.text !== msg.fileName && <p className="text-xs mt-1.5">{msg.text}</p>}
          </div>
        )}
        {msg.type === 'video' && (
          <div className="rounded-xl overflow-hidden my-1 max-w-xs">
            <video controls src={msg.fileUrl} className="w-full max-h-60 rounded-xl" />
            {msg.text && msg.text !== msg.fileName && <p className="text-xs mt-1.5">{msg.text}</p>}
          </div>
        )}
        {msg.type === 'document' && (
          <a
            href={msg.fileUrl}
            download={msg.fileName || 'document'}
            className="flex items-center gap-3 p-2.5 rounded-xl my-1 transition hover:opacity-90"
            style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">{msg.fileName || msg.text || 'Document'}</p>
              <p className="text-[10px] opacity-60">{msg.fileSize || 'File'}</p>
            </div>
            <Download className="w-4 h-4 opacity-70 shrink-0 ml-1" />
          </a>
        )}
        {msg.type === 'voice' && <VoicePlayer duration={msg.voiceDuration || 14} isMine={isMe} />}
        {msg.type === 'mini_app' && msg.miniApp && (
          <div>
            {msg.text && <p className="text-xs mb-2 font-medium opacity-70">{msg.text}</p>}
            <MiniAppRenderer
              payload={msg.miniApp}
              currentUserId={currentUserId}
              onUpdate={data => onUpdateMiniApp(msg.id, data)}
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-1 text-[10px] mt-1 select-none opacity-60">
          <span>{msg.timestamp}</span>
          {isMe && <CheckCheck className={`w-3.5 h-3.5 ${msg.status === 'read' ? 'opacity-100' : 'opacity-50'}`} />}
        </div>

        {/* Reactions */}
        {Object.keys(msg.reactions || {}).length > 0 && (
          <div className="absolute -bottom-2 right-2 flex gap-1 rounded-full px-2 py-0.5 shadow"
            style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
            {Object.entries(msg.reactions).map(([emoji, users]) => (
              <span key={emoji} onClick={() => onToggleReaction(msg.id, emoji)}
                className="text-xs cursor-pointer hover:scale-125 transition flex items-center gap-0.5">
                {emoji}
                {users.length > 1 && <span className="text-[9px]" style={{ color: 'var(--text-3)' }}>{users.length}</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Quick reactions (hover) */}
      <div className={`opacity-0 group-hover:opacity-100 transition flex items-center gap-1 rounded-full px-2 py-0.5 my-1 ${isMe ? 'mr-1' : 'ml-1'}`}
        style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
        {['👍','❤️','😂','🔥','👏'].map(e => (
          <button key={e} onClick={() => onToggleReaction(msg.id, e)}
            className="text-xs hover:scale-125 active:scale-95 transition">{e}</button>
        ))}
      </div>
    </div>
  );
};

export const ChatArea: React.FC<ChatAreaProps> = ({
  chat, messages, currentUserId, isCollapsing = false, transitionStage = 'idle', cardRect, typingUser, onSendMessage,
  onToggleReaction, onUpdateMiniApp, onOpenMiniAppModal, onTyping, onBack, onStartVideoCall
}) => {
  const isMorphingToCard = transitionStage === 'expanding' || transitionStage === 'collapsing' || isCollapsing;
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordTimerRef = useRef<any>(null);
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;
  const displayLastMsg = lastMessage
    ? (lastMessage.type === 'voice' ? 'Voice memo' : lastMessage.type === 'mini_app' ? 'Applet' : lastMessage.text)
    : (chat?.lastMessage || 'No messages yet');
  const displayTimestamp = lastMessage?.timestamp || chat?.lastTimestamp || (chat?.id === 'chat-ai' ? 'Now' : '10:30');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video');
    const reader = new FileReader();
    reader.onload = () => {
      onSendMessage(
        file.name,
        isVideo ? 'video' : 'image',
        undefined,
        { fileUrl: reader.result as string, fileName: file.name, fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB` }
      );
    };
    reader.readAsDataURL(file);
    e.target.value = '';
    setIsAttachOpen(false);
  };

  const handleDocSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onSendMessage(
        file.name,
        'document',
        undefined,
        { fileUrl: reader.result as string, fileName: file.name, fileSize: `${(file.size / 1024).toFixed(0)} KB` }
      );
    };
    reader.readAsDataURL(file);
    e.target.value = '';
    setIsAttachOpen(false);
  };

  if (!chat) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center text-center p-6"
        style={{ backgroundColor: 'var(--bg)' }}>
        <div className="w-13 h-13 rounded-2xl flex items-center justify-center mb-4"
          style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <ShieldCheck className="w-6 h-6" style={{ color: 'var(--text-3)' }} />
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Select a conversation</p>
        <p className="text-xs mt-1 max-w-xs" style={{ color: 'var(--text-3)' }}>
          Messages are end-to-end encrypted on-device.
        </p>
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const textToSend = replyingToMessage
      ? `↳ "${replyingToMessage.text.slice(0, 40)}"\n${inputText}`
      : inputText;
    onSendMessage(textToSend, 'text');
    setInputText('');
    setReplyingToMessage(null);
    onTyping(false);
  };

  const handleStartVoice = () => {
    setIsRecording(true);
    setRecordDuration(0);
    recordTimerRef.current = setInterval(() => setRecordDuration(p => p + 1), 1000);
  };

  const handleStopVoice = (cancel = false) => {
    setIsRecording(false);
    clearInterval(recordTimerRef.current);
    if (!cancel && recordDuration > 0) onSendMessage(`Voice memo (${recordDuration}s)`, 'voice');
  };

  return (
    <div
      className="flex-1 h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: isCollapsing ? 'var(--bg-panel)' : 'var(--bg)' }}
    >

      {/* Header */}
      <div
        className={`px-3 flex items-center justify-between shrink-0 z-20 transition-all duration-300 ease-out ${
          isMorphingToCard ? 'py-3.5' : 'py-2'
        }`}
        style={{
          height: isMorphingToCard && cardRect ? `${cardRect.height}px` : '56px',
          backgroundColor: 'var(--bg-panel)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {onBack && (
            <button
              onClick={onBack}
              className={`md:hidden p-1 -ml-1 rounded-full transition-all duration-300 ease-out shrink-0 overflow-hidden ${
                isMorphingToCard ? 'opacity-0 w-0 -mr-3 pointer-events-none' : 'opacity-100 w-7'
              }`}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            </button>
          )}

          <div className="relative shrink-0">
            <img
              src={chat.avatar}
              alt={chat.name}
              className={`rounded-full object-cover transition-all duration-300 ease-out ${
                isMorphingToCard ? 'w-11 h-11' : 'w-9 h-9'
              }`}
            />
            {chat.online && (
              <span
                className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                style={{ backgroundColor: 'var(--status-online)', borderColor: 'var(--bg-panel)' }}
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            {/* Top row: Name + Timestamp */}
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm font-medium truncate" style={{ color: 'var(--text-1)' }}>
                  {chat.name}
                </span>
                {chat.id === 'chat-ai' && !isMorphingToCard && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0"
                    style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)', border: '1px solid var(--border)' }}
                  >
                    Copilot
                  </span>
                )}
              </div>
              {/* Timestamp smoothly morphs into card top-right */}
              <span
                className={`text-[11px] ml-2 shrink-0 font-normal transition-opacity duration-300 ease-out ${
                  isMorphingToCard ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                style={{ color: 'var(--text-3)' }}
              >
                {displayTimestamp}
              </span>
            </div>

            {/* Bottom row: Subtitle smoothly cross-fades between Status and Last Message */}
            <div className="relative h-4 w-full overflow-hidden">
              {/* Presence status: visible when open */}
              <span
                className={`absolute inset-0 text-xs truncate transition-opacity duration-300 ease-out flex items-center ${
                  isMorphingToCard ? 'opacity-0' : 'opacity-100'
                }`}
                style={{ color: typingUser ? 'var(--accent)' : 'var(--text-3)' }}
              >
                {typingUser ? (
                  <span className="flex items-center gap-1 font-medium animate-pulse" style={{ color: 'var(--accent)' }}>
                    <span>{typingUser} is typing</span>
                    <span className="inline-flex gap-0.5 ml-0.5">
                      <span className="w-1 h-1 rounded-full bg-blue-500 animate-typing-1" />
                      <span className="w-1 h-1 rounded-full bg-blue-500 animate-typing-2" />
                      <span className="w-1 h-1 rounded-full bg-blue-500 animate-typing-3" />
                    </span>
                  </span>
                ) : (
                  chat.online ? 'Online' : (chat.status || 'Last seen 15m ago')
                )}
              </span>

              {/* Last message: visible when card-collapsed */}
              <span
                className={`absolute inset-0 text-xs truncate transition-opacity duration-300 ease-out flex items-center ${
                  isMorphingToCard ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ color: 'var(--text-2)' }}
              >
                {displayLastMsg}
              </span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div
          className={`flex items-center gap-1 shrink-0 transition-all duration-300 ease-out ${
            isMorphingToCard ? 'opacity-0 w-0 -mr-2 scale-75 pointer-events-none overflow-hidden' : 'opacity-100 w-auto'
          }`}
          style={{ color: 'var(--text-2)' }}
        >
          <button
            onClick={onStartVideoCall}
            title="Video call"
            className="w-9 h-9 flex items-center justify-center rounded-full transition active:scale-90"
            style={{ color: 'var(--text-2)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Video className="w-5 h-5" strokeWidth={1.9} />
          </button>

          <button
            onClick={onStartVideoCall}
            title="Voice call"
            className="w-9 h-9 flex items-center justify-center rounded-full transition active:scale-90"
            style={{ color: 'var(--text-2)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Phone className="w-[18px] h-[18px]" strokeWidth={1.9} />
          </button>

          <button
            title="More options"
            className="w-9 h-9 flex items-center justify-center rounded-full transition active:scale-90"
            style={{ color: 'var(--text-2)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <MoreVertical className="w-5 h-5" strokeWidth={1.9} />
          </button>
        </div>
      </div>

      {/* Message stream */}
      <div
        className={`flex-1 overflow-y-auto px-4 py-4 space-y-3 transition-opacity duration-150 ${
          isMorphingToCard ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* E2E banner */}
        <div className="flex justify-center">
          <span className="px-3 py-1 rounded-xl text-[11px] flex items-center gap-1.5"
            style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-3)' }}>
            <ShieldCheck className="w-3 h-3 text-green-500 shrink-0" />
            End-to-end encrypted
          </span>
        </div>

        {messages.map((msg, index) => {
          const isMe = msg.senderId === currentUserId;
          const msgDate = msg.date || 'Today';
          const prevMsg = index > 0 ? messages[index - 1] : null;
          const showDateDivider = index === 0 || (prevMsg && (prevMsg.date || 'Today') !== msgDate);

          return (
            <React.Fragment key={msg.id}>
              {showDateDivider && (
                <div className="flex justify-center my-2.5 select-none">
                  <span
                    className="px-3 py-0.5 rounded-full text-[11px] font-medium shadow-xs"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-2)',
                    }}
                  >
                    {msgDate}
                  </span>
                </div>
              )}
              <SwipeableBubble
                msg={msg}
                isMe={isMe}
                isGroup={Boolean(chat.isGroup)}
                currentUserId={currentUserId}
                onSwipeReply={setReplyingToMessage}
                onToggleReaction={onToggleReaction}
                onUpdateMiniApp={onUpdateMiniApp}
              />
            </React.Fragment>
          );
        })}

        {/* Floating typing bubble */}
        {typingUser && (
          <div className="flex items-center gap-2 mb-2 animate-msg-in">
            <div
              className="px-3.5 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-sm"
              style={{
                backgroundColor: 'var(--bubble-in)',
                border: '1px solid var(--bubble-in-border)',
                borderRadius: '18px 18px 18px 4px',
              }}
            >
              <span className="w-2 h-2 rounded-full animate-typing-1" style={{ backgroundColor: 'var(--accent)' }} />
              <span className="w-2 h-2 rounded-full animate-typing-2" style={{ backgroundColor: 'var(--accent)' }} />
              <span className="w-2 h-2 rounded-full animate-typing-3" style={{ backgroundColor: 'var(--accent)' }} />
            </div>
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-3)' }}>
              {typingUser} is typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div
        className={`px-3 pb-3 pt-2 z-20 transition-opacity duration-150 relative ${
          isMorphingToCard ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        style={{ backgroundColor: 'var(--bg-panel)', borderTop: '1px solid var(--border)' }}
      >
        {/* Hidden file pickers */}
        <input ref={mediaInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaSelect} />
        <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip" className="hidden" onChange={handleDocSelect} />

        {/* Attachment menu sheet */}
        {isAttachOpen && (
          <div
            className="mb-2 p-2.5 rounded-2xl shadow-xl flex items-center justify-around gap-2 animate-slide-up"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
            }}
          >
            <button
              type="button"
              onClick={() => { mediaInputRef.current?.click(); setIsAttachOpen(false); }}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition hover:scale-105 active:scale-95"
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white bg-purple-500 shadow-sm">
                <Image className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-1)' }}>Gallery</span>
            </button>

            <button
              type="button"
              onClick={() => { docInputRef.current?.click(); setIsAttachOpen(false); }}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition hover:scale-105 active:scale-95"
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white bg-blue-500 shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-1)' }}>Document</span>
            </button>

            <button
              type="button"
              onClick={() => { mediaInputRef.current?.click(); setIsAttachOpen(false); }}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition hover:scale-105 active:scale-95"
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white bg-pink-500 shadow-sm">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-1)' }}>Camera</span>
            </button>

            <button
              type="button"
              onClick={() => { onOpenMiniAppModal(); setIsAttachOpen(false); }}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition hover:scale-105 active:scale-95"
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white bg-emerald-500 shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-1)' }}>Poll & Tools</span>
            </button>
          </div>
        )}

        {/* Reply preview */}
        {replyingToMessage && (
          <div
            className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl text-xs animate-slide-up"
            style={{ backgroundColor: 'var(--bg-elevated)', borderLeft: '3px solid var(--accent)' }}
          >
            <div className="min-w-0 flex-1">
              <span className="font-semibold block" style={{ color: 'var(--accent-text)' }}>
                Replying to {replyingToMessage.senderName}
              </span>
              <span className="truncate block opacity-75" style={{ color: 'var(--text-2)' }}>
                {replyingToMessage.text}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setReplyingToMessage(null)}
              className="p-1 rounded-full hover:opacity-100 opacity-60 ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {isRecording ? (
          <div className="flex items-center justify-between rounded-2xl px-4 py-3 animate-pop"
            style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>
                Recording — 0:{recordDuration < 10 ? `0${recordDuration}` : recordDuration}
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleStopVoice(true)}
                className="text-xs px-2 py-1 active:scale-95" style={{ color: 'var(--text-2)' }}>Cancel</button>
              <button onClick={() => handleStopVoice(false)}
                className="text-white text-xs px-3 py-1.5 rounded-xl font-medium active:scale-95 transition shadow-sm"
                style={{ backgroundColor: 'var(--accent)' }}>Send</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAttachOpen(!isAttachOpen)}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition active:scale-90 ${
                isAttachOpen ? 'rotate-45' : 'rotate-0'
              }`}
              style={{ color: isAttachOpen ? 'var(--accent)' : 'var(--text-2)' }}
            >
              <Plus className="w-5 h-5 transition-transform" />
            </button>
            <button type="button" onClick={() => setInputText(p => p + '👍')}
              className="w-9 h-9 flex items-center justify-center rounded-full transition active:scale-90"
              style={{ color: 'var(--text-2)' }}>
              <Smile className="w-5 h-5" />
            </button>
            <input
              type="text"
              placeholder="Message"
              value={inputText}
              onChange={e => { setInputText(e.target.value); onTyping(e.target.value.length > 0); }}
              className="flex-1 text-sm px-4 py-2.5 rounded-full focus:outline-none transition"
              style={{
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border)',
                color: 'var(--text-1)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            {inputText.trim() ? (
              <button type="submit"
                className="w-10 h-10 flex items-center justify-center rounded-full text-white shadow transition active:scale-90"
                style={{ backgroundColor: 'var(--accent)' }}>
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" onClick={handleStartVoice}
                className="w-10 h-10 flex items-center justify-center rounded-full transition active:scale-90"
                style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                <Mic className="w-4 h-4" />
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
