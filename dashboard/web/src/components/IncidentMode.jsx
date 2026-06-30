import { AlertTriangle, MapPin, X } from 'lucide-react';
import MapView from './MapView.jsx';
import { formatNumber } from '../utils/format.js';

function IncidentMode({ acknowledged, currentPacket, eventPacket, onAcknowledge, packets }) {
  if (!eventPacket || acknowledged) {
    return null;
  }

  const livePacket = currentPacket ?? eventPacket;

  return (
    <div className="fixed inset-0 z-[1200] bg-rose-950/85 p-4 backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl flex-col gap-3">
        <section className="rounded-xl border border-rose-300/35 bg-rose-500/20 p-5 text-rose-50 shadow-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-rose-500 text-white">
                <AlertTriangle size={38} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-rose-200">Incident Mode</p>
                <h2 className="text-3xl font-black uppercase text-white">Freefall Detected</h2>
                <p className="mt-2 text-sm text-rose-100">
                  Check the person or device immediately. Event data is frozen below.
                </p>
              </div>
            </div>
            <button
              className="flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-rose-700"
              onClick={onAcknowledge}
              type="button"
            >
              <X size={18} />
              Acknowledge Alert
            </button>
          </div>
        </section>

        <section className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[1fr_360px]">
          <MapView isExpanded packet={livePacket} packets={packets} />
          <div className="rounded-lg border border-rose-300/30 bg-[#0b1d35] p-4">
            <h3 className="text-sm font-bold uppercase text-rose-200">Current Live Location</h3>
            <div className="mt-4 grid gap-3">
              <Metric icon={MapPin} label="Live Location" value={`${formatNumber(livePacket.gps?.latitude, '', 6)}, ${formatNumber(livePacket.gps?.longitude, '', 6)}`} />
              <Metric label="Live Time" value={new Date(livePacket.receivedAt).toLocaleString()} />
            </div>

            <h3 className="mt-5 text-sm font-bold uppercase text-rose-200">Frozen Event Data</h3>
            <div className="mt-4 grid gap-3">
              <Metric icon={MapPin} label="Incident Location" value={`${formatNumber(eventPacket.gps?.latitude, '', 6)}, ${formatNumber(eventPacket.gps?.longitude, '', 6)}`} />
              <Metric label="Detected At" value={new Date(eventPacket.receivedAt).toLocaleString()} />
              <Metric label="G Force" value={formatNumber(eventPacket.acceleration?.gMagnitude, ' G', 2)} />
              <Metric label="Battery" value={formatNumber(eventPacket.battery?.voltage, ' V', 2)} />
              <Metric label="Signal" value={`RSSI ${formatNumber(eventPacket.lora?.rssi, ' dBm', 0)} / SNR ${formatNumber(eventPacket.lora?.snr, ' dB', 1)}`} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
      <p className="flex items-center gap-2 text-xs uppercase text-slate-500">
        {Icon && <Icon size={14} />}
        {label}
      </p>
      <p className="mt-1 font-bold text-white">{value}</p>
    </div>
  );
}

export default IncidentMode;
