import { useEffect } from 'react';
import { Circle, MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';

const defaultPosition = [28.6139, 77.209];

function MapView({
  geofenceCenter,
  geofenceRadius = 500,
  isExpanded = false,
  onToggle,
  packet,
  packets = [],
  showTrack = false
}) {
  const latitude = packet?.gps?.latitude;
  const longitude = packet?.gps?.longitude;
  const gpsValid = Boolean(packet?.gps?.valid);
  const hasPosition = gpsValid && Number.isFinite(latitude) && Number.isFinite(longitude);
  const mapPosition = hasPosition ? [latitude, longitude] : defaultPosition;
  const path = packets
    .filter((item) => item?.gps?.valid && Number.isFinite(item.gps.latitude) && Number.isFinite(item.gps.longitude))
    .slice(-25)
    .map((item) => [item.gps.latitude, item.gps.longitude]);

  return (
    <section className="overflow-hidden rounded-lg border border-cyan-300/10 bg-[#0b1d35] shadow-xl shadow-black/20">
      <div className="flex flex-col gap-2 border-b border-cyan-300/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase text-cyan-300">GPS Location</h2>
          <p className="text-sm text-slate-400">
            {hasPosition
              ? `Live coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
              : 'Waiting for GPS fix. Move device near open sky.'}
          </p>
        </div>
        <div
          className={`rounded border px-3 py-2 text-sm ${
            hasPosition
              ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200'
              : 'border-amber-300/20 bg-amber-400/10 text-amber-200'
          }`}
        >
          {hasPosition ? 'Live tracking' : 'No GPS fix'}
        </div>
      </div>

      <div
        className="relative block w-full cursor-pointer text-left"
        onClick={onToggle}
        title={isExpanded ? 'Close large map' : 'Open large map'}
      >
        <div className={isExpanded ? 'h-[72vh]' : 'h-[420px]'}>
          <MapContainer center={mapPosition} zoom={isExpanded ? 15 : 13} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapRecenter position={mapPosition} />
          {geofenceCenter && (
            <Circle
              center={[geofenceCenter.lat, geofenceCenter.lng]}
              pathOptions={{ color: '#38bdf8', fillColor: '#38bdf8', fillOpacity: 0.08 }}
              radius={geofenceRadius}
            />
          )}
          {showTrack && path.length > 1 && <Polyline positions={path} pathOptions={{ color: '#22c55e', weight: 4 }} />}
          {hasPosition && <Marker position={mapPosition} />}
          </MapContainer>
        </div>

        {!hasPosition && (
          <div className="absolute inset-x-4 top-4 z-[500] rounded-lg border border-amber-300/25 bg-slate-950/85 px-4 py-3 text-sm text-amber-100 shadow-xl backdrop-blur">
            Waiting for GPS fix
          </div>
        )}

        <div className="absolute inset-x-4 bottom-4 z-[500] grid grid-cols-2 gap-3 rounded-lg border border-cyan-300/10 bg-[#071426]/90 p-3 text-xs shadow-xl backdrop-blur sm:grid-cols-4">
          <Metric label="Latitude" value={hasPosition ? latitude.toFixed(6) : 'No fix'} />
          <Metric label="Longitude" value={hasPosition ? longitude.toFixed(6) : 'No fix'} />
          <Metric label="Altitude" value={packet?.gps?.altitude ? `${packet.gps.altitude.toFixed(1)} m` : 'No data'} />
          <Metric label="Speed" value={packet?.gps?.speed ? `${packet.gps.speed.toFixed(1)} km/h` : 'No data'} />
        </div>
        {hasPosition && (
          <a
            className="absolute right-4 top-4 z-[500] rounded-md border border-cyan-300/20 bg-slate-950/85 px-3 py-2 text-xs font-semibold text-cyan-100"
            href={`https://www.google.com/maps?q=${latitude},${longitude}`}
            onClick={(event) => event.stopPropagation()}
            rel="noreferrer"
            target="_blank"
          >
            Open exact location
          </a>
        )}
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}

function MapRecenter({ position }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom(), {
      animate: true
    });
  }, [map, position]);

  return null;
}

export default MapView;
