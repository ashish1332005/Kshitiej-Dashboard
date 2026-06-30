import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Activity, Radio, ShieldCheck, SignalHigh } from 'lucide-react';
import { formatNumber } from '../utils/format.js';
import { calculateDeviceHealth, calculateSignalQuality } from '../utils/health.js';

function HeroCommandCenter({ isTelemetryStale, packet, packets, secondsSinceLastPacket }) {
  const health = calculateDeviceHealth(packet, isTelemetryStale);
  const signalQuality = calculateSignalQuality(packet?.lora?.rssi, packet?.lora?.snr);
  const chartData = packets.slice(-36).map((item) => ({
    time: formatChartTime(item.receivedAt),
    g: item.acceleration?.gMagnitude,
    altitude: item.gps?.altitude,
    rssi: item.lora?.rssi
  }));
  const freefallActive = Boolean(packet?.event?.freefall && !isTelemetryStale);
  const lastPacketText =
    secondsSinceLastPacket === null || secondsSinceLastPacket === undefined
      ? 'Waiting'
      : `${secondsSinceLastPacket}s ago`;

  return (
    <section className="overflow-hidden rounded-lg border border-white/10 bg-[#071426] shadow-2xl shadow-black/30">
      <div className="grid gap-0 xl:grid-cols-[0.88fr_1.12fr]">
        <div className="relative min-h-[420px] border-b border-white/10 p-6 sm:p-8 xl:border-b-0 xl:border-r">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(34,197,94,0.16),transparent_30%),radial-gradient(circle_at_82%_26%,rgba(56,189,248,0.18),transparent_32%),linear-gradient(145deg,rgba(15,23,42,0.35),rgba(2,6,23,0.85))]" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold uppercase text-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.9)]" />
                Live rescue telemetry
              </div>
              <h1 className="max-w-3xl text-4xl font-black tracking-normal text-white sm:text-5xl lg:text-6xl">
                AAD Telemetry Command Center
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Real-time fall detection, LoRa signal intelligence, GPS tracking, and incident reports in one field-ready dashboard.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <HeroMetric icon={ShieldCheck} label="Health" value={`${health}/100`} tone="emerald" />
              <HeroMetric icon={SignalHigh} label="Signal" value={`${signalQuality}%`} tone="sky" />
              <HeroMetric icon={Activity} label="Last Packet" value={lastPacketText} tone="amber" />
            </div>
          </div>
        </div>

        <div className="bg-[#0b1d35] p-5 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">Mission Graph</p>
              <h2 className="mt-1 text-2xl font-black text-white">Live movement, altitude, and radio strength</h2>
            </div>
            <div
              className={`inline-flex w-fit items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold ${
                freefallActive
                  ? 'border-rose-300/25 bg-rose-400/10 text-rose-200'
                  : 'border-emerald-300/25 bg-emerald-400/10 text-emerald-200'
              }`}
            >
              <Radio size={16} />
              {freefallActive ? 'Freefall alert' : 'Nominal stream'}
            </div>
          </div>

          <div className="h-[285px] rounded-lg border border-white/10 bg-slate-950/35 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="heroAltitude" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148,163,184,0.14)" strokeDasharray="4 4" />
                <XAxis dataKey="time" minTickGap={28} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} width={36} />
                <Tooltip content={<HeroTooltip />} />
                <Area
                  dataKey="altitude"
                  fill="url(#heroAltitude)"
                  isAnimationActive={false}
                  name="Altitude"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  type="monotone"
                />
                <Line
                  dataKey="g"
                  dot={false}
                  isAnimationActive={false}
                  name="G Force"
                  stroke="#22c55e"
                  strokeWidth={3}
                  type="monotone"
                />
                <Line
                  dataKey="rssi"
                  dot={false}
                  isAnimationActive={false}
                  name="RSSI"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <ChartLegend label="G Force" value={formatNumber(packet?.acceleration?.gMagnitude, ' g', 3)} color="bg-emerald-400" />
            <ChartLegend label="Altitude" value={formatNumber(packet?.gps?.altitude, ' m', 1)} color="bg-sky-400" />
            <ChartLegend label="RSSI" value={formatNumber(packet?.lora?.rssi, ' dBm', 0)} color="bg-amber-400" />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMetric({ icon: Icon, label, tone, value }) {
  const tones = {
    amber: 'border-amber-300/20 bg-amber-400/10 text-amber-200',
    emerald: 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200',
    sky: 'border-sky-300/20 bg-sky-400/10 text-sky-200'
  };

  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/35 p-4 backdrop-blur">
      <div className={`mb-3 grid h-10 w-10 place-items-center rounded-md border ${tones[tone]}`}>
        <Icon size={20} />
      </div>
      <p className="text-xs uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function ChartLegend({ color, label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
      <div className="mb-2 flex items-center gap-2 text-xs uppercase text-slate-400">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        {label}
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function HeroTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm shadow-xl">
      <p className="mb-2 font-semibold text-white">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="text-slate-300">
          <span style={{ color: item.color }}>{item.name}: </span>
          {formatNumber(item.value, item.dataKey === 'rssi' ? ' dBm' : item.dataKey === 'g' ? ' g' : ' m', item.dataKey === 'rssi' ? 0 : 2)}
        </p>
      ))}
    </div>
  );
}

function formatChartTime(value) {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleTimeString([], {
    minute: '2-digit',
    second: '2-digit'
  });
}

export default HeroCommandCenter;
