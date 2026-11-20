import React, { useState, useRef } from 'react';
import {
  Heart,
  MessageSquare,
  SendHorizontal,
  Bookmark,
  MoreHorizontal,
  Image as ImageIcon,
  Film,
  Send,
  Plus,
  X,
  BadgeCheck,
  Repeat2,
  Sparkles,
  Globe,
  UserCheck,
  UserPlus,
  Flame,
  TrendingUp
} from 'lucide-react';
import { RedditVideoPlayer } from './RedditVideoPlayer';
import { ScenesViewer, SceneItem } from './ScenesViewer';

interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  timestamp: string;
}

interface Moment {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  verified?: boolean;
  role?: string;
  timestamp: string;
  content: string;
  tags?: string[];
  image?: string;
  video?: string;
  likes: number;
  isLiked?: boolean;
  reposts?: number;
  isReposted?: boolean;
  isBookmarked?: boolean;
  comments: Comment[];
}

interface CreatorProfile {
  name: string;
  handle: string;
  avatar: string;
  verified: boolean;
  bio: string;
  followers: string;
  tag: string;
}

const SUGGESTED_CREATORS: CreatorProfile[] = [
  {
    name: 'Priya Sharma',
    handle: '@priyasharma',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    verified: true,
    bio: 'Distributed systems & edge routing lead',
    followers: '28.4K',
    tag: 'Systems'
  },
  {
    name: 'Sarah Lin',
    handle: '@sarahlin',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    verified: true,
    bio: 'UI/UX Designer & spatial media creator',
    followers: '42.1K',
    tag: 'Design'
  },
  {
    name: 'Marcus Vance',
    handle: '@marcusv',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    verified: false,
    bio: 'Cinematographer & 60fps drone pilot',
    followers: '19.8K',
    tag: 'Cinema'
  },
  {
    name: 'Elena Rostova',
    handle: '@elenarostova',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    verified: true,
    bio: 'AI Safety & LLM runtime researcher',
    followers: '35.6K',
    tag: 'AI/ML'
  }
];

interface Story {
  id: string;
  name: string;
  avatar: string;
  hasUnseen: boolean;
  isSelf?: boolean;
}

