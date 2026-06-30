import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { formatNumber } from '../utils/format.js';

function LiveGChart({ packets }) {
  const data = packets.map((packet) => ({
    time: formatChartTime(packet.receivedAt),
    gMagnitude: packet.acceleration?.gMagnitude
  }));
  const latest = packets.at(-1)?.acceleration?.gMagnitude;

  return (
    <section className="rounded-lg border border-cyan-300/10 bg-[#0b1d35] p-4 shadow-xl shadow-black/20">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase text-white">G Force Over Time</h2>
          <p className="text-sm text-slate-400">gMagnitude over time</p>
        </div>
        <div className="rounded border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-200">
          {formatNumber(latest, ' g', 3)}
        </div>
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(148,163,184,0.18)" strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 12 }} minTickGap={24} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} domain={['auto', 'auto']} />
            <Tooltip content={<ChartTooltip label="G" suffix=" g" decimals={3} />} />
            <Line
              type="monotone"
              dataKey="gMagnitude"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
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

export default LiveGChart;
