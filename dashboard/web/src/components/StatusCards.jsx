import { Battery, Gauge, MapPin, Mountain, Radio, Satellite, Zap } from 'lucide-react';
import { formatNumber } from '../utils/format.js';

function Card({ icon: Icon, label, value, subValue, tone = 'green' }) {
  const tones = {
    green: 'text-emerald-300 bg-emerald-400/10',
    yellow: 'text-amber-300 bg-amber-400/10',
    red: 'text-rose-300 bg-rose-400/10',
    blue: 'text-indigo-300 bg-indigo-400/10'
  };

  return (
    <div className="rounded-lg border border-cyan-300/10 bg-[#0b1d35] p-4 shadow-xl shadow-black/20">
      <div className="flex items-center gap-3">
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${tones[tone]}`}>
          <Icon size={21} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase text-slate-400">{label}</p>
          <p className="mt-1 break-words text-xl font-bold leading-tight text-white 2xl:text-2xl">
            {value}
          </p>
          <p className={tone === 'red' ? 'text-sm text-rose-300' : 'text-sm text-emerald-300'}>
            {subValue}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusCards({ packet }) {
  const freefall = packet?.event?.freefall;
  const batteryVoltage = packet?.battery?.voltage;
  const batteryTone = batteryVoltage && batteryVoltage < 3.7 ? 'yellow' : 'green';

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
      <Card
        icon={MapPin}
        label="GPS Status"
        value={packet?.gps?.valid ? '3D Fix' : 'No Fix'}
        subValue={`Satellites: ${packet?.gps?.satellites ?? 0}`}
        tone={packet?.gps?.valid ? 'green' : 'yellow'}
      />
      <Card
        icon={Mountain}
        label="Altitude"
        value={formatNumber(packet?.gps?.altitude, ' m', 1)}
        subValue="Live GPS"
        tone="blue"
      />
      <Card
        icon={Gauge}
        label="Speed"
        value={formatNumber(packet?.gps?.speed, ' km/h', 1)}
        subValue="Current"
        tone="red"
      />
      <Card
        icon={Zap}
        label="G Force"
        value={formatNumber(packet?.acceleration?.gMagnitude, ' G', 2)}
        subValue={freefall ? 'Danger' : 'Normal'}
        tone={freefall ? 'red' : 'blue'}
      />
      <Card
        icon={Battery}
        label="Battery"
        value={formatNumber(batteryVoltage, ' V', 2)}
        subValue={batteryTone === 'yellow' ? 'Low' : 'Good'}
        tone={batteryTone}
      />
      <Card
        icon={Radio}
        label="RSSI"
        value={formatNumber(packet?.lora?.rssi, ' dBm', 0)}
        subValue="Good"
      />
      <Card
        icon={Satellite}
        label="SNR"
        value={formatNumber(packet?.lora?.snr, ' dB', 1)}
        subValue="Good"
        tone="blue"
      />
    </section>
  );
}

export default StatusCards;
