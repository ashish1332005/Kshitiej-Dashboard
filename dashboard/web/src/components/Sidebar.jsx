import {
  Activity,
  AlertTriangle,
  BarChart3,
  Map,
  Moon,
  Rocket,
  Settings,
  Sun
} from 'lucide-react';

const navItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'tracking', label: 'Tracking', icon: Map },
  { id: 'analytics', label: 'Analytics', icon: Activity },
  { id: 'events', label: 'Events', icon: AlertTriangle },
  { id: 'logs', label: 'Logs', icon: Settings }
];

function Sidebar({ activeSection, onNavigate, socketConnected }) {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-cyan-300/10 bg-[#071426]/95 px-4 py-5 shadow-2xl shadow-black/30 lg:flex lg:flex-col">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-900 text-white shadow-lg shadow-cyan-950/40">
          <Rocket size={24} />
        </div>
        <div>
          <p className="text-base font-bold uppercase text-white">AAD Telemetry</p>
          <p className="text-xs uppercase tracking-wider text-slate-400">Command Center</p>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`flex h-12 w-full items-center gap-3 rounded-lg px-4 text-left text-sm transition ${
              activeSection === item.id
                ? 'bg-cyan-400/15 text-white shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-300/20'
                : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
            }`}
            onClick={() => onNavigate(item.id)}
            type="button"
          >
            <item.icon size={19} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <section className="rounded-lg border border-cyan-300/10 bg-white/[0.04] p-4">
          <p className="mb-3 text-xs font-semibold uppercase text-white">System Status</p>
          <StatusRow label="Backend" connected={socketConnected} />
          <StatusRow label="Serial Port" connected={socketConnected} />
          <StatusRow label="MongoDB" connected={socketConnected} />
          <StatusRow label="Socket.IO" connected={socketConnected} />
        </section>

        <section className="rounded-lg border border-cyan-300/10 bg-white/[0.04] p-4">
          <p className="mb-3 text-xs font-semibold uppercase text-slate-300">Theme</p>
          <div className="flex items-center gap-3 text-slate-400">
            <Moon size={16} />
            <div className="h-5 w-10 rounded-full bg-cyan-500 p-0.5">
              <div className="h-4 w-4 rounded-full bg-white" />
            </div>
            <Sun size={16} />
          </div>
        </section>

        <p className="px-3 text-xs leading-5 text-slate-500">
          AAD Telemetry System
          <br />
          v1.0.0
        </p>
      </div>
    </aside>
  );
}

function StatusRow({ label, connected }) {
  return (
    <div className="mb-2 flex items-center justify-between text-xs last:mb-0">
      <span className="flex items-center gap-2 text-slate-300">
        <span
          className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-rose-400'}`}
        />
        {label}
      </span>
      <span className={connected ? 'text-emerald-300' : 'text-rose-300'}>
        {connected ? 'Connected' : 'Offline'}
      </span>
    </div>
  );
}

export default Sidebar;

