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

function LoRaPanel({ packets, latestPacket }) {
  const data = packets.map((packet) => ({
    time: new Date(packet.receivedAt).toLocaleTimeString([], {
      minute: '2-digit',
      second: '2-digit'
    }),
    rssi: packet.lora?.rssi,
    snr: packet.lora?.snr
  }));

  return (
    <section className="rounded-lg border border-cyan-300/10 bg-[#0b1d35] p-4 shadow-xl shadow-black/20">
      <div className="mb-4">
        <h2 className="text-sm font-bold uppercase text-indigo-200">LoRa Signal</h2>
        <p className="text-sm text-slate-400">
          RSSI {formatNumber(latestPacket?.lora?.rssi, ' dBm', 0)} - SNR{' '}
          {formatNumber(latestPacket?.lora?.snr, ' dB', 2)}
        </p>
      </div>

      <div className="h-[210px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
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
            <Area type="monotone" dataKey="rssi" stroke="#22c55e" fill="#22c55e33" />
            <Area type="monotone" dataKey="snr" stroke="#facc15" fill="#facc1533" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default LoRaPanel;
