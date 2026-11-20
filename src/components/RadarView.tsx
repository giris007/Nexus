import React, { useState, useEffect, useRef } from 'react';
import {
  Radar as RadarIcon,
  Shield,
  ShieldCheck,
  Clock,
  Lock,
  UserPlus,
  Check,
  CheckCheck,
  X,
  AlertTriangle,
  Ban,
  Share2,
  Send,
  Sparkles,
  MapPin,
  Users,
  BadgeCheck,
  MessageSquare,
  RefreshCw,
  Sliders,
  ChevronDown,
  Info
} from 'lucide-react';

export type VisibilityMode = 'off' | 'mutuals' | 'everyone';
export type DurationOption = 30 | 60 | 120; // minutes

export interface NearbyProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  verified: boolean;
  mutualConnections: number;
  domain?: string;
  bio: string;
  intentTag: string;
  proximityBucket: 'in_this_space' | 'nearby_now';
  angle: number; // for randomized radar layout
  radiusPercent: number;
  status: 'idle' | 'request_sent' | 'connected';
}

export interface RadarInvite {
  id: string;
  sender: NearbyProfile;
  icebreakerNote: string;
  timestamp: string;
}

export interface SandboxedMessage {
  id: string;
  sender: 'me' | 'them';
  text: string;
  timestamp: string;
}

const INTENT_PRESETS = [
  'Open to network / Tech talk',
  'At this event solo',
  'Looking for a study/coffee buddy',
  'Just chilling / Say hi'
];

const INITIAL_PROFILES: NearbyProfile[] = [
  {
    id: 'p-1',
    name: 'Rohan Mehta',
    handle: '@rohan_m',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    verified: true,
    mutualConnections: 3,
    domain: 'Bengaluru Tech Hub',
    bio: 'Distributed systems & Rust enthusiast. Attending the AI infra keynote.',
    intentTag: 'Open to network / Tech talk',
    proximityBucket: 'in_this_space',
    angle: 42,
    radiusPercent: 62,
    status: 'idle'
  },
  {
    id: 'p-2',
    name: 'Sneha Patel',
    handle: '@sneha_p',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    verified: true,
    mutualConnections: 5,
    domain: 'IIT Madras Alumni',
    bio: 'Product designer focusing on accessible UI systems and generative interactions.',
    intentTag: 'Looking for a study/coffee buddy',
    proximityBucket: 'in_this_space',
    angle: 155,
    radiusPercent: 74,
    status: 'idle'
  },
  {
    id: 'p-3',
    name: 'Vikram Rao',
    handle: '@vikram_r',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    verified: false,
    mutualConnections: 1,
    domain: 'WeWork Galaxy',
    bio: 'Founding engineer @edge_os. Reading sci-fi and exploring local cafes.',
    intentTag: 'At this event solo',
    proximityBucket: 'nearby_now',
    angle: 275,
    radiusPercent: 86,
    status: 'idle'
  }
];

interface RadarViewProps {
  onStartChatWithUser?: (userName: string, userAvatar: string) => void;
}

