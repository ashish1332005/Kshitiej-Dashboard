import { AlertTriangle, ShieldCheck } from 'lucide-react';

function FreefallAlert({ packet }) {
  const freefall = packet?.event?.freefall;
  const alertLevel = packet?.event?.alertLevel ?? 'normal';

  if (freefall) {
    return (
      <section className="flex min-h-[278px] flex-col items-center justify-center rounded-lg border border-rose-400/25 bg-gradient-to-b from-rose-950/50 to-[#0b1d35] p-4 text-center text-rose-100 shadow-xl shadow-rose-950/20">
        <div className="mb-4 grid h-20 w-20 place-items-center rounded-full border border-rose-400/30 bg-rose-500/20 text-rose-300 shadow-lg shadow-rose-950/40">
          <AlertTriangle size={44} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-rose-300">Freefall Alert</p>
          <p className="mt-2 text-xl font-bold uppercase text-rose-300">Freefall Detected</p>
          <p className="mt-2 text-sm text-slate-300">Alert level: {alertLevel}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-emerald-400/20 bg-[#0b1d35] p-4 text-center text-emerald-100 shadow-xl shadow-black/20">
      <div className="mb-3 grid h-16 w-16 place-items-center rounded-full border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
        <ShieldCheck size={34} />
      </div>
      <div>
        <p className="text-xs font-bold uppercase text-emerald-300">Motion Status</p>
        <p className="mt-2 text-xl font-bold text-white">Normal</p>
        <p className="mt-2 text-sm text-slate-300">No fall detected. Alert level: {alertLevel}</p>
      </div>
    </section>
  );
}

export default FreefallAlert;
