import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Compass, Radio, Sun, Moon, Check, ChevronDown } from 'lucide-react';
import { User } from '../types';
import { useTheme } from '../ThemeContext';

interface NavbarProps {
  activeTab: 'chats' | 'moments' | 'miniapps';
  onSelectTab: (tab: 'chats' | 'moments' | 'miniapps') => void;
  currentUser: User;
  onSwitchUser: (user: User) => void;
  availableUsers: User[];
  isConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab, onSelectTab, currentUser, onSwitchUser, availableUsers, isConnected
}) => {
  const { theme, toggle } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <header
      style={{ backgroundColor: 'var(--bg-panel)', borderBottom: '1px solid var(--border)' }}
      className="h-13 px-3 sm:px-4 flex items-center justify-between shrink-0 select-none relative z-40"
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shadow-xs"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <MessageSquare className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-1)' }}>
            Nexus
          </span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-400'}`}
            title={isConnected ? 'Connected' : 'Connecting'}
          />
        </div>
      </div>

      {/* Tabs — desktop only */}
      <div
        className="hidden md:flex items-center p-1 rounded-xl gap-0.5"
        style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
      >
        {([
          { id: 'chats' as const,    label: 'Messages', icon: MessageSquare },
          { id: 'moments' as const,  label: 'Feed',     icon: Radio },
          { id: 'miniapps' as const, label: 'Applets',  icon: Compass },
        ]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSelectTab(id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-medium"
            style={activeTab === id
              ? { backgroundColor: 'var(--accent)', color: '#fff' }
              : { color: 'var(--text-2)' }
            }
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Right Controls: theme toggle & profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="w-8 h-8 rounded-full flex items-center justify-center transition active:scale-95"
          style={{ color: 'var(--text-2)' }}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Profile & Account Switcher */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-1.5 pl-1.5 pr-1 py-1 rounded-full transition active:scale-95"
            style={{ backgroundColor: isMenuOpen ? 'var(--bg-active)' : 'transparent' }}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-black/5 dark:ring-white/10"
            />
            <ChevronDown className="w-3 h-3 transition-transform" style={{ color: 'var(--text-2)', transform: isMenuOpen ? 'rotate(180deg)' : 'none' }} />
          </button>

          {/* Account Dropdown Menu */}
          {isMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl overflow-hidden animate-pop border py-1.5"
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="px-3.5 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-medium leading-none" style={{ color: 'var(--text-1)' }}>{currentUser.name}</p>
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-2)' }}>{currentUser.status}</p>
              </div>

              <div className="px-2 pt-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2" style={{ color: 'var(--text-3)' }}>
                  Switch Account
                </span>
                <div className="mt-1 space-y-0.5">
                  {availableUsers.map(u => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSwitchUser(u);
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs transition"
                        style={{
                          backgroundColor: isSelected ? 'var(--accent-subtle)' : 'transparent',
                          color: isSelected ? 'var(--accent-text)' : 'var(--text-1)',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                          <span className="font-medium">{u.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