export const RadarView: React.FC<RadarViewProps> = ({ onStartChatWithUser }) => {
  // 1. Visibility & Auto-Expiry State (Defaults to OFF for safety)
  const [visibilityMode, setVisibilityMode] = useState<VisibilityMode>('off');
  const [activeDuration, setActiveDuration] = useState<DurationOption>(60);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);

  // 2. Intent Status
  const [myIntent, setMyIntent] = useState<string>('Open to network / Tech talk');
  const [isEditingIntent, setIsEditingIntent] = useState(false);

  // 3. Profiles & Scarcity Guardrails
  const [profiles, setProfiles] = useState<NearbyProfile[]>(INITIAL_PROFILES);
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set());
  const [dailyInvitesLeft, setDailyInvitesLeft] = useState<number>(3);
  const [cooldownHours, setCooldownHours] = useState<number>(0);

  // 4. Invite Flow (Mandatory Icebreaker Note)
  const [selectedProfileForInvite, setSelectedProfileForInvite] = useState<NearbyProfile | null>(null);
  const [icebreakerText, setIcebreakerText] = useState<string>('');

  // 5. Incoming Request Flow (Simulated after activating)
  const [incomingInvite, setIncomingInvite] = useState<RadarInvite | null>(null);

  // 6. Sandboxed Temporary Chat
  const [sandboxedChatUser, setSandboxedChatUser] = useState<NearbyProfile | null>(null);
  const [sandboxedMessages, setSandboxedMessages] = useState<SandboxedMessage[]>([]);
  const [sandboxedInput, setSandboxedInput] = useState<string>('');
  const [myContactShared, setMyContactShared] = useState<boolean>(false);
  const [theirContactShared, setTheirContactShared] = useState<boolean>(false);

  // Live countdown timer for Auto-Expiry
  useEffect(() => {
    if (!expiresAt || visibilityMode === 'off') {
      setRemainingSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setRemainingSeconds(diff);

      if (diff <= 0) {
        // Automatically revert to OFF when timer expires
        setVisibilityMode('off');
        setExpiresAt(null);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, visibilityMode]);

  // Turn ON Radar with selected duration
  const handleActivateRadar = (mode: VisibilityMode, durationMinutes: DurationOption) => {
    setVisibilityMode(mode);
    setActiveDuration(durationMinutes);
    const expireTime = Date.now() + durationMinutes * 60 * 1000;
    setExpiresAt(expireTime);
    setIsActivationModalOpen(false);

    // Simulate an incoming verified icebreaker request after 6s to showcase double opt-in
    setTimeout(() => {
      setIncomingInvite({
        id: 'inv-maya',
        sender: {
          id: 'p-maya',
          name: 'Maya Sen',
          handle: '@mayasen',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          verified: true,
          mutualConnections: 4,
          domain: 'Bengaluru Tech Summit',
          bio: 'Frontend platform engineer. Working on reactive streams.',
          intentTag: 'Open to network / Tech talk',
          proximityBucket: 'in_this_space',
          angle: 90,
          radiusPercent: 50,
          status: 'idle'
        },
        icebreakerNote: 'Hey Alex! Saw your talk on edge state sync. Would love to exchange notes during the coffee break!',
        timestamp: 'Just now'
      });
    }, 5500);
  };

  // Turn OFF Radar immediately
  const handleTurnOffRadar = () => {
    setVisibilityMode('off');
    setExpiresAt(null);
    setRemainingSeconds(0);
  };

  // Format countdown string mm:ss or hh:mm
  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hrs}h ${remMins}m`;
    }
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  // Send an invite with a mandatory custom note
  const handleSendInvite = () => {
    if (!selectedProfileForInvite) return;
    if (icebreakerText.trim().length < 20 || dailyInvitesLeft <= 0) return;

    // Deduct from daily invite scarcity
    setDailyInvitesLeft(prev => Math.max(0, prev - 1));

    // Update profile status
    setProfiles(prev =>
      prev.map(p =>
        p.id === selectedProfileForInvite.id ? { ...p, status: 'request_sent' } : p
      )
    );

    setSelectedProfileForInvite(null);
    setIcebreakerText('');
  };

  // Accept incoming invite -> Open Sandboxed Radar Chat
  const handleAcceptIncomingInvite = () => {
    if (!incomingInvite) return;
    const sender = incomingInvite.sender;
    setProfiles(prev => [sender, ...prev.filter(p => p.id !== sender.id)]);
    setSandboxedChatUser(sender);
    setSandboxedMessages([
      {
        id: `m-init-1`,
        sender: 'them',
        text: incomingInvite.icebreakerNote,
        timestamp: incomingInvite.timestamp
      }
    ]);
    setIncomingInvite(null);
  };

  // Ignore incoming invite (permanently dismisses)
  const handleIgnoreInvite = () => {
    setIncomingInvite(null);
  };

  // Block & Report sender permanently
  const handleBlockUser = (userId: string) => {
    setBlockedUserIds(prev => new Set(prev).add(userId));
    setProfiles(prev => prev.filter(p => p.id !== userId));
    if (incomingInvite?.sender.id === userId) {
      setIncomingInvite(null);
    }
    if (sandboxedChatUser?.id === userId) {
      setSandboxedChatUser(null);
    }
  };

  // Send message inside Sandboxed Temporary Radar Chat
  const handleSendSandboxedMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sandboxedInput.trim()) return;

    const newMsg: SandboxedMessage = {
      id: `sb-${Date.now()}`,
      sender: 'me',
      text: sandboxedInput.trim(),
      timestamp: 'Now'
    };
    setSandboxedMessages(prev => [...prev, newMsg]);
    setSandboxedInput('');

    // Simulate reply after 1.8s
    setTimeout(() => {
      setSandboxedMessages(prev => [
        ...prev,
        {
          id: `sb-${Date.now()}-reply`,
          sender: 'them',
          text: 'Sounds great! I just confirmed sharing my contact info too.',
          timestamp: 'Now'
        }
      ]);
      setTheirContactShared(true);
    }, 1800);
  };

  // Mutual Contact Share Flow
  const handleShareMyContact = () => {
    setMyContactShared(true);
  };

  // When both agree to share contact, migrate thread to primary Messages tab
  useEffect(() => {
    if (myContactShared && theirContactShared && sandboxedChatUser) {
      setTimeout(() => {
        if (onStartChatWithUser) {
          onStartChatWithUser(sandboxedChatUser.name, sandboxedChatUser.avatar);
        }
        setSandboxedChatUser(null);
        setMyContactShared(false);
        setTheirContactShared(false);
      }, 1600);
    }
  }, [myContactShared, theirContactShared, sandboxedChatUser, onStartChatWithUser]);

  // Filter out blocked users
  const visibleProfiles = profiles.filter(p => !blockedUserIds.has(p.id));
  const inSpaceProfiles = visibleProfiles.filter(p => p.proximityBucket === 'in_this_space');
  const nearbyProfiles = visibleProfiles.filter(p => p.proximityBucket === 'nearby_now');

  return (
    <div className="flex-1 h-full overflow-y-auto flex flex-col items-center select-none" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="w-full max-w-xl px-3 sm:px-4 py-3 space-y-3.5 pb-16">

        {/* ─── TOP CONTROL BAR ─── */}
        <div
          className="rounded-2xl p-3 border shadow-xs transition"
          style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                  visibilityMode === 'off' ? 'bg-gray-200 dark:bg-zinc-800 text-gray-500' : 'bg-blue-600 text-white'
                }`}
              >
                <RadarIcon className={`w-4 h-4 ${visibilityMode !== 'off' ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold" style={{ color: 'var(--text-1)' }}>
                    Radar
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      visibilityMode === 'off'
                        ? 'bg-gray-200 dark:bg-zinc-800 text-gray-500'
                        : visibilityMode === 'mutuals'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                    }`}
                  >
                    {visibilityMode === 'off' ? 'Invisible' : visibilityMode === 'mutuals' ? 'Mutuals Only' : 'Everyone Nearby'}
                  </span>
                </div>
              </div>
            </div>

            {/* Visibility Mode Dropdown / Button */}
            <div className="flex items-center gap-2">
              {visibilityMode !== 'off' ? (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    <Clock className="w-3 h-3 animate-pulse" />
                    <span>{formatCountdown(remainingSeconds)}</span>
                  </div>
                  <button
                    onClick={handleTurnOffRadar}
                    className="px-2.5 py-1 text-xs font-medium rounded-xl border hover:bg-red-500/10 hover:text-red-600 hover:border-red-400 transition active:scale-95 text-gray-500"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    Turn Off
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsActivationModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl text-white shadow-xs transition active:scale-95 flex items-center gap-1.5"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Turn On</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Context Banner: Venue Hub + Intent Status */}
          {visibilityMode !== 'off' && (
            <div className="mt-2.5 pt-2.5 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
              {/* Contextual Hub */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold truncate">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Bengaluru Tech Summit • Main Hall</span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium shrink-0">
                  {visibleProfiles.length} verified peers
                </span>
              </div>

              {/* My Intent Tag Pill */}
              <div
                className="p-2 rounded-xl border flex items-center justify-between gap-2"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 shrink-0">
                    My Intent:
                  </span>
                  <span className="text-xs font-semibold truncate text-blue-600 dark:text-cyan-400">
                    &ldquo;{myIntent}&rdquo;
                  </span>
                </div>
                <button
                  onClick={() => setIsActivationModalOpen(true)}
                  className="text-[11px] font-medium text-gray-400 hover:text-blue-500 transition shrink-0"
                >
                  Change
                </button>
              </div>

              {/* Daily Invite Scarcity Badge */}
              <div className="flex items-center justify-between text-[11px] text-gray-400 px-1 pt-0.5">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Daily Invites Available:</span>
                </span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {dailyInvitesLeft} of 3 remaining
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ─── STATE 1: RADAR IS OFF (DEFAULT PRIVACY SCREEN) ─── */}
        {visibilityMode === 'off' && (
          <div
            className="rounded-3xl p-6 sm:p-8 border shadow-xs text-center space-y-5"
            style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)' }}
          >
            <div className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm">
              <Shield className="w-8 h-8" />
            </div>

            <div className="space-y-1.5 max-w-sm mx-auto">
              <h2 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-1)' }}>
                Radar is Completely Inactive
              </h2>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>
                You are completely invisible and cannot be scanned. No Bluetooth, Wi-Fi subnet, or mesh presence is broadcasting.
              </p>
            </div>

            {/* Privacy Architecture Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left pt-1">
              <div
                className="p-3 rounded-2xl border space-y-1"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Anti-Stalking</span>
                </div>
                <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>
                  Zero exact meters, physical triangulation, or compass vectors.
                </p>
              </div>

              <div
                className="p-3 rounded-2xl border space-y-1"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Auto-Expiry</span>
                </div>
                <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>
                  Mandatory safety timer automatically shuts off radar after 30-120 mins.
                </p>
              </div>

              <div
                className="p-3 rounded-2xl border space-y-1"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Double Opt-In</span>
                </div>
                <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>
                  Mandatory icebreaker notes and max 3 daily invites to eliminate spam.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsActivationModalOpen(true)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl text-xs font-semibold text-white shadow-sm transition active:scale-95"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Configure & Turn On Radar
            </button>
          </div>
        )}

        {/* ─── STATE 2: ACTIVE RADAR DISCOVERY ─── */}
        {visibilityMode !== 'off' && (
          <>
            {/* Incoming Connection Request Modal / Toast */}
            {incomingInvite && (
              <div
                className="p-3.5 rounded-2xl border shadow-lg space-y-2.5 animate-fadeIn"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--accent)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Radar Invite Received</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">
                    In this space
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <img
                    src={incomingInvite.sender.avatar}
                    alt={incomingInvite.sender.name}
                    className="w-10 h-10 rounded-full object-cover border-2 shrink-0"
                    style={{ borderColor: 'var(--accent)' }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold truncate" style={{ color: 'var(--text-1)' }}>
                        {incomingInvite.sender.name}
                      </span>
                      {incomingInvite.sender.verified && (
                        <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20 shrink-0" />
                      )}
                      <span className="text-[11px] text-gray-400 truncate">
                        {incomingInvite.sender.mutualConnections} mutual connections
                      </span>
                    </div>
                    {/* Custom Icebreaker Note Quote */}
                    <div
                      className="mt-1.5 p-2 rounded-xl text-xs italic border"
                      style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                    >
                      &ldquo;{incomingInvite.icebreakerNote}&rdquo;
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleAcceptIncomingInvite}
                    className="flex-1 py-1.5 rounded-xl text-white text-xs font-semibold shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept (Sandboxed Chat)</span>
                  </button>
                  <button
                    onClick={handleIgnoreInvite}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium border text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    Ignore
                  </button>
                  <button
                    onClick={() => handleBlockUser(incomingInvite.sender.id)}
                    className="p-1.5 rounded-xl text-xs font-medium border text-red-500 hover:bg-red-500/10 transition"
                    style={{ borderColor: 'var(--border)' }}
                    title="Block & Hide forever"
                  >
                    <Ban className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Circular Anti-Stalking Radar Dial Canvas */}
            <div
              className="rounded-3xl p-5 border flex flex-col items-center justify-center relative overflow-hidden shadow-xs"
              style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)' }}
            >
              {/* Dial scope with randomized node scattering (No exact triangulation) */}
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full flex items-center justify-center overflow-hidden border border-blue-200/80 dark:border-cyan-500/30 bg-gradient-to-b from-blue-50/70 to-slate-100/90 dark:from-[#090d16] dark:to-[#050811] shadow-inner">
                {/* Subtle Crosshairs */}
                <div className="absolute inset-x-0 top-1/2 h-px bg-blue-500/20 dark:bg-cyan-500/20 pointer-events-none" />
                <div className="absolute inset-y-0 left-1/2 w-px bg-blue-500/20 dark:bg-cyan-500/20 pointer-events-none" />

                {/* Bucketed Privacy Rings (No meter numbers) */}
                <div className="absolute w-[86%] h-[86%] rounded-full border border-dashed border-blue-500/30 dark:border-cyan-500/30 pointer-events-none flex items-start justify-center pt-1">
                  <span className="text-[8px] font-mono font-bold text-blue-600/70 dark:text-cyan-400/80">
                    Nearby Now
                  </span>
                </div>
                <div className="absolute w-[56%] h-[56%] rounded-full border border-blue-500/25 dark:border-cyan-500/25 pointer-events-none flex items-start justify-center pt-1">
                  <span className="text-[8px] font-mono font-bold text-blue-600/70 dark:text-cyan-400/80">
                    In This Space
                  </span>
                </div>

                {/* Sweeping Radar Beam */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none animate-spin"
                  style={{
                    animationDuration: '3.8s',
                    background: 'conic-gradient(from 0deg, rgba(37, 99, 235, 0.35) 0deg, rgba(37, 99, 235, 0.05) 55deg, transparent 70deg, transparent 360deg)'
                  }}
                />

                {/* Center "You" node */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-md flex items-center justify-center">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                        alt="You"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-black shadow-xs animate-pulse" />
                  </div>
                  <div className="flex flex-col items-center mt-1">
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-white/95 dark:bg-black/85 text-gray-800 dark:text-white border border-black/10 dark:border-white/15 shadow-xs">
                      You
                    </span>
                  </div>
                </div>

                {/* Randomized Nodes (Anti-Triangulation) */}
                {visibleProfiles.map(profile => {
                  const rad = (profile.angle * Math.PI) / 180;
                  const maxRadius = 120;
                  const dist = (profile.radiusPercent / 100) * maxRadius;
                  const x = Math.cos(rad) * dist;
                  const y = Math.sin(rad) * dist;

                  return (
                    <div
                      key={profile.id}
                      onClick={() => setSelectedProfileForInvite(profile)}
                      className="absolute z-20 flex flex-col items-center cursor-pointer group transition-transform duration-300 hover:scale-110 active:scale-95"
                      style={{ transform: `translate(${x}px, ${y}px)` }}
                    >
                      <div className="relative">
                        <span className="absolute -inset-1 rounded-full bg-blue-500/30 animate-pulse pointer-events-none" />
                        <img
                          src={profile.avatar}
                          alt={profile.name}
                          className="relative w-8 h-8 rounded-full object-cover border-2 border-blue-500 shadow-md group-hover:border-cyan-400 transition"
                        />
                      </div>
                      <div className="flex flex-col items-center mt-1 px-1.5 py-0.5 rounded-lg bg-white/95 dark:bg-black/85 text-gray-900 dark:text-white backdrop-blur-md shadow-sm border border-black/10 dark:border-white/15 max-w-[96px] text-center">
                        <span className="text-[9px] font-bold truncate w-full">
                          {profile.name.split(' ')[0]}
                        </span>
                        <span className="text-[7.5px] text-blue-600 dark:text-cyan-300 font-mono truncate w-full">
                          {profile.intentTag.split(' / ')[0]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ─── BUCKETED PEERS LIST ─── */}
            <div className="space-y-4">
              {/* Bucket 1: In This Space */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span>In This Space ({inSpaceProfiles.length})</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Same Venue Geofence
                  </span>
                </div>

                {inSpaceProfiles.map(p => (
                  <div
                    key={p.id}
                    className="rounded-2xl p-3.5 border shadow-xs transition space-y-2.5"
                    style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold" style={{ color: 'var(--text-1)' }}>
                              {p.name}
                            </span>
                            {p.verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20 shrink-0" />}
                            <span className="text-[10px] text-gray-400">{p.handle}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-blue-500/10 text-blue-600 font-semibold shrink-0">
                              {p.mutualConnections} mutuals
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                            {p.bio}
                          </p>
                        </div>
                      </div>

                      {/* Connect Action with Icebreaker Scarcity */}
                      <button
                        onClick={() => setSelectedProfileForInvite(p)}
                        disabled={p.status === 'request_sent'}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition active:scale-95 shrink-0 flex items-center gap-1 ${
                          p.status === 'request_sent'
                            ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {p.status === 'request_sent' ? (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>Sent</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3" />
                            <span>Invite</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Intent Tag Pill */}
                    <div
                      className="px-2.5 py-1 rounded-xl text-[11px] font-medium flex items-center justify-between border"
                      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
                    >
                      <span className="text-blue-600 dark:text-cyan-400 font-semibold">
                        &ldquo;{p.intentTag}&rdquo;
                      </span>
                      <button
                        onClick={() => handleBlockUser(p.id)}
                        className="text-[10px] text-gray-400 hover:text-red-500 transition"
                        title="Block profile"
                      >
                        Hide
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bucket 2: Nearby Right Now */}
              {nearbyProfiles.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span>Nearby Right Now ({nearbyProfiles.length})</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">
                      Proximity Hash
                    </span>
                  </div>

                  {nearbyProfiles.map(p => (
                    <div
                      key={p.id}
                      className="rounded-2xl p-3.5 border shadow-xs transition space-y-2.5"
                      style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)' }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold" style={{ color: 'var(--text-1)' }}>
                                {p.name}
                              </span>
                              {p.verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20 shrink-0" />}
                              <span className="text-[10px] text-gray-400">{p.handle}</span>
                            </div>
                            <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                              {p.bio}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedProfileForInvite(p)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 text-white shadow-xs transition active:scale-95 shrink-0 flex items-center gap-1"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>Invite</span>
                        </button>
                      </div>

                      <div
                        className="px-2.5 py-1 rounded-xl text-[11px] font-medium flex items-center justify-between border"
                        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
                      >
                        <span className="text-blue-600 dark:text-cyan-400 font-semibold">
                          &ldquo;{p.intentTag}&rdquo;
                        </span>
                        <button
                          onClick={() => handleBlockUser(p.id)}
                          className="text-[10px] text-gray-400 hover:text-red-500 transition"
                        >
                          Hide
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ─── MODAL 1: RADAR ACTIVATION & AUTO-EXPIRY CONFIG ─── */}
        {isActivationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div
              className="w-full max-w-md rounded-3xl p-5 border shadow-xl space-y-4"
              style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>
                    Activate Radar Visibility
                  </h3>
                </div>
                <button
                  onClick={() => setIsActivationModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 1. Visibility Scope Mode */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  1. Who Can Discover You
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibilityMode('mutuals')}
                    className={`p-2.5 rounded-2xl border text-left transition active:scale-95 space-y-1 ${
                      visibilityMode === 'mutuals'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--text-1)' }}>
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      <span>Mutuals Only</span>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      Friends-of-friends & verified domain peers only.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisibilityMode('everyone')}
                    className={`p-2.5 rounded-2xl border text-left transition active:scale-95 space-y-1 ${
                      visibilityMode === 'everyone'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--text-1)' }}>
                      <RadarIcon className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Everyone Nearby</span>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      Open local discovery for events, transit, and cafés.
                    </p>
                  </button>
                </div>
              </div>

              {/* 2. Mandatory Auto-Expiry Timer */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    2. Mandatory Safety Timer (Auto-Off)
                  </label>
                  <span className="text-[10px] text-amber-500 font-semibold">
                    Never stays on forever
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {([30, 60, 120] as DurationOption[]).map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setActiveDuration(d)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition active:scale-95 ${
                        activeDuration === d
                          ? 'border-blue-500 bg-blue-600 text-white shadow-xs'
                          : 'border-gray-200 dark:border-zinc-800 text-gray-500'
                      }`}
                    >
                      {d === 30 ? '30 Mins' : d === 60 ? '1 Hour' : '2 Hours'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Mandatory Intent Tag */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  3. Select Intent Tag
                </label>
                <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {INTENT_PRESETS.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setMyIntent(preset)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition active:scale-95 flex items-center justify-between ${
                        myIntent === preset
                          ? 'border-blue-500 bg-blue-500/10 text-blue-600 font-semibold'
                          : 'border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      <span>{preset}</span>
                      {myIntent === preset && <Check className="w-3.5 h-3.5 text-blue-500" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <button
                  type="button"
                  onClick={() => setIsActivationModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border text-gray-500"
                  style={{ borderColor: 'var(--border)' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleActivateRadar(visibilityMode === 'off' ? 'mutuals' : visibilityMode, activeDuration)}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition active:scale-95"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  Turn On for {activeDuration === 30 ? '30m' : activeDuration === 60 ? '1 hour' : '2 hours'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── MODAL 2: SEND INVITE WITH MANDATORY ICEBREAKER NOTE ─── */}
        {selectedProfileForInvite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div
              className="w-full max-w-md rounded-3xl p-5 border shadow-xl space-y-4"
              style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={selectedProfileForInvite.avatar}
                    alt={selectedProfileForInvite.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold" style={{ color: 'var(--text-1)' }}>
                        Connect with {selectedProfileForInvite.name}
                      </span>
                      {selectedProfileForInvite.verified && <BadgeCheck className="w-3 h-3 text-blue-500 fill-blue-500/20" />}
                    </div>
                    <span className="text-[10px] text-gray-400">
                      Intent: &ldquo;{selectedProfileForInvite.intentTag}&rdquo;
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedProfileForInvite(null);
                    setIcebreakerText('');
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scarcity Guardrail Reminder */}
              <div
                className="p-2.5 rounded-xl border flex items-center gap-2 text-xs"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
              >
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-[11px] text-gray-400">
                  <strong className="text-amber-600 dark:text-amber-400">1 of {dailyInvitesLeft} invites</strong> will be used. Slots replenish every 24 hours to prevent spam.
                </span>
              </div>

              {/* Mandatory Icebreaker Input (20–140 chars) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Mandatory Icebreaker Note
                  </label>
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      icebreakerText.trim().length >= 20 ? 'text-emerald-600' : 'text-amber-500'
                    }`}
                  >
                    {icebreakerText.trim().length}/140 chars (min 20)
                  </span>
                </div>
                <textarea
                  value={icebreakerText}
                  onChange={e => setIcebreakerText(e.target.value.slice(0, 140))}
                  placeholder="Introduce yourself and share why you want to connect..."
                  rows={3}
                  className="w-full text-xs p-3 rounded-2xl border outline-none resize-none transition"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-1)'
                  }}
                />

                {/* Helpful Icebreaker Prompt Chips */}
                <div className="flex gap-1.5 flex-wrap pt-0.5">
                  {[
                    'Hey! Also attending the keynote today.',
                    'Saw your tech stack, working on anything cool?',
                    'Up for a quick coffee break chat?'
                  ].map(chip => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setIcebreakerText(chip)}
                      className="text-[10px] px-2 py-0.5 rounded-lg border text-gray-500 hover:text-blue-500 hover:border-blue-400 transition"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      +{chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProfileForInvite(null);
                    setIcebreakerText('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium border text-gray-500"
                  style={{ borderColor: 'var(--border)' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendInvite}
                  disabled={icebreakerText.trim().length < 20 || dailyInvitesLeft <= 0}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  Send Icebreaker Note
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── DRAWER: SANDBOXED RADAR CHAT (STAGE 2 & 3) ─── */}
        {sandboxedChatUser && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div
              className="w-full max-w-xl mx-auto rounded-t-3xl border-t border-x shadow-2xl flex flex-col h-[75vh]"
              style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)' }}
            >
              {/* Header */}
              <div
                className="px-4 py-3 border-b flex items-center justify-between shrink-0"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={sandboxedChatUser.avatar}
                    alt={sandboxedChatUser.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold" style={{ color: 'var(--text-1)' }}>
                        {sandboxedChatUser.name}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                        Sandboxed
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      No phone numbers exchanged yet
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSandboxedChatUser(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Stage 3: Mutual Contact Share Prompt Bar */}
              <div
                className="p-3 border-b flex items-center justify-between gap-3 text-xs shrink-0 select-none"
                style={{
                  backgroundColor: myContactShared && theirContactShared ? 'rgba(16,185,129,0.1)' : 'var(--bg-elevated)',
                  borderColor: 'var(--border)'
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Share2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold truncate" style={{ color: 'var(--text-1)' }}>
                      {myContactShared && theirContactShared
                        ? 'Mutual Opt-In Accepted!'
                        : myContactShared
                        ? 'Waiting for mutual confirmation...'
                        : 'Move to Primary Contacts?'}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {myContactShared && theirContactShared
                        ? 'Saving verified contact & opening in Messages...'
                        : myContactShared
                        ? 'You confirmed. When they confirm, this chat moves to Primary Messages.'
                        : 'Both users must opt in before contact numbers are shared.'}
                    </p>
                  </div>
                </div>

                {!myContactShared ? (
                  <button
                    onClick={handleShareMyContact}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white shadow-xs transition active:scale-95 shrink-0"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    Share Contact
                  </button>
                ) : !theirContactShared ? (
                  <span className="text-[11px] font-semibold text-amber-500 shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3 animate-spin" />
                    <span>Pending...</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-600 shrink-0 flex items-center gap-1">
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Migrated</span>
                  </span>
                )}
              </div>

              {/* Sandboxed Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {sandboxedMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-xs shadow-xs ${
                        msg.sender === 'me'
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : 'bg-white dark:bg-zinc-800 border rounded-bl-xs'
                      }`}
                      style={msg.sender !== 'me' ? { borderColor: 'var(--border)', color: 'var(--text-1)' } : {}}
                    >
                      <p className="leading-relaxed">{msg.text}</p>
                      <span
                        className={`text-[9px] block text-right mt-1 ${
                          msg.sender === 'me' ? 'text-white/70' : 'text-gray-400'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sandboxed Message Composer */}
              <form
                onSubmit={handleSendSandboxedMessage}
                className="p-3 border-t flex items-center gap-2 shrink-0"
                style={{ borderColor: 'var(--border)' }}
              >
                <input
                  type="text"
                  value={sandboxedInput}
                  onChange={e => setSandboxedInput(e.target.value)}
                  placeholder="Send a temporary reply..."
                  className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border outline-none transition"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-1)'
                  }}
                />
                <button
                  type="submit"
                  disabled={!sandboxedInput.trim()}
                  className="p-2.5 rounded-xl text-white shadow-xs transition active:scale-95 disabled:opacity-40"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};