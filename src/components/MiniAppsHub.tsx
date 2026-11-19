import React from 'react';
import { Compass, Zap, ShoppingBag, Landmark, Coffee, Plane, Code, ArrowUpRight } from 'lucide-react';

const apps = [
  { id: '1', name: 'Nexus Pay', category: 'Fintech', desc: 'Zero-fee peer-to-peer payments, QR settlement, and shared expense tabs.', icon: Landmark, usage: '4.2M users' },
  { id: '2', name: 'Local Dining',  category: 'Local Life', desc: 'Direct table bookings and takeout from neighborhood kitchens.', icon: Coffee, usage: '1.8M users' },
  { id: '3', name: 'Transit Pass', category: 'Mobility', desc: 'Instant QR ticketing for public transit and on-demand ride bookings.', icon: Plane, usage: '3.1M users' },
  { id: '4', name: 'Direct Commerce', category: 'Commerce', desc: 'Factory-direct group orders cutting distributor markups.', icon: ShoppingBag, usage: '890k users' },
  { id: '5', name: 'Code Sandbox', category: 'Productivity', desc: 'Run code snippets and collaborative scratchpads inside team threads.', icon: Code, usage: '650k users' },
  { id: '6', name: 'Language Engine', category: 'AI', desc: 'On-device multilingual translation and voice transcription.', icon: Zap, usage: '2.5M users' },
];

export const MiniAppsHub: React.FC = () => (
  <div className="flex-1 h-full overflow-y-auto p-4 lg:p-8 flex justify-center" style={{ backgroundColor: 'var(--bg)' }}>
    <div className="w-full max-w-4xl space-y-5">
      <div>
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-2)' }}>
          <Compass className="w-3.5 h-3.5" /> Applet Directory
        </div>
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-1)' }}>Integrated Applets</h2>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>Lightweight programs running inside the client without installation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {apps.map(app => {
          const Icon = app.icon;
          return (
            <div key={app.id}
              className="group rounded-2xl p-5 cursor-pointer transition flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(37,99,235,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center transition"
                    style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <Icon className="w-5 h-5 transition" style={{ color: 'var(--text-2)' }} />
                  </div>
                  <span className="text-[11px] px-2 py-1 rounded-lg"
                    style={{ color: 'var(--text-2)', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    {app.category}
                  </span>
                </div>
                <h3 className="font-semibold text-sm flex items-center gap-1" style={{ color: 'var(--text-1)' }}>
                  {app.name}
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
                </h3>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--text-2)' }}>{app.desc}</p>
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between text-xs" style={{ borderTop: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-3)' }}>{app.usage}</span>
                <button className="font-medium transition" style={{ color: 'var(--accent)' }}>Open</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
