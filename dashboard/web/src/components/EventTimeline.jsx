import { AlertTriangle, Battery, CheckCircle2, MapPin, Radio, Rocket } from 'lucide-react';

function EventTimeline({ packets }) {
  const events = buildTimeline(packets).slice(-12).reverse();

  return (
    <section className="rounded-lg border border-cyan-300/10 bg-[#0b1d35] p-4 shadow-xl shadow-black/20">
      <div className="mb-4">
        <h2 className="text-sm font-bold uppercase text-white">Event Timeline</h2>
        <p className="text-sm text-slate-400">Important device condition changes.</p>
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <div key={`${event.type}-${event.time}-${event.message}`} className="flex gap-3">
            <div className={`mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full ${event.color}`}>
              <event.icon size={16} />
            </div>
            <div>
              <p className="font-semibold text-white">{event.message}</p>
              <p className="text-xs text-slate-500">{new Date(event.time).toLocaleString()}</p>
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="text-sm text-slate-400">Waiting for timeline events.</p>}
      </div>
    </section>
  );
}

function buildTimeline(packets) {
  const events = [];
  const first = packets[0];
  if (first) {
    events.push({
      type: 'start',
      time: first.receivedAt,
      message: 'Device started sending telemetry',
      icon: Rocket,
      color: 'bg-indigo-400/15 text-indigo-200'
    });
  }

  let hadGps = false;
  let signalWeak = false;
  let batteryLow = false;
  let wasFreefall = false;

  for (const packet of packets) {
    if (packet.gps?.valid && !hadGps) {
      hadGps = true;
      events.push({ type: 'gps', time: packet.receivedAt, message: 'GPS fix acquired', icon: MapPin, color: 'bg-emerald-400/15 text-emerald-200' });
    }

    if (Number.isFinite(packet.lora?.rssi) && packet.lora.rssi < -100 && !signalWeak) {
      signalWeak = true;
      events.push({ type: 'signal', time: packet.receivedAt, message: 'Signal became weak', icon: Radio, color: 'bg-amber-400/15 text-amber-200' });
    }

    if (Number.isFinite(packet.battery?.voltage) && packet.battery.voltage < 3.7 && !batteryLow) {
      batteryLow = true;
      events.push({ type: 'battery', time: packet.receivedAt, message: 'Battery needs attention', icon: Battery, color: 'bg-amber-400/15 text-amber-200' });
    }

    if (packet.event?.freefall && !wasFreefall) {
      wasFreefall = true;
      events.push({ type: 'freefall', time: packet.receivedAt, message: 'Freefall detected', icon: AlertTriangle, color: 'bg-rose-400/15 text-rose-200' });
    }

    if (!packet.event?.freefall && wasFreefall) {
      wasFreefall = false;
      events.push({ type: 'normal', time: packet.receivedAt, message: 'Motion returned to normal', icon: CheckCircle2, color: 'bg-emerald-400/15 text-emerald-200' });
    }
  }

  return events;
}

export default EventTimeline;
