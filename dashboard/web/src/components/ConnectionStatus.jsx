import { AlertTriangle, CheckCircle2, RadioTower, WifiOff } from 'lucide-react';

function stateStyles(color) {
  const styles = {
    green: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    yellow: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
    red: 'border-rose-400/30 bg-rose-400/10 text-rose-200'
  };
  return styles[color];
}

function ConnectionStatus({ socketConnected, isTelemetryStale, secondsSinceLastPacket }) {
  const socketColor = socketConnected ? 'green' : 'red';
  const telemetryColor = isTelemetryStale ? 'yellow' : 'green';
  const packetText =
    secondsSinceLastPacket === null
      ? 'No telemetry received'
      : `Last packet ${secondsSinceLastPacket}s ago`;

  return (
    <section className="grid gap-3 md:grid-cols-2 lg:hidden">
      <div className={`rounded-lg border p-3 backdrop-blur ${stateStyles(socketColor)}`}>
        <div className="flex items-center gap-3">
          {socketConnected ? <CheckCircle2 size={22} /> : <WifiOff size={22} />}
          <div>
            <p className="text-sm opacity-80">Socket.IO</p>
            <p className="text-base font-semibold">
              {socketConnected ? 'Connected' : 'Disconnected'}
            </p>
          </div>
        </div>
      </div>

      <div className={`rounded-lg border p-3 backdrop-blur ${stateStyles(telemetryColor)}`}>
        <div className="flex items-center gap-3">
          {isTelemetryStale ? <AlertTriangle size={22} /> : <RadioTower size={22} />}
          <div>
            <p className="text-sm opacity-80">Telemetry stream</p>
            <p className="text-base font-semibold">{packetText}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ConnectionStatus;
