import { formatNumber } from '../utils/format.js';

function TelemetryTable({ packets }) {
  const rows = packets.slice(-12).reverse();

  return (
    <section className="overflow-hidden rounded-lg border border-cyan-300/10 bg-[#0b1d35] shadow-xl shadow-black/20">
      <div className="border-b border-cyan-300/10 p-4">
        <h2 className="text-sm font-bold uppercase text-white">
          Telemetry Log <span className="font-normal text-slate-400">(Latest 10)</span>
        </h2>
      </div>
      <div className="max-h-80 overflow-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="sticky top-0 bg-slate-950/80 text-slate-400">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Device</th>
              <th className="px-4 py-3">Seq</th>
              <th className="px-4 py-3">GPS</th>
              <th className="px-4 py-3">G</th>
              <th className="px-4 py-3">Freefall</th>
              <th className="px-4 py-3">RSSI</th>
              <th className="px-4 py-3">Battery</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((packet) => (
              <tr key={packet.id ?? `${packet.deviceId}-${packet.sequence}`} className="border-t border-cyan-300/10">
                <td className="px-4 py-3 text-slate-300">{formatDate(packet.receivedAt)}</td>
                <td className="px-4 py-3 font-medium text-white">{packet.deviceId}</td>
                <td className="px-4 py-3 text-slate-300">{packet.sequence}</td>
                <td className="px-4 py-3 text-slate-300">
                  {formatNumber(packet.gps?.latitude, '', 4)}, {formatNumber(packet.gps?.longitude, '', 4)}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {formatNumber(packet.acceleration?.gMagnitude, '', 3)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-1 text-xs font-semibold ${
                      packet.event?.freefall
                        ? 'bg-rose-400/15 text-rose-200'
                        : 'bg-emerald-400/15 text-emerald-200'
                    }`}
                  >
                    {packet.event?.freefall ? 'YES' : 'NO'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300">{formatNumber(packet.lora?.rssi, '', 0)}</td>
                <td className="px-4 py-3 text-slate-300">
                  {formatNumber(packet.battery?.voltage, ' V', 2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="p-6 text-center text-sm text-slate-400">Waiting for telemetry packets</div>
        )}
      </div>
    </section>
  );
}

function formatDate(value) {
  if (!value) {
    return 'No data';
  }
  return new Date(value).toLocaleTimeString();
}

export default TelemetryTable;
