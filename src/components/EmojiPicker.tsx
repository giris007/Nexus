import React, { useState } from 'react';
import { Smile, Heart, ThumbsUp, Sparkles, Coffee } from 'lucide-react';

interface EmojiPickerProps {
  isOpen: boolean;
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
}

const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    name: 'Smileys',
    icon: Smile,
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😋', '😛', '😜',
      '🤪', '🤨', '🧐', '🤓', '😎', '🥳', '😏', '😒', '😞', '😔',
      '😟', '😕', '🙁', '🥺', '😢', '😭', '😤', '😠', '😡', '🤯',
      '😳', '🥵', '🥶', '😱', '😨', '🤗', '🤔', '🤭', '🤫', '😴'
    ]
  },
  {
    id: 'gestures',
    name: 'Gestures',
    icon: ThumbsUp,
    emojis: [
      '👍', '👎', '👏', '🙌', '🤝', '✌️', '🤞', '🤙', '👊', '✊',
      '🤛', '🤜', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐️',
      '✋', '🖖', '🤘', '🤌', '👌', '🤏', '✍️', '🙏', '💪', '🫡'
    ]
  },
  {
    id: 'hearts',
    name: 'Hearts & Vibes',
    icon: Heart,
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '✨', '🌟',
      '💫', '🔥', '💥', '⚡', '💯', '🎉', '🎊', '🚀', '🎯', '🏆'
    ]
  },
  {
    id: 'activities',
    name: 'Life',
    icon: Coffee,
    emojis: [
      '☕', '🍕', '🍔', '🍟', '🍦', '🍰', '🍻', '🥂', '🍾', '🍩',
      '🎧', '📱', '💻', '📷', '💡', '📌', '🔑', '🚗', '✈️', '🏝️'
    ]
  }
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  isOpen,
  onSelectEmoji,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('smileys');

  if (!isOpen) return null;

  const currentCategory = EMOJI_CATEGORIES.find(c => c.id === activeTab) || EMOJI_CATEGORIES[0];

  return (
    <div
      className="absolute bottom-16 left-2 right-2 sm:left-4 sm:right-auto sm:w-80 rounded-2xl shadow-xl z-50 p-3 select-none animate-pop border"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border)'
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Category Tabs */}
      <div className="flex items-center gap-1 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
        {EMOJI_CATEGORIES.map(category => {
          const Icon = category.icon;
          const isActive = activeTab === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveTab(category.id)}
              className="p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 active:scale-95"
              style={{
                backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-2)'
              }}
              title={category.name}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          );
        })}
      </div>

      {/* Emoji Grid */}
      <div className="grid grid-cols-7 gap-1.5 pt-2.5 max-h-48 overflow-y-auto scrollbar-none">
        {currentCategory.emojis.map((emoji, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectEmoji(emoji)}
            className="w-9 h-9 flex items-center justify-center text-lg rounded-xl hover:scale-125 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
