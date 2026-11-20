import React, { useState, useEffect } from 'react';
import {
  Radar as RadarIcon,
  Wifi,
  Train,
  Plane,
  Coffee,
  ShieldCheck,
  UserPlus,
  Check,
  Send,
  Sparkles,
  MapPin,
  RefreshCw,
  Bell,
  Edit3,
  X
} from 'lucide-react';

interface NearbyUser {
  id: string;
  name: string;
  avatar: string;
  distance: string;
  locationTag: string;
  activity: string;
  angle: number; // for circular radar plot (degrees)
  radiusPercent: number; // distance from center (percent)
  status: 'idle' | 'request_sent' | 'connected';
}

const INITIAL_NEARBY_USERS: NearbyUser[] = [
  {
    id: 'nb-1',
    name: 'Rohan Mehta',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    distance: '8m away',
    locationTag: 'Coach B4 • Seat 24',
    activity: 'Working on React & Rust',
    angle: 40,
    radiusPercent: 58,
    status: 'idle'
  },
  {
    id: 'nb-2',
    name: 'Sneha Patel',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    distance: '12m away',
    locationTag: 'Coach B4 • Seat 48',
    activity: 'Listening to Lo-Fi playlist',
    angle: 155,
    radiusPercent: 72,
    status: 'idle'
  },
  {
    id: 'nb-3',
    name: 'Vikram Rao',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    distance: '18m away',
    locationTag: 'Coach B3 • Vestibule',
    activity: 'Reading Sci-Fi novels',
    angle: 275,
    radiusPercent: 86,
    status: 'idle'
  }
];

interface RadarViewProps {
  onStartChatWithUser?: (userName: string, userAvatar: string) => void;
}

