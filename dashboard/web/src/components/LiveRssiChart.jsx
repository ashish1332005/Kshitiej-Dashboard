import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { formatNumber } from '../utils/format.js';

function LiveRssiChart({ packets }) {
  const data = packets.map((packet) => ({
    time: formatChartTime(packet.receivedAt),
    rssi: packet.lora?.rssi
  }));
  const latest = packets.at(-1)?.lora?.rssi;

  return (
    <section className="rounded-lg border border-cyan-300/10 bg-[#0b1d35] p-4 shadow-xl shadow-black/20">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase text-white">RSSI Over Time</h2>
          <p className="text-sm text-slate-400">LoRa signal strength</p>
        </div>
        <div className="rounded border border-amber-300/20 bg-amber-400/10 px-3 py-2 text-sm font-semibold text-amber-200">
          {formatNumber(latest, ' dBm', 0)}
        </div>
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid stroke="rgba(148,163,184,0.18)" strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 12 }} minTickGap={24} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} domain={['auto', 'auto']} />
            <Tooltip content={<ChartTooltip label="RSSI" suffix=" dBm" decimals={0} />} />
            <Area
              type="monotone"
              dataKey="rssi"
              stroke="#facc15"
              fill="#facc1533"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function ChartTooltip({ active, payload, label, suffix, decimals }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm shadow-xl">
      <p className="text-slate-400">{label}</p>
      <p className="font-semibold text-white">
        {formatNumber(payload[0].value, suffix, decimals)}
      </p>
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

export default LiveRssiChart;
