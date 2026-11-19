import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, FlipHorizontal, Volume2, Shield } from 'lucide-react';
import { Chat, User } from '../types';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: Chat | undefined;
  currentUser: User;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen, onClose, chat, currentUser
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setCallDuration(0);
      setIsConnecting(true);
      return;
    }

    // Attempt to access user media (real camera if available)
    navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
      .then(stream => {
        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        // Fallback gracefully if camera permission denied / not available
      });

    const connectTimeout = setTimeout(() => {
      setIsConnecting(false);
    }, 1500);

    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(connectTimeout);
      clearInterval(timer);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen || !chat) return null;

  const toggleVideo = () => {
    if (streamRef.current) {
      const vTrack = streamRef.current.getVideoTracks()[0];
      if (vTrack) vTrack.enabled = !vTrack.enabled;
    }
    setIsVideoOff(!isVideoOff);
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const aTrack = streamRef.current.getAudioTracks()[0];
      if (aTrack) aTrack.enabled = !aTrack.enabled;
    }
    setIsMuted(!isMuted);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md select-none animate-fadeIn">
      {/* Remote Video / Participant Area (Full Screen) */}
      <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-6 overflow-hidden">

        {/* Background Remote Stream Simulation */}
        <div className="absolute inset-0 z-0">
          <img
            src={chat.avatar}
            alt={chat.name}
            className="w-full h-full object-cover filter blur-2xl scale-125 opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        </div>

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/20">
              <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base sm:text-lg leading-tight">{chat.name}</h3>
              <p className="text-white/60 text-xs flex items-center gap-1.5 mt-0.5">
                <Shield className="w-3 h-3 text-emerald-400" />
                {isConnecting ? 'Connecting peer-to-peer…' : `Encrypted • ${formatTime(callDuration)}`}
              </p>
            </div>
          </div>

          <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/80 text-xs font-mono">
            720p HD
          </div>
        </div>

        {/* Center: Remote avatar pulse if video not active */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 my-6">
          <div className="relative">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden shadow-2xl ring-4 ring-white/20 relative z-10">
              <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
            </div>
            {isConnecting && (
              <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-40" />
            )}
          </div>
          <span className="text-white/70 text-sm mt-4 font-medium">
            {isConnecting ? 'Calling…' : chat.name}
          </span>
        </div>

        {/* Picture-in-Picture Local Self Preview */}
        <div className="absolute bottom-28 right-4 sm:right-6 z-20 w-28 h-40 sm:w-36 sm:h-52 rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-zinc-900">
          {!isVideoOff ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 text-white/50">
              <VideoOff className="w-6 h-6 mb-1" />
              <span className="text-[10px]">Camera off</span>
            </div>
          )}
          <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px]">
            You
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="relative z-20 flex items-center justify-center gap-4 sm:gap-6 py-4">
          {/* Mute Button */}
          <button
            onClick={toggleAudio}
            className={`w-13 h-13 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-95 ${
              isMuted ? 'bg-white text-zinc-900' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Video Toggle Button */}
          <button
            onClick={toggleVideo}
            className={`w-13 h-13 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-95 ${
              isVideoOff ? 'bg-white text-zinc-900' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            title={isVideoOff ? 'Turn video on' : 'Turn video off'}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={onClose}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg transition-all active:scale-90"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>

      </div>
    </div>
  );
};
