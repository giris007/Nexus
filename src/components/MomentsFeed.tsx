import React, { useState } from 'react';
import { Heart, MessageSquare, Share2, Image } from 'lucide-react';

interface Moment {
  id: string;
  author: string;
  avatar: string;
  timestamp: string;
  content: string;
  image?: string;
  likes: number;
  comments: { user: string; text: string }[];
}

export const MomentsFeed: React.FC = () => {
  const [moments, setMoments] = useState<Moment[]>([
    {
      id: 'm-1',
      author: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      timestamp: '2 hours ago',
      content: 'Deployed our low-latency matrix message routing architecture across APAC regional nodes.',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
      likes: 24,
      comments: [{ user: 'David Chen', text: 'Verified latency benchmarks. Solid work.' }]
    },
    {
      id: 'm-2',
      author: 'Alex Morgan',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      timestamp: '5 hours ago',
      content: 'Integrating embedded applets directly within conversational threads eliminates cross-app friction entirely.',
      likes: 18,
      comments: []
    }
  ]);
  const [newPost, setNewPost] = useState('');

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setMoments([{ id: `m-${Date.now()}`, author: 'You (Alex)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', timestamp: 'Just now', content: newPost, likes: 0, comments: [] }, ...moments]);
    setNewPost('');
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 lg:p-8 flex justify-center" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="w-full max-w-xl space-y-4">

        {/* Header */}
        <div>
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-1)' }}>Circle Feed</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>Private updates for verified contacts. No algorithmic sorting.</p>
        </div>

        {/* Post composer */}
        <form onSubmit={handlePost} className="rounded-2xl p-4"
          style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
          <textarea
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
            placeholder="Share an update with your network…"
            rows={2}
            className="w-full text-sm p-3 rounded-xl focus:outline-none resize-none transition"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-1)',
              border: '1px solid var(--border)',
            }}
          />
          <div className="flex justify-between items-center mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <button type="button" className="flex items-center gap-1.5 text-xs transition" style={{ color: 'var(--text-2)' }}>
              <Image className="w-3.5 h-3.5" /> Attach media
            </button>
            <button type="submit"
              className="px-4 py-1.5 text-white text-xs font-medium rounded-xl active:scale-95 transition shadow-sm"
              style={{ backgroundColor: 'var(--accent)' }}>
              Publish
            </button>
          </div>
        </form>

        {/* Posts */}
        {moments.map(m => (
          <div key={m.id} className="rounded-2xl p-4 space-y-3"
            style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <img src={m.avatar} alt={m.author} className="w-9 h-9 rounded-full object-cover" />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{m.author}</p>
                <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>{m.timestamp}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-1)' }}>{m.content}</p>
            {m.image && (
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <img src={m.image} alt="" className="w-full object-cover max-h-64" />
              </div>
            )}
            <div className="flex items-center justify-between pt-2 text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-2)' }}>
              <button onClick={() => setMoments(moments.map(x => x.id === m.id ? { ...x, likes: x.likes + 1 } : x))}
                className="flex items-center gap-1.5 hover:text-rose-400 transition">
                <Heart className="w-3.5 h-3.5 text-rose-400/60" />
                {m.likes}
              </button>
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                {m.comments.length}
              </div>
              <button><Share2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
