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

function AccelerationPanel({ packets, latestPacket }) {
  const data = packets.map((packet) => ({
    time: new Date(packet.receivedAt).toLocaleTimeString([], {
      minute: '2-digit',
      second: '2-digit'
    }),
    ax: packet.acceleration?.ax,
    ay: packet.acceleration?.ay,
    az: packet.acceleration?.az,
    gMagnitude: packet.acceleration?.gMagnitude
  }));

  return (
    <section className="rounded-lg border border-cyan-300/10 bg-[#0b1d35] p-4 shadow-xl shadow-black/20">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase text-white">Acceleration (G)</h2>
          <p className="text-sm text-slate-400">
            G magnitude {formatNumber(latestPacket?.acceleration?.gMagnitude, ' g', 3)}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <Axis label="AX" value={latestPacket?.acceleration?.ax} />
          <Axis label="AY" value={latestPacket?.acceleration?.ay} />
          <Axis label="AZ" value={latestPacket?.acceleration?.az} />
        </div>
      </div>

      <div className="h-[210px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(148,163,184,0.18)" strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 12 }} minTickGap={24} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: 8,
                color: '#e2e8f0'
              }}
            />
            <Line type="monotone" dataKey="ax" stroke="#22c55e" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="ay" stroke="#facc15" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="az" stroke="#38bdf8" dot={false} strokeWidth={2} />
            <Line
              type="monotone"
              dataKey="gMagnitude"
              stroke="#fb7185"
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function Axis({ label, value }) {
  return (
    <div className="rounded border border-cyan-300/10 bg-slate-950/40 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold text-white">{formatNumber(value, '', 3)}</p>
    </div>
  );
}

export default AccelerationPanel;
