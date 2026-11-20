import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowBigUp,
  MessageSquare,
  SendHorizontal,
  Volume2,
  VolumeX,
  X,
  ChevronUp,
  ChevronDown,
  Send,
  Play,
  Pause,
  Heart
} from 'lucide-react';

export interface SceneItem {
  id: string;
  videoUrl: string;
  thumbnail: string;
  author: string;
  handle: string;
  avatar: string;
  caption: string;
  musicTitle?: string;
  likes: number;
  isLiked?: boolean;
  commentsCount: number;
  views?: string;
}

interface ScenesViewerProps {
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
  scenes: SceneItem[];
}

interface BurstHeart {
  id: number;
  x: number;
  y: number;
}

export const ScenesViewer: React.FC<ScenesViewerProps> = ({
  isOpen,
  onClose,
  initialIndex = 0,
  scenes
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [scenesData, setScenesData] = useState<SceneItem[]>(scenes);
  const [isOverlayActive, setIsOverlayActive] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [burstHearts, setBurstHearts] = useState<BurstHeart[]>([]);
  const [localComments, setLocalComments] = useState<Record<string, { user: string; text: string; time: string }[]>>({
    'sc-1': [
      { user: 'Alex Morgan', text: 'Clean cinematography and lighting.', time: '10m ago' }
    ]
  });

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const touchStartY = useRef<number | null>(null);
  const lastScrollTime = useRef<number>(0);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapTimeRef = useRef<number>(0);

  const wakeOverlay = useCallback(() => {
    setIsOverlayActive(true);
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    overlayTimerRef.current = setTimeout(() => {
      setIsOverlayActive(false);
    }, 2800);
  }, []);

  useEffect(() => {
    if (isOpen) {
      wakeOverlay();
    }
    return () => {
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    };
  }, [isOpen, currentIndex, wakeOverlay]);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    setScenesData(scenes);
  }, [scenes]);

  // Synchronize active video on slide change
  useEffect(() => {
    if (!isOpen) return;

    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === currentIndex) {
        video.currentTime = 0;
        if (isPlaying) {
          video.play().catch(() => {});
        }
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [currentIndex, isOpen, isPlaying]);

  // Time update listener for active video
  useEffect(() => {
    const activeVideo = videoRefs.current[currentIndex];
    if (!activeVideo) return;

    const handleTime = () => setCurrentTime(activeVideo.currentTime);
    const handleMeta = () => setDuration(activeVideo.duration || 0);

    activeVideo.addEventListener('timeupdate', handleTime);
    activeVideo.addEventListener('loadedmetadata', handleMeta);

    return () => {
      activeVideo.removeEventListener('timeupdate', handleTime);
      activeVideo.removeEventListener('loadedmetadata', handleMeta);
    };
  }, [currentIndex, isOpen]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev < scenesData.length - 1 ? prev + 1 : 0));
  }, [scenesData.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev));
  }, []);

  // Smooth mouse wheel transition
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastScrollTime.current < 450) return;

    if (e.deltaY > 25) {
      lastScrollTime.current = now;
      handleNext();
    } else if (e.deltaY < -25) {
      lastScrollTime.current = now;
      handlePrev();
    }
  };

  const togglePlay = () => {
    const activeVideo = videoRefs.current[currentIndex];
    if (!activeVideo) return;
    if (activeVideo.paused) {
      activeVideo.play().catch(() => {});
      setIsPlaying(true);
    } else {
      activeVideo.pause();
      setIsPlaying(false);
    }
  };

  const toggleVote = () => {
    setScenesData(prev =>
      prev.map((s, idx) => {
        if (idx !== currentIndex) return s;
        const isLiked = !s.isLiked;
        return {
          ...s,
          isLiked,
          likes: isLiked ? s.likes + 1 : Math.max(0, s.likes - 1)
        };
      })
    );
  };

  // Double-tap trigger heart burst & upvote
  const triggerDoubleTap = (clientX: number, clientY: number, containerRect: DOMRect) => {
    const x = clientX - containerRect.left;
    const y = clientY - containerRect.top;

    const newHeart: BurstHeart = { id: Date.now(), x, y };
    setBurstHearts(prev => [...prev, newHeart]);

    setScenesData(prev =>
      prev.map((s, idx) => {
        if (idx !== currentIndex) return s;
        if (s.isLiked) return s;
        return { ...s, isLiked: true, likes: s.likes + 1 };
      })
    );

    setTimeout(() => {
      setBurstHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 850);
  };

  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    wakeOverlay();
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTimeRef.current;
    const containerRect = e.currentTarget.getBoundingClientRect();

    if (timeSinceLastTap < 300) {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
      lastTapTimeRef.current = 0;
      triggerDoubleTap(e.clientX, e.clientY, containerRect);
    } else {
      lastTapTimeRef.current = now;
      tapTimeoutRef.current = setTimeout(() => {
        togglePlay();
        tapTimeoutRef.current = null;
      }, 260);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const activeVideo = videoRefs.current[currentIndex];
    if (!activeVideo || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    activeVideo.currentTime = percentage * duration;
    setCurrentTime(activeVideo.currentTime);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartY.current = null;
  };

  const addComment = () => {
    const currentScene = scenesData[currentIndex];
    if (!commentText.trim() || !currentScene) return;

    setLocalComments(prev => ({
      ...prev,
      [currentScene.id]: [
        ...(prev[currentScene.id] || []),
        { user: 'You', text: commentText.trim(), time: 'Just now' }
      ]
    }));
    setScenesData(prev =>
      prev.map((s, idx) => (idx === currentIndex ? { ...s, commentsCount: s.commentsCount + 1 } : s))
    );
    setCommentText('');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen) return null;

  const currentScene = scenesData[currentIndex] || scenesData[0];
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/50 backdrop-blur-3xl select-none"
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown') handleNext();
        if (e.key === 'ArrowUp') handlePrev();
        if (e.key === 'Escape') onClose();
      }}
      tabIndex={0}
    >
      {/* Ambient Blurred Video Background to eliminate harsh black areas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <img
          src={currentScene.thumbnail}
          alt=""
          className="w-full h-full object-cover filter blur-[90px] scale-150 opacity-60 brightness-90 transition-all duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-black/25" />
      </div>

      {/* Up/Down Desktop Nav Buttons */}
      <div className="hidden md:flex flex-col gap-2 absolute right-6 top-1/2 -translate-y-1/2 z-40">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 text-white transition active:scale-95"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Video Frame Container: full-screen on mobile, centered card on desktop */}
      <div
        className="relative w-full h-full md:max-w-[420px] md:max-h-[92vh] md:rounded-3xl overflow-hidden bg-black shadow-2xl flex flex-col justify-between"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseMove={wakeOverlay}
      >
        {/* Top Header Bar with Close Button and "Scenes" Title (Auto-hides after ~3s, wakes on tap) */}
        <div
          className={`absolute top-0 inset-x-0 z-40 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 via-black/20 to-transparent transition-opacity duration-400 ${
            isOverlayActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/40 text-white/90 hover:text-white transition backdrop-blur-md active:scale-95 shadow-md"
          >
            <X className="w-4 h-4" />
          </button>

          <h2 className="text-sm font-semibold tracking-wide text-white drop-shadow-md">
            Scenes
          </h2>

          {/* Spacer to center title perfectly */}
          <div className="w-8 h-8" />
        </div>

        {/* Animated Sliding Vertical Rail */}
        <div
          className="w-full h-full flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.2,0.9,0.3,1)]"
          style={{ transform: `translateY(-${currentIndex * 100}%)` }}
        >
          {scenesData.map((scene, idx) => (
            <div
              key={scene.id}
              className="w-full h-full shrink-0 relative overflow-hidden bg-black cursor-pointer flex items-center justify-center"
              onClick={handleScreenClick}
            >
              {/* Blurred Ambient Glow Layer to eliminate letterbox black inside the slide */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <img
                  src={scene.thumbnail}
                  alt=""
                  className="w-full h-full object-cover filter blur-3xl scale-150 opacity-60 brightness-90"
                />
                <div className="absolute inset-0 bg-black/25" />
              </div>

              <video
                ref={el => {
                  videoRefs.current[idx] = el;
                }}
                src={scene.videoUrl}
                poster={scene.thumbnail}
                loop
                playsInline
                muted={isMuted}
                className="relative z-10 w-full h-full object-cover pointer-events-none"
              />

              {/* Center Play Icon when Paused */}
              {!isPlaying && idx === currentIndex && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/25 pointer-events-none">
                  <div className="p-4 rounded-full bg-black/60 backdrop-blur-md text-white/95">
                    <Play className="w-8 h-8 fill-current ml-0.5" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Double-Tap Heart Burst */}
        {burstHearts.map(h => (
          <div
            key={h.id}
            className="absolute z-40 pointer-events-none animate-heart-burst"
            style={{ top: `${h.y}px`, left: `${h.x}px` }}
          >
            <Heart className="w-20 h-20 fill-red-500 text-red-500 drop-shadow-xl" />
          </div>
        ))}

        {/* Bottom Control Bar Overlay */}
        <div
          className="absolute inset-x-0 bottom-0 z-30 p-4 pb-2.5 pt-12 bg-gradient-to-t from-black/55 via-black/20 to-transparent flex flex-col gap-2.5 text-white pointer-events-none"
          onClick={e => e.stopPropagation()}
        >
          {/* Author & Caption + Control Buttons Container (Auto-dims to 25% for maximum video visibility) */}
          <div
            className={`space-y-2.5 pointer-events-auto transition-opacity duration-400 ${
              isOverlayActive ? 'opacity-100' : 'opacity-25 hover:opacity-100'
            }`}
          >
            {/* Author & Caption */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <img
                  src={currentScene.avatar}
                  alt={currentScene.author}
                  className="w-6 h-6 rounded-full object-cover border border-white/40 shadow-sm"
                />
                <span className="font-semibold text-xs text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  {currentScene.author}
                </span>
                <span className="text-[11px] text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {currentScene.handle}
                </span>
              </div>
              <p className="text-xs text-white/95 line-clamp-2 leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                {currentScene.caption}
              </p>
            </div>

            {/* Clean Controls: Heart Like Pill, Comments, Share, and Corner Mute */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Clean Heart Like Pill */}
                <div className="flex items-center bg-black/40 hover:bg-black/60 rounded-xl p-0.5 backdrop-blur-md border border-white/10 shadow-sm">
                  <button
                    onClick={toggleVote}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition active:scale-95 ${
                      currentScene.isLiked ? 'text-red-500 font-semibold' : 'text-white/90'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${currentScene.isLiked ? 'fill-current text-red-500' : ''}`} />
                    <span>{currentScene.likes}</span>
                  </button>
                </div>

                {/* Comments Pill */}
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 hover:bg-black/60 rounded-xl text-xs font-medium text-white/90 transition backdrop-blur-md border border-white/10 active:scale-95 shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-white/70" />
                  <span>{currentScene.commentsCount}</span>
                </button>

                {/* Share Button */}
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 hover:bg-black/60 rounded-xl text-xs font-medium text-white/90 transition backdrop-blur-md border border-white/10 active:scale-95 shadow-sm"
                >
                  <SendHorizontal className="w-3.5 h-3.5 text-white/70" />
                  <span>Share</span>
                </button>
              </div>

              {/* Corner Bottom Mute Button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white/90 transition backdrop-blur-md border border-white/10 active:scale-95 shadow-sm"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Timeline Progress Bar at Bottom (Edge-to-Edge with Scrubbing) */}
          <div className="space-y-1 pt-0.5 pointer-events-auto">
            <div
              onClick={handleSeek}
              className="relative w-full h-1 bg-white/25 hover:h-2 rounded-full cursor-pointer transition-all flex items-center group"
            >
              <div
                className="h-full rounded-full bg-red-500 relative transition-all duration-75"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition" />
              </div>
            </div>
            <div className="flex justify-between text-[9px] text-white/60 font-mono px-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Comments Drawer */}
        {showComments && (
          <div
            className="absolute inset-x-0 bottom-0 h-[60%] bg-black/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl z-40 p-4 flex flex-col text-white shadow-2xl animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
              <span className="text-xs font-semibold tracking-wide text-white/80 uppercase">
                Comments ({localComments[currentScene.id]?.length || 0})
              </span>
              <button onClick={() => setShowComments(false)} className="p-1 hover:text-white/60">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 scrollbar-none">
              {(localComments[currentScene.id] || []).map((c, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {c.user[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white/90">{c.user}</span>
                      <span className="text-[10px] text-white/40">{c.time}</span>
                    </div>
                    <p className="text-white/80 mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addComment()}
                className="flex-1 bg-white/10 text-xs px-3 py-2 rounded-xl text-white placeholder-white/40 focus:outline-none"
              />
              <button
                onClick={addComment}
                disabled={!commentText.trim()}
                className="p-2 rounded-xl bg-blue-600 text-white disabled:opacity-40 active:scale-95 transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
