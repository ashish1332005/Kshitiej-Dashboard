import { Battery, MapPin, Radio, Zap } from 'lucide-react';
import { formatNumber } from '../utils/format.js';
import { getBatteryStatus, getGpsStatus, getMotionStatus, getSignalStatus } from '../utils/health.js';

function DataMeaningPanel({ packet }) {
  const gps = getGpsStatus(packet?.gps);
  const motion = getMotionStatus(packet);
  const battery = getBatteryStatus(packet?.battery?.voltage);
  const signal = getSignalStatus(packet?.lora?.rssi, packet?.lora?.snr);

  return (
    <section className="rounded-lg border border-cyan-300/10 bg-[#0b1d35] p-4 shadow-xl shadow-black/20">
      <div className="mb-4">
        <h2 className="text-sm font-bold uppercase text-white">What The Data Means</h2>
        <p className="text-sm text-slate-400">Plain-language condition summary for non-technical users.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Meaning icon={MapPin} title="GPS" status={gps.label} detail={gps.detail} raw={`${formatNumber(packet?.gps?.latitude, '', 5)}, ${formatNumber(packet?.gps?.longitude, '', 5)}`} />
        <Meaning icon={Zap} title="Motion" status={motion.label} detail={motion.detail} raw={`G force ${formatNumber(packet?.acceleration?.gMagnitude, ' G', 2)}`} />
        <Meaning icon={Battery} title="Battery" status={battery.label} detail={battery.detail} raw={formatNumber(packet?.battery?.voltage, ' V', 2)} />
        <Meaning icon={Radio} title="Signal" status={signal.label} detail={signal.detail} raw={`RSSI ${formatNumber(packet?.lora?.rssi, ' dBm', 0)} / SNR ${formatNumber(packet?.lora?.snr, ' dB', 1)}`} />
      </div>
    </section>
  );
}

function Meaning({ detail, icon: Icon, raw, status, title }) {
  return (
    <div className="rounded-lg border border-cyan-300/10 bg-slate-950/35 p-3">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cyan-400/10 text-cyan-200">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-xs uppercase text-slate-500">{title}</p>
          <p className="text-base font-bold text-white">{status}</p>
          <p className="mt-1 text-sm text-slate-300">{detail}</p>
          <p className="mt-2 text-xs text-slate-500">Raw: {raw}</p>
        </div>
      </div>
    </div>
  );
}

export default DataMeaningPanel;
