import React, { useState } from 'react';
import { Check, CheckCircle2, Circle, DollarSign, Lock, Play, Pause, PieChart, Users, CheckSquare, Eye } from 'lucide-react';
import { MiniAppPayload } from '../types';

const card = (extra = '') => `rounded-xl p-3.5 w-full max-w-xs my-1 ${extra}`;

interface MiniAppCardsProps {
  payload: MiniAppPayload;
  currentUserId: string;
  onUpdate: (data: any) => void;
}

export const MiniAppRenderer: React.FC<MiniAppCardsProps> = ({ payload, currentUserId, onUpdate }) => {
  const { type, data } = payload;

  const cardStyle = {
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
  };

  if (type === 'poll') {
    const totalVotes = data.options.reduce((a: number, o: any) => a + o.votes.length, 0);
    const handleVote = (optionId: string) => {
      const opts = data.options.map((o: any) => ({
        ...o,
        votes: o.id === optionId
          ? o.votes.includes(currentUserId) ? o.votes.filter((u: string) => u !== currentUserId) : [...o.votes, currentUserId]
          : o.votes.filter((u: string) => u !== currentUserId)
      }));
      onUpdate({ ...data, options: opts });
    };

    return (
      <div className={card()} style={cardStyle}>
        <div className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
          <PieChart className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
          Poll
          <span className="ml-auto font-normal lowercase">{totalVotes} votes</span>
        </div>
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-1)' }}>{data.question}</p>
        <div className="space-y-2">
          {data.options.map((opt: any) => {
            const voted = opt.votes.includes(currentUserId);
            const pct = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
            return (
              <button key={opt.id} onClick={() => handleVote(opt.id)}
                className="w-full relative overflow-hidden rounded-xl p-2.5 text-left transition text-xs"
                style={{
                  border: `1px solid ${voted ? 'var(--accent)' : 'var(--border)'}`,
                  backgroundColor: voted ? 'var(--accent-subtle)' : 'var(--bg-panel)',
                }}>
                <div className="absolute inset-y-0 left-0 transition-all" style={{ width: `${pct}%`, backgroundColor: 'var(--accent-subtle)' }} />
                <div className="relative flex items-center justify-between z-10">
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
                    {voted
                      ? <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                      : <Circle className="w-4 h-4" style={{ color: 'var(--text-3)' }} />}
                    {opt.label}
                  </div>
                  <span className="font-semibold" style={{ color: 'var(--text-2)' }}>{pct}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === 'bill_split') {
    const togglePaid = (id: string) => onUpdate({ ...data, participants: data.participants.map((p: any) => p.id === id ? { ...p, paid: !p.paid } : p) });
    const allPaid = data.participants.every((p: any) => p.paid);

    return (
      <div className={card()} style={cardStyle}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
            <DollarSign className="w-3.5 h-3.5 text-amber-500" /> Expense
          </div>
          <span className="text-xs font-semibold" style={{ color: 'var(--text-1)' }}>₹{data.totalAmount}</span>
        </div>
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-1)' }}>{data.title}</p>
        <div className="space-y-1.5 mb-3">
          {data.participants.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl text-xs"
              style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2" style={{ color: 'var(--text-2)' }}>
                <Users className="w-3 h-3" style={{ color: 'var(--text-3)' }} />
                {p.name}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium" style={{ color: 'var(--text-2)' }}>₹{p.share}</span>
                {p.paid ? (
                  <button onClick={() => togglePaid(p.id)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium text-green-600"
                    style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <Check className="w-3 h-3" /> Done
                  </button>
                ) : (
                  <button onClick={() => togglePaid(p.id)}
                    className="px-2 py-0.5 rounded-lg text-[11px] font-medium transition"
                    style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)', border: '1px solid var(--border)' }}>
                    Pay
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {allPaid && (
          <p className="text-center text-xs text-green-600 py-1.5 rounded-lg"
            style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
            All settled.
          </p>
        )}
      </div>
    );
  }

  if (type === 'checklist') {
    const toggle = (id: string) => onUpdate({ ...data, items: data.items.map((i: any) => i.id === id ? { ...i, completed: !i.completed } : i) });
    const done = data.items.filter((i: any) => i.completed).length;

    return (
      <div className={card()} style={cardStyle}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
            <CheckSquare className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> Checklist
          </div>
          <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>{done}/{data.items.length}</span>
        </div>
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-1)' }}>{data.title}</p>
        <div className="space-y-1.5">
          {data.items.map((item: any) => (
            <button key={item.id} onClick={() => toggle(item.id)}
              className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition"
              style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-1)' }}>
              {item.completed
                ? <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
                : <Circle className="w-4 h-4 shrink-0" style={{ color: 'var(--text-3)' }} />}
              <span style={item.completed ? { textDecoration: 'line-through', color: 'var(--text-3)' } : {}}>{item.text}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'secret_note') {
    return <SecretNoteCard data={data} onBurn={() => onUpdate({ ...data, burned: true })} />;
  }

  return null;
};

const SecretNoteCard: React.FC<{ data: any; onBurn: () => void }> = ({ data, onBurn }) => {
  const [revealed, setRevealed] = useState(false);
  const [secs, setSecs] = useState(data.expiresInSeconds || 15);

  const reveal = () => {
    if (data.burned) return;
    setRevealed(true);
    const iv = setInterval(() => setSecs((p: number) => { if (p <= 1) { clearInterval(iv); onBurn(); return 0; } return p - 1; }), 1000);
  };

  const cardStyle = { backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' };

  if (data.burned) return (
    <div className="rounded-xl p-3 text-xs flex items-center gap-2" style={{ ...cardStyle, color: 'var(--text-3)' }}>
      <Lock className="w-3.5 h-3.5 shrink-0" /> Message erased.
    </div>
  );

  return (
    <div className="rounded-xl p-3.5 w-full max-w-xs my-1" style={cardStyle}>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
          <Lock className="w-3.5 h-3.5" /> Encrypted Note
        </div>
        {revealed && <span className="text-xs font-mono text-red-500">{secs}s</span>}
      </div>
      {!revealed ? (
        <button onClick={reveal}
          className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs transition active:scale-95"
          style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
          <Eye className="w-3.5 h-3.5" /> Reveal (15s timer)
        </button>
      ) : (
        <div className="p-2.5 rounded-xl text-sm font-mono" style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-1)' }}>
          {data.content}
        </div>
      )}
    </div>
  );
};

export const VoicePlayer: React.FC<{ duration?: number; isMine?: boolean }> = ({ duration = 12, isMine = false }) => {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-2xl w-56"
      style={isMine
        ? { backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }
        : { backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
      <button onClick={() => setPlaying(!playing)}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 transition active:scale-90"
        style={{ backgroundColor: isMine ? 'rgba(255,255,255,0.3)' : 'var(--accent)' }}>
        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
      </button>
      <div className="flex items-center gap-0.5 flex-1 h-5">
        {[40,70,30,90,55,45,80,50,65,35,90,60,40].map((h, i) => (
          <div key={i} className="flex-1 rounded-full transition-all"
            style={{
              height: `${h}%`,
              backgroundColor: isMine
                ? (playing ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)')
                : (playing ? 'var(--accent)' : 'var(--border)')
            }} />
        ))}
      </div>
      <span className="text-[11px] font-mono" style={{ color: isMine ? 'rgba(255,255,255,0.65)' : 'var(--text-3)' }}>
        0:{duration < 10 ? `0${duration}` : duration}
      </span>
    </div>
  );
};
