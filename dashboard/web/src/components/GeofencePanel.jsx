import { MapPinned } from 'lucide-react';
import { distanceMeters } from '../utils/health.js';

function GeofencePanel({ center, packet, radiusMeters }) {
  const current =
    packet?.gps?.valid && Number.isFinite(packet.gps.latitude) && Number.isFinite(packet.gps.longitude)
      ? { lat: packet.gps.latitude, lng: packet.gps.longitude }
      : null;
  const distance = distanceMeters(center, current);
  const outside = Number.isFinite(distance) && distance > radiusMeters;

  return (
    <section className={`rounded-lg border p-4 shadow-xl shadow-black/20 ${outside ? 'border-rose-400/30 bg-rose-500/10' : 'border-cyan-300/10 bg-[#0b1d35]'}`}>
      <div className="flex items-start gap-3">
        <div className={`grid h-11 w-11 place-items-center rounded-full ${outside ? 'bg-rose-400/15 text-rose-200' : 'bg-emerald-400/10 text-emerald-200'}`}>
          <MapPinned size={21} />
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase text-white">Geofence</h2>
          <p className={outside ? 'mt-1 font-bold text-rose-200' : 'mt-1 font-bold text-emerald-200'}>
            {outside ? 'Device left safe area' : current ? 'Inside safe area' : 'Waiting for GPS'}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Safe radius: {radiusMeters} m
            {Number.isFinite(distance) ? `, current distance ${Math.round(distance)} m` : ''}
          </p>
        </div>
      </div>
    </section>
  );
}

export default GeofencePanel;
