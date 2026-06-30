import { formatNumber } from '../utils/format.js';

function GpsPanel({ packet }) {
  const latitude = packet?.gps?.latitude;
  const longitude = packet?.gps?.longitude;
  const gpsValid = Boolean(packet?.gps?.valid);

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.08] p-4 shadow-xl shadow-black/20 backdrop-blur">
      <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">GPS</h2>
          <p className="text-sm text-slate-400">
            {gpsValid ? 'Live position fix available' : 'Waiting for GPS fix'}
          </p>
        </div>
        <div
          className={`rounded border px-3 py-2 text-sm ${
            gpsValid
              ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200'
              : 'border-amber-300/20 bg-amber-400/10 text-amber-200'
          }`}
        >
          {gpsValid ? 'Valid fix' : 'No fix'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-3">
        <Metric label="Latitude" value={formatNumber(latitude, '', 6)} />
        <Metric label="Longitude" value={formatNumber(longitude, '', 6)} />
        <Metric label="Altitude" value={formatNumber(packet?.gps?.altitude, ' m', 1)} />
        <Metric label="Speed" value={formatNumber(packet?.gps?.speed, ' km/h', 1)} />
        <Metric label="Satellites" value={packet?.gps?.satellites ?? 'No data'} />
        <Metric label="Received" value={formatTime(packet?.receivedAt)} />
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-slate-100">{value}</p>
    </div>
  );
}

function formatTime(value) {
  if (!value) {
    return 'No data';
  }
  return new Date(value).toLocaleTimeString();
}

export default GpsPanel;
