import { AlertTriangle, CheckCircle2, Clock, MapPin, Radio, ShieldAlert } from 'lucide-react';
import { formatDuration, getOverallCondition } from '../utils/health.js';

const toneClasses = {
  green: 'border-emerald-400/30 bg-emerald-500/12 text-emerald-100',
  yellow: 'border-amber-400/35 bg-amber-500/12 text-amber-100',
  red: 'border-rose-400/40 bg-rose-500/15 text-rose-100'
};

function SafetySummary({ isTelemetryStale, latestPacket, uptimeMs }) {
  const condition = getOverallCondition({ packet: latestPacket, isTelemetryStale });
  const Icon = condition.tone === 'red' ? ShieldAlert : condition.tone === 'yellow' ? AlertTriangle : CheckCircle2;

  return (
    <section className={`rounded-xl border p-5 shadow-2xl shadow-black/25 ${toneClasses[condition.tone]}`}>
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-slate-950/35">
            <Icon size={30} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide opacity-80">System Status</p>
            <h2 className="mt-1 text-3xl font-black uppercase text-white">{condition.label}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-100">{condition.action}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[560px] xl:grid-cols-4">
          <MiniStatus icon={MapPin} label="GPS" value={condition.gps.label} detail={condition.gps.detail} />
          <MiniStatus icon={ShieldAlert} label="Motion" value={condition.motion.label} detail={condition.motion.detail} />
          <MiniStatus icon={Radio} label="Signal" value={condition.signal.label} detail={condition.signal.detail} />
          <MiniStatus icon={Clock} label="Active Time" value={formatDuration(uptimeMs)} detail="Since first packet loaded" />
        </div>
      </div>
    </section>
  );
}

function MiniStatus({ detail, icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/25 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs uppercase text-slate-300">
        <Icon size={15} />
        {label}
      </div>
      <p className="text-base font-bold text-white">{value}</p>
      <p className="mt-1 line-clamp-2 text-xs text-slate-300">{detail}</p>
    </div>
  );
}

export default SafetySummary;
