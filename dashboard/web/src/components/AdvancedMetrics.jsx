import { Activity, HeartPulse, Radio, Split } from 'lucide-react';
import { calculateDeviceHealth, calculateSignalQuality, detectPacketLoss } from '../utils/health.js';

function AdvancedMetrics({ isTelemetryStale, packet, packets }) {
  const signalQuality = calculateSignalQuality(packet?.lora?.rssi, packet?.lora?.snr);
  const health = calculateDeviceHealth(packet, isTelemetryStale);
  const packetLoss = detectPacketLoss(packets);
  const lastGap = packetLoss.gaps.at(-1);

  return (
    <section className="grid gap-4 md:grid-cols-3">
      <ScoreCard icon={HeartPulse} label="Device Health" value={`${health}/100`} detail={healthLabel(health)} tone={health >= 75 ? 'green' : health >= 45 ? 'yellow' : 'red'} />
      <ScoreCard icon={Radio} label="Signal Quality" value={`${signalQuality}%`} detail={signalQuality >= 70 ? 'Good' : signalQuality >= 40 ? 'Weak but connected' : 'Poor'} tone={signalQuality >= 70 ? 'green' : signalQuality >= 40 ? 'yellow' : 'red'} />
      <ScoreCard icon={Split} label="Packet Loss" value={packetLoss.lostPackets} detail={lastGap ? `Expected ${lastGap.expected}, received ${lastGap.received}` : 'No sequence gap detected'} tone={packetLoss.lostPackets === 0 ? 'green' : 'yellow'} />
    </section>
  );
}

function ScoreCard({ detail, icon: Icon, label, tone, value }) {
  const tones = {
    green: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
    yellow: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
    red: 'border-rose-400/20 bg-rose-400/10 text-rose-200'
  };

  return (
    <div className="rounded-lg border border-cyan-300/10 bg-[#0b1d35] p-4 shadow-xl shadow-black/20">
      <div className="flex items-center gap-3">
        <div className={`grid h-11 w-11 place-items-center rounded-full border ${tones[tone]}`}>
          <Icon size={21} />
        </div>
        <div>
          <p className="text-xs uppercase text-slate-400">{label}</p>
          <p className="text-2xl font-black text-white">{value}</p>
          <p className="text-sm text-slate-300">{detail}</p>
        </div>
      </div>
    </div>
  );
}

function healthLabel(score) {
  if (score >= 85) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 45) return 'Needs attention';
  return 'Critical';
}

export default AdvancedMetrics;