const INITIAL_STORIES: Story[] = [
  { id: 's-self', name: 'Your story', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', hasUnseen: false, isSelf: true },
  { id: 's-1', name: 'Priya', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', hasUnseen: true },
  { id: 's-2', name: 'David', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', hasUnseen: true },
  { id: 's-3', name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80', hasUnseen: false },
  { id: 's-4', name: 'Marcus', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', hasUnseen: true },
];

const INITIAL_SCENES: SceneItem[] = [
  {
    id: 'sc-1',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&auto=format&fit=crop&q=80',
    author: 'Priya Sharma',
    handle: '@priyasharma',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    caption: 'Tokyo late-night architecture run under wet neon reflections.',
    likes: 1240,
    isLiked: false,
    commentsCount: 88
  },
  {
    id: 'sc-2',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    author: 'Marcus Vance',
    handle: '@marcusv',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    caption: 'Chasing coastline swells at sunrise. 60fps slow-motion capture.',
    likes: 3890,
    isLiked: true,
    commentsCount: 142
  },
  {
    id: 'sc-3',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&auto=format&fit=crop&q=80',
    author: 'Sarah Lin',
    handle: '@sarahlin',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    caption: 'Studio setup test with multi-cam switching and zero latency preview on Nexus.',
    likes: 852,
    isLiked: false,
    commentsCount: 39
  },
  {
    id: 'sc-4',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    author: 'David Chen',
    handle: '@davidc',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    caption: 'Live acoustic session in the sound booth. Tuning the audio DSP algorithms.',
    likes: 2130,
    isLiked: false,
    commentsCount: 95
  }
];

export const MomentsFeed: React.FC = () => {
  const [feedTab, setFeedTab] = useState<'forYou' | 'following'>('forYou');
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'scenes' | 'media'>('all');
  const [followingHandles, setFollowingHandles] = useState<string[]>(['@priyasharma']);
  const [scenes, setScenes] = useState<SceneItem[]>(INITIAL_SCENES);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);

  const [moments, setMoments] = useState<Moment[]>([
    {
      id: 'm-1',
      author: 'Priya Sharma',
      handle: '@priyasharma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      verified: true,
      role: 'Staff Systems Architect @nexus',
      timestamp: '2h ago',
      content: 'Deployed our matrix message routing architecture across APAC regional edge nodes. Average round-trip latency dropped below 14ms across real-time test clusters.',
      tags: ['#DistributedSystems', '#APAC', '#Edge'],
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80',
      likes: 124,
      isLiked: false,
      reposts: 38,
      isReposted: false,
      isBookmarked: false,
      comments: [
        {
          id: 'c-1',
          user: 'David Chen',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
          text: 'Verified latency benchmarks. Solid work.',
          timestamp: '1h ago'
        }
      ]
    },
    {
      id: 'm-2',
      author: 'Alex Morgan',
      handle: '@alexm',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      verified: true,
      role: 'Core OS Designer',
      timestamp: '5h ago',
      content: 'Integrating embedded applets directly within conversational threads eliminates cross-app friction entirely. Polls, expense splitting, and secret notes run seamlessly inside chat.',
      tags: ['#UX', '#OperatingSystem', '#Design'],
      likes: 89,
      isLiked: true,
      reposts: 19,
      isReposted: false,
      isBookmarked: true,
      comments: []
    },
    {
      id: 'm-3',
      author: 'David Chen',
      handle: '@davidc',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      verified: false,
      role: 'Digital Filmmaker & Audio DSP',
      timestamp: '1d ago',
      content: 'Sunrise over Tokyo headquarters before the product reveal keynote. Thrilled to roll out the new responsive interface today.',
      tags: ['#Tokyo', '#Keynote', '#NexusOS'],
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1000&auto=format&fit=crop&q=80',
      likes: 215,
      isLiked: false,
      reposts: 47,
      isReposted: false,
      isBookmarked: false,
      comments: []
    }
  ]);

  const [newPostText, setNewPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleFollow = (handle: string) => {
    setFollowingHandles(prev =>
      prev.includes(handle) ? prev.filter(h => h !== handle) : [...prev, handle]
    );
  };

  const toggleRepost = (id: string) => {
    setMoments(prev =>
      prev.map(m => {
        if (m.id !== id) return m;
        const isReposted = !m.isReposted;
        return {
          ...m,
          isReposted,
          reposts: (m.reposts || 0) + (isReposted ? 1 : -1)
        };
      })
    );
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() && !selectedImage) return;

    const newMoment: Moment = {
      id: `m-${Date.now()}`,
      author: 'Alex Morgan',
      handle: '@alexm',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      verified: true,
      role: 'Core OS Designer',
      timestamp: 'Just now',
      content: newPostText.trim(),
      tags: ['#NexusPublic'],
      image: selectedImage || undefined,
      likes: 0,
      isLiked: false,
      reposts: 0,
      isReposted: false,
      isBookmarked: false,
      comments: []
    };

    setMoments([newMoment, ...moments]);
    setNewPostText('');
    setSelectedImage(null);
  };

  const toggleLike = (id: string) => {
    setMoments(prev =>
      prev.map(m => {
        if (m.id !== id) return m;
        const isLiked = !m.isLiked;
        return {
          ...m,
          isLiked,
          likes: isLiked ? m.likes + 1 : Math.max(0, m.likes - 1)
        };
      })
    );
  };

  const toggleBookmark = (id: string) => {
    setMoments(prev =>
      prev.map(m => (m.id === id ? { ...m, isBookmarked: !m.isBookmarked } : m))
    );
  };

  const toggleComments = (id: string) => {
    setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddComment = (momentId: string) => {
    const text = commentInputs[momentId]?.trim();
    if (!text) return;

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      user: 'Alex Morgan',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      text,
      timestamp: 'Just now'
    };

    setMoments(prev =>
      prev.map(m => (m.id === momentId ? { ...m, comments: [...m.comments, newComment] } : m))
    );
    setCommentInputs(prev => ({ ...prev, [momentId]: '' }));
    setExpandedComments(prev => ({ ...prev, [momentId]: true }));
  };

  const openScene = (index: number) => {
    setSelectedSceneIndex(index);
    setIsViewerOpen(true);
  };

  const displayedMoments = moments.filter(m => {
    if (feedTab === 'following' && !followingHandles.includes(m.handle) && m.handle !== '@alexm') {
      return false;
    }
    if (activeSubTab === 'media') return Boolean(m.image || m.video);
    return true;
  });

  return (
    <div className="flex-1 h-full overflow-y-auto flex flex-col items-center" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="w-full max-w-xl px-3 sm:px-4 py-4 space-y-4">
        {/* Top Header & Public Feed View Tabs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-1)' }}>
                  Public Square
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5" />
                  Global
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-2)' }}>
                Discover public creators and trending discussions
              </p>
            </div>

            {/* Sub format filters (All, Scenes, Media) */}
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
              <button
                onClick={() => setActiveSubTab('all')}
                className="px-2.5 py-1 text-xs rounded-lg font-medium transition"
                style={{
                  backgroundColor: activeSubTab === 'all' ? 'var(--accent)' : 'transparent',
                  color: activeSubTab === 'all' ? '#fff' : 'var(--text-2)'
                }}
              >
                All
              </button>
              <button
                onClick={() => setActiveSubTab('scenes')}
                className="px-2.5 py-1 text-xs rounded-lg font-medium transition flex items-center gap-1"
                style={{
                  backgroundColor: activeSubTab === 'scenes' ? 'var(--accent)' : 'transparent',
                  color: activeSubTab === 'scenes' ? '#fff' : 'var(--text-2)'
                }}
              >
                <Film className="w-3 h-3" />
                Scenes
              </button>
              <button
                onClick={() => setActiveSubTab('media')}
                className="px-2.5 py-1 text-xs rounded-lg font-medium transition"
                style={{
                  backgroundColor: activeSubTab === 'media' ? 'var(--accent)' : 'transparent',
                  color: activeSubTab === 'media' ? '#fff' : 'var(--text-2)'
                }}
              >
                Media
              </button>
            </div>
          </div>

          {/* Primary Public Feed View Switcher: For You vs Following */}
          <div className="grid grid-cols-2 p-1 rounded-2xl border bg-black/5 dark:bg-white/5" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => setFeedTab('forYou')}
              className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 ${
                feedTab === 'forYou' ? 'bg-white dark:bg-zinc-800 shadow-xs' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
              style={feedTab === 'forYou' ? { color: 'var(--text-1)' } : {}}
            >
              <Flame className={`w-3.5 h-3.5 ${feedTab === 'forYou' ? 'text-amber-500' : ''}`} />
              <span>For You (Explore)</span>
            </button>

            <button
              onClick={() => setFeedTab('following')}
              className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 ${
                feedTab === 'following' ? 'bg-white dark:bg-zinc-800 shadow-xs' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
              style={feedTab === 'following' ? { color: 'var(--text-1)' } : {}}
            >
              <UserCheck className={`w-3.5 h-3.5 ${feedTab === 'following' ? 'text-blue-500' : ''}`} />
              <span>Following</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-blue-500/10 text-blue-600">
                {followingHandles.length}
              </span>
            </button>
          </div>
        </div>

        {/* Stories / Status Strip */}
        <div
          className="rounded-2xl p-3 flex gap-3 overflow-x-auto scrollbar-none items-center"
          style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)' }}
        >
          {INITIAL_STORIES.map(story => (
            <div key={story.id} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group">
              <div className="relative">
                <div
                  className="w-13 h-13 rounded-full p-[2px] transition group-hover:scale-105"
                  style={{
                    background: story.isSelf
                      ? 'var(--border)'
                      : story.hasUnseen
                      ? 'linear-gradient(135deg, #3b82f6, #06b6d4, #10b981)'
                      : 'var(--border)'
                  }}
                >
                  <img
                    src={story.avatar}
                    alt={story.name}
                    className="w-full h-full rounded-full object-cover"
                    style={{ border: '2px solid var(--bg-panel)' }}
                  />
                </div>
                {story.isSelf && (
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
                    style={{ backgroundColor: 'var(--accent)', border: '2px solid var(--bg-panel)' }}
                  >
                    <Plus className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </div>
              <span className="text-[11px] font-medium truncate max-w-[60px]" style={{ color: 'var(--text-2)' }}>
                {story.name}
              </span>
            </div>
          ))}
        </div>

        {/* Suggested Creators Carousel (Spotlight to follow) */}
        {feedTab === 'forYou' && (
          <div
            className="rounded-2xl p-3 border shadow-xs space-y-2.5 overflow-hidden"
            style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--text-1)' }}>
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Featured Creators to Follow</span>
              </div>
              <span className="text-[10px] text-gray-400 font-medium">Public Directory</span>
            </div>

            <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1">
              {SUGGESTED_CREATORS.map(c => {
                const isFollowing = followingHandles.includes(c.handle);
                return (
                  <div
                    key={c.handle}
                    className="rounded-xl p-3 border flex flex-col items-center text-center shrink-0 w-36 space-y-2 transition shadow-xs"
                    style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
                  >
                    <div className="relative">
                      <img src={c.avatar} alt={c.name} className="w-11 h-11 rounded-full object-cover" />
                      {c.verified && (
                        <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/20 absolute -bottom-1 -right-1" />
                      )}
                    </div>
                    <div className="min-w-0 w-full">
                      <p className="text-xs font-bold truncate leading-tight" style={{ color: 'var(--text-1)' }}>
                        {c.name}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">{c.handle}</p>
                      <p className="text-[9px] text-blue-500 font-semibold mt-0.5">{c.followers}</p>
                    </div>
                    <button
                      onClick={() => toggleFollow(c.handle)}
                      className={`w-full py-1 rounded-lg text-[11px] font-semibold transition active:scale-95 ${
                        isFollowing
                          ? 'border border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-gray-300'
                          : 'bg-blue-600 text-white shadow-xs'
                      }`}
                    >
                      {isFollowing ? 'Following' : '+ Follow'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SCENES TAB: 2-Column Grid */}
        {activeSubTab === 'scenes' && (
          <div className="grid grid-cols-2 gap-3 pb-12 animate-fade-in">
            {scenes.map((scene, index) => (
              <div
                key={scene.id}
                onClick={() => openScene(index)}
                className="group relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition duration-200 border"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-panel)' }}
              >
                <img
                  src={scene.thumbnail}
                  alt={scene.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 p-3 space-y-1 text-white">
                  <p className="text-xs font-medium line-clamp-2 leading-snug drop-shadow-sm text-white/95">
                    {scene.caption}
                  </p>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <img
                      src={scene.avatar}
                      alt={scene.author}
                      className="w-4 h-4 rounded-full object-cover border border-white/30"
                    />
                    <span className="text-[10px] text-white/70 truncate">
                      {scene.author}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FEED POSTS (For 'all' and 'media' tabs) */}
        {activeSubTab !== 'scenes' && (
          <>
            {/* Post Composer */}
            <form
              onSubmit={handlePublish}
              className="rounded-2xl p-4 transition shadow-xs"
              style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)' }}
            >
              <div className="flex gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                  alt="Alex Morgan"
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400">
                    <span>Alex Morgan (@alexm)</span>
                    <span>•</span>
                    <span className="text-blue-500 flex items-center gap-1">
                      <Globe className="w-2.5 h-2.5" />
                      Public Post
                    </span>
                  </div>
                  <textarea
                    value={newPostText}
                    onChange={e => setNewPostText(e.target.value)}
                    placeholder="Broadcast an update to your public followers..."
                    rows={2}
                    className="w-full text-sm p-3 rounded-xl focus:outline-none resize-none transition"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      color: 'var(--text-1)',
                      border: '1px solid var(--border)'
                    }}
                  />

                  {/* Selected Image Preview */}
                  {selectedImage && (
                    <div className="relative rounded-xl overflow-hidden max-h-52 w-fit border" style={{ borderColor: 'var(--border)' }}>
                      <img src={selectedImage} alt="Upload preview" className="max-h-52 object-contain" />
                      <button
                        type="button"
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Composer Actions */}
                  <div className="flex justify-between items-center pt-1">
                    <div className="flex items-center gap-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-80 transition"
                        style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-1)', border: '1px solid var(--border)' }}
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                        <span>Photo</span>
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={!newPostText.trim() && !selectedImage}
                      className="px-4 py-1.5 text-xs font-semibold rounded-xl text-white active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                      style={{ backgroundColor: 'var(--accent)' }}
                    >
                      Publish Post
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Empty State when Following Tab is empty */}
            {displayedMoments.length === 0 && feedTab === 'following' && (
              <div
                className="rounded-2xl p-8 border text-center space-y-3"
                style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)' }}
              >
                <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-blue-500/10 text-blue-500">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>
                    No posts from followed creators yet
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                    Follow public creators, researchers, and builders to curate your custom timeline.
                  </p>
                </div>
                <button
                  onClick={() => setFeedTab('forYou')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-xs"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  Explore Public Feed
                </button>
              </div>
            )}

            {/* Posts Stream */}
            <div className="space-y-4 pb-12">
              {displayedMoments.map(m => {
                const isFollowing = followingHandles.includes(m.handle);
                const isMe = m.handle === '@alexm';

                return (
                  <article
                    key={m.id}
                    className="rounded-2xl p-4 space-y-3 transition border shadow-xs"
                    style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)' }}
                  >
                    {/* Post Header: Author, Handle, Verified Badge & Follow Button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={m.avatar} alt={m.author} className="w-10 h-10 rounded-full object-cover shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold tracking-tight truncate" style={{ color: 'var(--text-1)' }}>
                              {m.author}
                            </span>
                            {m.verified && (
                              <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/20 shrink-0" />
                            )}
                            <span className="text-xs text-gray-400 truncate">
                              {m.handle}
                            </span>
                            <span className="text-gray-400 text-xs">•</span>
                            <span className="text-[11px] text-gray-400 shrink-0">
                              {m.timestamp}
                            </span>
                          </div>
                          {m.role && (
                            <p className="text-[11px] text-gray-400 truncate font-medium">
                              {m.role}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!isMe && (
                          <button
                            onClick={() => toggleFollow(m.handle)}
                            className={`px-3 py-1 rounded-xl text-xs font-semibold transition active:scale-95 ${
                              isFollowing
                                ? 'border border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:bg-red-500/10 hover:text-red-600 hover:border-red-400'
                                : 'bg-blue-600 text-white shadow-xs'
                            }`}
                          >
                            {isFollowing ? 'Following' : '+ Follow'}
                          </button>
                        )}
                        <button className="p-1.5 rounded-lg hover:opacity-70 transition text-gray-400">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Post Content */}
                    <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-1)' }}>
                      {m.content}
                    </p>

                    {/* Post Tags */}
                    {m.tags && m.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {m.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Image Attachment */}
                    {m.image && (
                      <div className="rounded-xl overflow-hidden border max-h-96 flex items-center justify-center bg-black/5" style={{ borderColor: 'var(--border)' }}>
                        <img
                          src={m.image}
                          alt=""
                          className="w-full h-auto max-h-96 object-cover hover:scale-[1.01] transition duration-200"
                        />
                      </div>
                    )}

                    {/* Actions Bar: Like, Comment, Repost, Bookmark, Share */}
                    <div
                      className="flex items-center justify-between pt-2.5 text-xs"
                      style={{ borderTop: '1px solid var(--border)', color: 'var(--text-2)' }}
                    >
                      <div className="flex items-center gap-5">
                        {/* Like Button */}
                        <button
                          onClick={() => toggleLike(m.id)}
                          className="flex items-center gap-1.5 transition active:scale-95"
                          style={{ color: m.isLiked ? '#ef4444' : 'inherit' }}
                        >
                          <Heart className={`w-4 h-4 ${m.isLiked ? 'fill-current text-red-500' : ''}`} />
                          <span className="font-semibold text-xs">{m.likes}</span>
                        </button>

                        {/* Comment Button */}
                        <button
                          onClick={() => toggleComments(m.id)}
                          className="flex items-center gap-1.5 hover:opacity-80 transition active:scale-95"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="font-semibold text-xs">{m.comments.length}</span>
                        </button>

                        {/* Repost / Boost Button */}
                        <button
                          onClick={() => toggleRepost(m.id)}
                          className="flex items-center gap-1.5 hover:opacity-80 transition active:scale-95"
                          style={{ color: m.isReposted ? '#10b981' : 'inherit' }}
                        >
                          <Repeat2 className="w-4 h-4" />
                          <span className="font-semibold text-xs">{m.reposts || 0}</span>
                        </button>

                        {/* Direct Share */}
                        <button className="flex items-center gap-1.5 hover:opacity-80 transition active:scale-95">
                          <SendHorizontal className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Bookmark Button */}
                      <button
                        onClick={() => toggleBookmark(m.id)}
                        className="hover:opacity-80 transition active:scale-95"
                        style={{ color: m.isBookmarked ? 'var(--accent)' : 'inherit' }}
                      >
                        <Bookmark className={`w-4 h-4 ${m.isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Expandable Comments Thread */}
                    {expandedComments[m.id] && (
                      <div className="pt-2 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
                        {m.comments.length > 0 && (
                          <div className="space-y-2">
                            {m.comments.map(c => (
                              <div key={c.id} className="flex gap-2.5 items-start text-xs">
                                <img src={c.avatar} alt={c.user} className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5" />
                                <div
                                  className="flex-1 p-2.5 rounded-xl space-y-0.5"
                                  style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold" style={{ color: 'var(--text-1)' }}>
                                      {c.user}
                                    </span>
                                    <span className="text-[10px]" style={{ color: 'var(--text-2)' }}>
                                      {c.timestamp}
                                    </span>
                                  </div>
                                  <p style={{ color: 'var(--text-1)' }}>{c.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Comment Input */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Write a public reply..."
                            value={commentInputs[m.id] || ''}
                            onChange={e => setCommentInputs({ ...commentInputs, [m.id]: e.target.value })}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddComment(m.id);
                              }
                            }}
                            className="flex-1 text-xs px-3 py-2 rounded-xl focus:outline-none transition"
                            style={{
                              backgroundColor: 'var(--bg-elevated)',
                              color: 'var(--text-1)',
                              border: '1px solid var(--border)'
                            }}
                          />
                          <button
                            onClick={() => handleAddComment(m.id)}
                            disabled={!commentInputs[m.id]?.trim()}
                            className="p-2 rounded-xl text-white transition active:scale-95 disabled:opacity-40"
                            style={{ backgroundColor: 'var(--accent)' }}
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        )}

        {/* Full-screen Vertical Swipe Scenes Viewer with Reddit-style video controls */}
        <ScenesViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          initialIndex={selectedSceneIndex}
          scenes={scenes}
        />
      </div>
    </div>
  );
};