export const RadarView: React.FC<RadarViewProps> = ({ onStartChatWithUser }) => {
  const [isDiscoverable, setIsDiscoverable] = useState(true);
  const [selectedMode, setSelectedMode] = useState<'train' | 'flight' | 'cafe'>('train');
  const [isScanning, setIsScanning] = useState(true);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>(INITIAL_NEARBY_USERS);
  const [incomingRequest, setIncomingRequest] = useState<NearbyUser | null>(null);

  // My Travel Location & Broadcast Tag
  const [myTag, setMyTag] = useState({
    coach: 'B4',
    seat: '24',
    status: 'Open to chat & share hotspot'
  });
  const [isEditingTag, setIsEditingTag] = useState(false);
  const [tagForm, setTagForm] = useState(myTag);

  // Simulate an incoming request after 5 seconds to demonstrate the experience
  useEffect(() => {
    const timer = setTimeout(() => {
      setIncomingRequest({
        id: 'nb-4',
        name: 'Maya Sen',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        distance: '4m away',
        locationTag: 'Seat 28B',
        activity: 'Heading to Bengaluru Tech Week',
        angle: 90,
        radiusPercent: 30,
        status: 'idle'
      });
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  const handleSendRequest = (id: string) => {
    setNearbyUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, status: 'request_sent' } : u))
    );
    setTimeout(() => {
      setNearbyUsers(prev =>
        prev.map(u => (u.id === id ? { ...u, status: 'connected' } : u))
      );
    }, 2000);
  };

  const handleAcceptIncoming = () => {
    if (incomingRequest) {
      setNearbyUsers(prev => [{ ...incomingRequest, status: 'connected' }, ...prev]);
      if (onStartChatWithUser) {
        onStartChatWithUser(incomingRequest.name, incomingRequest.avatar);
      }
      setIncomingRequest(null);
    }
  };

  const triggerRescan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto flex flex-col items-center select-none" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="w-full max-w-xl px-3 sm:px-4 py-4 space-y-4">
        {/* Top Header & Discoverability Switch */}
        <div className="flex items-center justify-between pb-1">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--text-1)' }}>
                Nexus Radar
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                P2P Mesh
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-2)' }}>
              Discover travelers nearby without exchanging phone numbers
            </p>
          </div>

          {/* Discoverable Toggle */}
          <button
            onClick={() => setIsDiscoverable(!isDiscoverable)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition active:scale-95 text-xs font-medium"
            style={{
              backgroundColor: isDiscoverable ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-panel)',
              borderColor: isDiscoverable ? '#22c55e' : 'var(--border)',
              color: isDiscoverable ? '#16a34a' : 'var(--text-2)'
            }}
          >
            <span className={`w-2 h-2 rounded-full ${isDiscoverable ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
            <span>{isDiscoverable ? 'Visible' : 'Hidden'}</span>
          </button>
        </div>

        {/* Travel Mode Pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {[
            { id: 'train' as const, label: 'Train / Coach', icon: Train, note: 'Coach B4 Local Mesh' },
            { id: 'flight' as const, label: 'Flight / Airplane', icon: Plane, note: 'Wi-Fi Offline Mesh' },
            { id: 'cafe' as const, label: 'Station / Cafe', icon: Coffee, note: 'Proximity 100m' }
          ].map(mode => {
            const Icon = mode.icon;
            const isSelected = selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  setSelectedMode(mode.id);
                  triggerRescan();
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition active:scale-95 shrink-0 shadow-xs"
                style={{
                  backgroundColor: isSelected ? 'var(--accent)' : 'var(--bg-panel)',
                  borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                  color: isSelected ? '#ffffff' : 'var(--text-1)'
                }}
              >
                <Icon className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-semibold leading-tight">{mode.label}</div>
                  <div className={`text-[9px] ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>{mode.note}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* My Travel Location & Broadcast Tag Card */}
        <div
          className="rounded-2xl p-3 border shadow-xs transition"
          style={{
            backgroundColor: 'var(--bg-panel)',
            borderColor: 'var(--border)'
          }}
        >
          {!isEditingTag ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-600 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: 'var(--text-1)' }}>
                      Coach {myTag.coach} • Seat {myTag.seat}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">
                      Broadcasting
                    </span>
                  </div>
                  <p className="text-[11px] truncate" style={{ color: 'var(--text-2)' }}>
                    &ldquo;{myTag.status}&rdquo;
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setTagForm(myTag);
                  setIsEditingTag(true);
                }}
                className="px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition active:scale-95 shrink-0 hover:bg-black/5 dark:hover:bg-white/5"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text-1)'
                }}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Change Seat</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold" style={{ color: 'var(--text-1)' }}>
                  Set My Seat & Coach
                </span>
                <button
                  onClick={() => setIsEditingTag(false)}
                  className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-2)' }}>
                    Coach / Cabin
                  </label>
                  <input
                    type="text"
                    value={tagForm.coach}
                    onChange={e => setTagForm({ ...tagForm, coach: e.target.value })}
                    placeholder="e.g. B4, C1, 14"
                    className="w-full px-2.5 py-1.5 rounded-xl text-xs border outline-none font-medium"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-1)'
                    }}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-2)' }}>
                    Seat / Berth
                  </label>
                  <input
                    type="text"
                    value={tagForm.seat}
                    onChange={e => setTagForm({ ...tagForm, seat: e.target.value })}
                    placeholder="e.g. 24, 18B"
                    className="w-full px-2.5 py-1.5 rounded-xl text-xs border outline-none font-medium"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-1)'
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-2)' }}>
                  Status / Activity
                </label>
                <input
                  type="text"
                  value={tagForm.status}
                  onChange={e => setTagForm({ ...tagForm, status: e.target.value })}
                  placeholder="e.g. Open to chat, heading to Delhi..."
                  className="w-full px-2.5 py-1.5 rounded-xl text-xs border outline-none font-medium"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-1)'
                  }}
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingTag(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium border"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMyTag(tagForm);
                    setIsEditingTag(false);
                    triggerRescan();
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white shadow-xs active:scale-95 transition"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  Save & Broadcast
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Simulated Incoming Connection Request Banner */}
        {incomingRequest && (
          <div
            className="p-3.5 rounded-2xl border shadow-lg animate-pop space-y-2.5 relative overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--accent)'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--accent)' }}>
                <Bell className="w-3.5 h-3.5 animate-bounce" />
                <span>Nearby Traveler Wants to Connect</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-medium">
                {incomingRequest.distance}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={incomingRequest.avatar}
                alt={incomingRequest.name}
                className="w-10 h-10 rounded-full object-cover border-2"
                style={{ borderColor: 'var(--accent)' }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: 'var(--text-1)' }}>
                  {incomingRequest.name}
                </p>
                <p className="text-[11px] truncate" style={{ color: 'var(--text-2)' }}>
                  {incomingRequest.locationTag} • {incomingRequest.activity}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleAcceptIncoming}
                className="flex-1 py-1.5 px-3 rounded-xl text-white text-xs font-semibold shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept & Open Chat</span>
              </button>
              <button
                onClick={() => setIncomingRequest(null)}
                className="py-1.5 px-4 rounded-xl text-xs font-medium border transition active:scale-95"
                style={{
                  backgroundColor: 'var(--bg-panel)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-2)'
                }}
              >
                Ignore
              </button>
            </div>
          </div>
        )}

        {/* Central Circular Radar Graphic Display */}
        <div
          className="rounded-3xl p-5 border flex flex-col items-center justify-center relative overflow-hidden shadow-xs"
          style={{
            backgroundColor: 'var(--bg-panel)',
            borderColor: 'var(--border)'
          }}
        >
          {/* True 1:1 Circular Radar Dial Scope - Luminous Theme-Adaptive Glass */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full flex items-center justify-center overflow-hidden border border-blue-200/80 dark:border-cyan-500/30 bg-gradient-to-b from-blue-50/70 to-slate-100/90 dark:from-[#090d16] dark:to-[#050811] shadow-inner">
            {/* Subtle Crosshairs */}
            <div className="absolute inset-x-0 top-1/2 h-px bg-blue-500/20 dark:bg-cyan-500/20 pointer-events-none" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-blue-500/20 dark:bg-cyan-500/20 pointer-events-none" />

            {/* Concentric Distance Rings with Micro Distance Badges */}
            <div className="absolute w-[86%] h-[86%] rounded-full border border-dashed border-blue-500/30 dark:border-cyan-500/30 pointer-events-none flex items-start justify-center pt-1">
              <span className="text-[8px] font-mono font-bold text-blue-600/80 dark:text-cyan-400/80">20m</span>
            </div>
            <div className="absolute w-[60%] h-[60%] rounded-full border border-blue-500/25 dark:border-cyan-500/25 pointer-events-none flex items-start justify-center pt-1">
              <span className="text-[8px] font-mono font-bold text-blue-600/80 dark:text-cyan-400/80">10m</span>
            </div>
            <div className="absolute w-[36%] h-[36%] rounded-full border border-blue-500/30 dark:border-cyan-500/30 pointer-events-none flex items-start justify-center pt-1">
              <span className="text-[8px] font-mono font-bold text-blue-600/80 dark:text-cyan-400/80">5m</span>
            </div>

            {/* Sonar Ripple Pulse Waves */}
            {isScanning && (
              <>
                <div
                  className="absolute w-28 h-28 rounded-full border border-blue-500/35 dark:border-cyan-400/40 animate-ping pointer-events-none"
                  style={{ animationDuration: '3s' }}
                />
                <div
                  className="absolute w-44 h-44 rounded-full border border-blue-500/25 dark:border-cyan-500/30 animate-ping pointer-events-none"
                  style={{ animationDuration: '3.6s', animationDelay: '1.2s' }}
                />
              </>
            )}

            {/* Sweeping Circular Radar Beam (Rotating Scanner) */}
            {isScanning && (
              <div
                className="absolute inset-0 rounded-full pointer-events-none animate-spin"
                style={{
                  animationDuration: '3.8s',
                  background: 'conic-gradient(from 0deg, rgba(37, 99, 235, 0.35) 0deg, rgba(37, 99, 235, 0.06) 55deg, transparent 70deg, transparent 360deg)'
                }}
              />
            )}

            {/* Center (Current User) */}
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
                <span className="text-[8px] font-bold text-blue-600 dark:text-cyan-300 font-mono mt-0.5 bg-blue-50/90 dark:bg-black/70 px-1 rounded-sm border border-blue-200/50 dark:border-white/10">
                  {myTag.coach ? `${myTag.coach}-${myTag.seat}` : `Seat ${myTag.seat}`}
                </span>
              </div>
            </div>

            {/* Discovered Users Plotted on Radar Canvas */}
            {nearbyUsers.map(user => {
              const rad = (user.angle * Math.PI) / 180;
              const maxRadius = 120; // 120px usable radius from center
              const dist = (user.radiusPercent / 100) * maxRadius;
              const x = Math.cos(rad) * dist;
              const y = Math.sin(rad) * dist;

              return (
                <div
                  key={user.id}
                  onClick={() => handleSendRequest(user.id)}
                  className="absolute z-20 flex flex-col items-center cursor-pointer group transition-transform duration-300 hover:scale-110 active:scale-95"
                  style={{
                    transform: `translate(${x}px, ${y}px)`
                  }}
                >
                  <div className="relative">
                    <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-pulse pointer-events-none" />
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="relative w-8 h-8 rounded-full object-cover border-2 border-emerald-500 shadow-md group-hover:border-blue-400 transition"
                    />
                    {user.status === 'connected' && (
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-bold shadow-xs">
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center mt-1 px-1.5 py-0.5 rounded-lg bg-white/95 dark:bg-black/85 text-gray-900 dark:text-white backdrop-blur-md shadow-sm border border-black/10 dark:border-white/15 max-w-[96px] text-center">
                    <span className="text-[9px] font-bold truncate w-full">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className="text-[7.5px] text-blue-600 dark:text-cyan-300 font-mono font-semibold leading-none truncate w-full">
                      {user.locationTag.replace('Coach ', '')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Discovered Travelers List */}
        <div className="space-y-3 pb-12">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>
              Nearby Travelers ({nearbyUsers.length})
            </h2>
            <button
              onClick={triggerRescan}
              className="flex items-center gap-1 text-xs font-medium hover:opacity-80 transition"
              style={{ color: 'var(--accent)' }}
            >
              <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
              <span>Rescan</span>
            </button>
          </div>

          {nearbyUsers.map(user => (
            <div
              key={user.id}
              className="rounded-2xl p-3.5 flex items-center justify-between gap-3 transition border shadow-xs"
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderColor: 'var(--border)'
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-11 h-11 rounded-full object-cover border border-white/20"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-black" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-1)' }}>
                      {user.name}
                    </p>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/15 shrink-0">
                      {user.distance}
                    </span>
                  </div>
                  <p className="text-[11px] truncate" style={{ color: 'var(--text-2)' }}>
                    {user.locationTag} • {user.activity}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              {user.status === 'idle' && (
                <button
                  onClick={() => handleSendRequest(user.id)}
                  className="px-3 py-1.5 rounded-xl text-white text-xs font-medium shadow-xs transition active:scale-95 shrink-0 flex items-center gap-1"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Connect</span>
                </button>
              )}

              {user.status === 'request_sent' && (
                <span className="text-xs font-medium text-amber-500 shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Sent...</span>
                </span>
              )}

              {user.status === 'connected' && (
                <button
                  onClick={() => onStartChatWithUser && onStartChatWithUser(user.name, user.avatar)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 shrink-0 flex items-center gap-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                >
                  <Send className="w-3 h-3" />
                  <span>Chat</span>
                </button>
              )}
            </div>
          ))}

          {/* Privacy Note */}
          <div
            className="p-3 rounded-2xl flex items-center gap-2.5 text-xs border"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border)',
              color: 'var(--text-2)'
            }}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              Zero phone numbers or personal IDs are exposed. Devices only detect ephemeral cryptographic tokens over the local subnet.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
