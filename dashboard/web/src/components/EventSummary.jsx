import { AlertTriangle, Clock, MapPin, ShieldCheck } from 'lucide-react';
import { formatNumber } from '../utils/format.js';

function EventSummary({ packets }) {
  const freefallEvents = packets.filter((packet) => packet?.event?.freefall);
  const lastEvent = freefallEvents.at(-1);

  return (
    <section className="rounded-lg border border-cyan-300/10 bg-[#0b1d35] p-4 shadow-xl shadow-black/20">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase text-white">Freefall Event Summary</h2>
          <p className="text-sm text-slate-400">Shows what happened at the time of freefall detection.</p>
        </div>
        <div className={`rounded-md px-3 py-2 text-sm font-bold ${freefallEvents.length ? 'bg-rose-400/15 text-rose-200' : 'bg-emerald-400/15 text-emerald-200'}`}>
          {freefallEvents.length} events
        </div>
      </div>

      {!lastEvent ? (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-300/10 bg-emerald-400/10 p-4 text-emerald-100">
          <ShieldCheck size={24} />
          <div>
            <p className="font-bold">No freefall detected in current data</p>
            <p className="text-sm text-emerald-200">Device motion is currently normal.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <EventMetric icon={AlertTriangle} label="Detected At" value={formatTime(lastEvent.receivedAt)} />
          <EventMetric icon={Clock} label="Sequence" value={lastEvent.sequence ?? 'No data'} />
          <EventMetric icon={MapPin} label="Location" value={`${formatNumber(lastEvent.gps?.latitude, '', 5)}, ${formatNumber(lastEvent.gps?.longitude, '', 5)}`} />
          <EventMetric icon={AlertTriangle} label="G Force" value={formatNumber(lastEvent.acceleration?.gMagnitude, ' G', 2)} />
          <EventMetric label="Battery" value={formatNumber(lastEvent.battery?.voltage, ' V', 2)} />
          <EventMetric label="Signal" value={`RSSI ${formatNumber(lastEvent.lora?.rssi, ' dBm', 0)} / SNR ${formatNumber(lastEvent.lora?.snr, ' dB', 1)}`} />
        </div>
      )}
    </section>
  );
}

function EventMetric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-cyan-300/10 bg-slate-950/35 p-3">
      <p className="flex items-center gap-2 text-xs uppercase text-slate-500">
        {Icon && <Icon size={14} />}
        {label}
      </p>
      <p className="mt-1 font-bold text-white">{value}</p>
    </div>
  );
}

function formatTime(value) {
  if (!value) {
    return 'No data';
  }
  return new Date(value).toLocaleString();
}

export default EventSummary;
