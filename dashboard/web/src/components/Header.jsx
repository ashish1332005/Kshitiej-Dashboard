import { Activity, Gauge } from 'lucide-react';

function Header({ latestPacket, packetCount, secondsSinceLastPacket }) {
  const lastPacketText =
    secondsSinceLastPacket === null || secondsSinceLastPacket === undefined
      ? 'waiting'
      : `${secondsSinceLastPacket} sec ago`;

  return (
    <header className="flex min-h-16 flex-col gap-4 border-b border-cyan-300/10 pb-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-normal text-white sm:text-3xl">
            AAD Telemetry Dashboard
          </h1>
          <p className="mt-1 text-xs uppercase tracking-wider text-slate-500 lg:hidden">
            {latestPacket?.deviceId ?? 'Waiting for telemetry'} - {packetCount} packets loaded
          </p>
        </div>
        <span className="hidden items-center gap-2 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300 sm:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          LIVE
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
        <span>Last Packet: {lastPacketText}</span>
        <span>Time: {new Date().toLocaleTimeString()}</span>
        <div className="flex h-14 min-w-52 items-center gap-3 rounded-lg border border-cyan-300/15 bg-[#0b1d35] px-4 shadow-lg shadow-black/20">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-indigo-500/15 text-indigo-300">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400">Packet Count</p>
            <p className="text-lg font-bold text-white">{latestPacket?.sequence ?? packetCount}</p>
          </div>
          <Gauge className="ml-auto text-indigo-300" size={22} />
        </div>
      </div>
    </header>
  );
}

export default Header;
