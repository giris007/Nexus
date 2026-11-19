import React, { useState } from 'react';
import { X, PieChart, DollarSign, CheckSquare, ShieldAlert, Sparkles } from 'lucide-react';
import { MiniAppPayload } from '../types';

interface MiniAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: MiniAppPayload, textDescription: string) => void;
}

export const MiniAppModal: React.FC<MiniAppModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [tab, setTab] = useState<'poll' | 'bill_split' | 'checklist' | 'secret_note'>('poll');
  const [pollQ, setPollQ] = useState('');
  const [pollOpts, setPollOpts] = useState(['Approve', 'Decline']);
  const [billTitle, setBillTitle] = useState('');
  const [billAmt, setBillAmt] = useState('1200');
  const [splitN, setSplitN] = useState(2);
  const [listTitle, setListTitle] = useState('');
  const [listItems, setListItems] = useState(['Item one', 'Item two']);
  const [secret, setSecret] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'poll') {
      if (!pollQ.trim()) return;
      onSubmit({ type: 'poll', data: { question: pollQ, options: pollOpts.filter(Boolean).map((o, i) => ({ id: `o-${Date.now()}-${i}`, label: o, votes: [] })) } }, `Poll: ${pollQ}`);
    } else if (tab === 'bill_split') {
      if (!billTitle.trim()) return;
      const total = parseFloat(billAmt) || 0;
      onSubmit({ type: 'bill_split', data: { title: billTitle, totalAmount: total, currency: '₹', participants: Array.from({ length: splitN }).map((_, i) => ({ id: i === 0 ? 'user-1' : `m-${i}`, name: i === 0 ? 'You' : `Member ${i + 1}`, share: Math.round(total / splitN), paid: i === 0 })) } }, `Expense: ${billTitle}`);
    } else if (tab === 'checklist') {
      if (!listTitle.trim()) return;
      onSubmit({ type: 'checklist', data: { title: listTitle, items: listItems.filter(Boolean).map((t, i) => ({ id: `t-${Date.now()}-${i}`, text: t, completed: false })) } }, `Checklist: ${listTitle}`);
    } else {
      if (!secret.trim()) return;
      onSubmit({ type: 'secret_note', data: { content: secret, expiresInSeconds: 15, viewed: false } }, `Encrypted Note`);
    }
    onClose();
  };

  const tabs = [
    { id: 'poll' as const,        label: 'Poll',      icon: PieChart },
    { id: 'bill_split' as const,  label: 'Expense',   icon: DollarSign },
    { id: 'checklist' as const,   label: 'Checklist', icon: CheckSquare },
    { id: 'secret_note' as const, label: 'Secret',    icon: ShieldAlert },
  ];

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: '0.75rem',
    padding: '0.625rem 0.875rem',
    fontSize: '0.875rem',
    color: 'var(--text-1)',
    outline: 'none',
    transition: 'border-color 0.15s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: 'var(--text-2)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    marginBottom: '0.25rem',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full sm:max-w-md rounded-t-[28px] sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)' }}>

        {/* Drag handle */}
        <div className="w-full pt-2.5 pb-1 flex justify-center sm:hidden" onClick={onClose}>
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <span className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>Attach Tool</span>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full active:scale-90 transition"
            style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-2)' }}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tab strip */}
        <div className="px-4 py-2" style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
          <div className="grid grid-cols-4 p-1 rounded-xl text-xs font-medium gap-0.5"
            style={{ backgroundColor: 'var(--bg-elevated)' }}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => setTab(id)}
                className="flex flex-col items-center gap-1 py-2 rounded-lg transition-all active:scale-95"
                style={tab === id
                  ? { backgroundColor: 'var(--accent)', color: '#fff' }
                  : { color: 'var(--text-2)' }}>
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 flex-1 overflow-y-auto space-y-4">
          {tab === 'poll' && (
            <>
              <div>
                <label style={labelStyle}>Question</label>
                <input type="text" placeholder="What are we deciding?" value={pollQ}
                  onChange={e => setPollQ(e.target.value)} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Options</label>
                {pollOpts.map((o, i) => (
                  <input key={i} type="text" value={o}
                    onChange={e => { const n = [...pollOpts]; n[i] = e.target.value; setPollOpts(n); }}
                    style={{ ...inputStyle, marginBottom: '0.5rem' }} placeholder={`Option ${i + 1}`} />
                ))}
                {pollOpts.length < 5 && (
                  <button type="button" onClick={() => setPollOpts([...pollOpts, ''])}
                    className="text-xs font-medium active:scale-95 transition" style={{ color: 'var(--accent)' }}>
                    + Add option
                  </button>
                )}
              </div>
            </>
          )}

          {tab === 'bill_split' && (
            <>
              <div>
                <label style={labelStyle}>Expense</label>
                <input type="text" placeholder="What was the expense?" value={billTitle}
                  onChange={e => setBillTitle(e.target.value)} style={inputStyle} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>Total (₹)</label>
                  <input type="number" value={billAmt} onChange={e => setBillAmt(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>People</label>
                  <input type="number" min={2} max={10} value={splitN}
                    onChange={e => setSplitN(+e.target.value || 2)} style={inputStyle} />
                </div>
              </div>
              <div className="p-3 rounded-xl flex justify-between text-xs"
                style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-2)' }}>Per person</span>
                <span className="font-semibold" style={{ color: 'var(--text-1)' }}>₹{Math.round((+billAmt || 0) / (splitN || 1))}</span>
              </div>
            </>
          )}

          {tab === 'checklist' && (
            <>
              <div>
                <label style={labelStyle}>List Title</label>
                <input type="text" placeholder="Name this checklist" value={listTitle}
                  onChange={e => setListTitle(e.target.value)} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Items</label>
                {listItems.map((item, i) => (
                  <input key={i} type="text" value={item}
                    onChange={e => { const n = [...listItems]; n[i] = e.target.value; setListItems(n); }}
                    style={{ ...inputStyle, marginBottom: '0.5rem' }} placeholder={`Task ${i + 1}`} />
                ))}
                <button type="button" onClick={() => setListItems([...listItems, ''])}
                  className="text-xs font-medium active:scale-95 transition" style={{ color: 'var(--accent)' }}>
                  + Add item
                </button>
              </div>
            </>
          )}

          {tab === 'secret_note' && (
            <>
              <div>
                <label style={labelStyle}>Encrypted Content</label>
                <textarea rows={3} placeholder="Sensitive data, credentials, or private notes…" value={secret}
                  onChange={e => setSecret(e.target.value)} style={{ ...inputStyle, resize: 'none' }} required />
              </div>
              <p className="text-xs rounded-xl px-3 py-2.5"
                style={{ color: 'var(--text-2)', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                Self-destructs 15 seconds after the recipient opens it.
              </p>
            </>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm rounded-xl active:scale-95 transition"
              style={{ color: 'var(--text-2)', backgroundColor: 'var(--bg-elevated)' }}>
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm active:scale-95 transition"
              style={{ backgroundColor: 'var(--accent)' }}>
              Attach
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
