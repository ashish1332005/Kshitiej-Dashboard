import { useEffect, useMemo, useState } from 'react';
import AccelerationPanel from './components/AccelerationPanel.jsx';
import AdvancedMetrics from './components/AdvancedMetrics.jsx';
import ConnectionStatus from './components/ConnectionStatus.jsx';
import DataMeaningPanel from './components/DataMeaningPanel.jsx';
import DeviceSelector from './components/DeviceSelector.jsx';
import EventSummary from './components/EventSummary.jsx';
import EventTimeline from './components/EventTimeline.jsx';
import FreefallAlert from './components/FreefallAlert.jsx';
import GeofencePanel from './components/GeofencePanel.jsx';
import GpsPanel from './components/GpsPanel.jsx';
import Header from './components/Header.jsx';
import HeroCommandCenter from './components/HeroCommandCenter.jsx';
import IncidentMode from './components/IncidentMode.jsx';
import LiveAltitudeChart from './components/LiveAltitudeChart.jsx';
import LiveGChart from './components/LiveGChart.jsx';
import LiveRssiChart from './components/LiveRssiChart.jsx';
import LoRaPanel from './components/LoRaPanel.jsx';
import MapView from './components/MapView.jsx';
import ReplayControls from './components/ReplayControls.jsx';
import ReportExport from './components/ReportExport.jsx';
import SafetySummary from './components/SafetySummary.jsx';
import Sidebar from './components/Sidebar.jsx';
import StatusCards from './components/StatusCards.jsx';
import SystemLog from './components/SystemLog.jsx';
import TelemetryTable from './components/TelemetryTable.jsx';
import { fetchTelemetry } from './api';
import { createTelemetrySocket } from './socket';
import { applyFallRisk } from './utils/fallDetection.js';

const showSimulatorPackets = import.meta.env.VITE_SHOW_SIMULATOR === 'true';

function isDisplayablePacket(packet) {
  return showSimulatorPackets || packet?.packet?.raw?.source !== 'simulator';
}

function App() {
  const [packets, setPackets] = useState([]);
  const [latestPacket, setLatestPacket] = useState(null);
  const [lastLivePacket, setLastLivePacket] = useState(null);
  const [systemLog, setSystemLog] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [lastPacketAt, setLastPacketAt] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [incidentMuted, setIncidentMuted] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const [replayPlaying, setReplayPlaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState(1000);
  const [selectedDevice, setSelectedDevice] = useState('latest');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let ignore = false;

    fetchTelemetry()
      .then((history) => {
        if (ignore) {
          return;
        }

        const rows = (Array.isArray(history) ? history : []).filter(isDisplayablePacket);
        const latest = rows.at(-1) ?? null;
        setPackets(rows);
        setLatestPacket(latest);

        if (latest?.receivedAt) {
          const receivedAt = new Date(latest.receivedAt).getTime();
          if (Number.isFinite(receivedAt)) {
            setLastPacketAt(receivedAt);
          }
        }
      })
      .catch((error) => {
        if (ignore) {
          return;
        }

        setSystemLog((current) =>
          [
            {
              service: 'api',
              status: 'error',
              message: error.message,
              at: new Date().toISOString()
            },
            ...current
          ].slice(0, 30)
        );
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const socket = createTelemetrySocket();

    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));

    socket.on('telemetry', (packet) => {
      if (!isDisplayablePacket(packet)) {
        return;
      }

      setLatestPacket(packet);
      setLastLivePacket(packet);
      setLastPacketAt(Date.now());
      setPackets((current) => [...current, packet].slice(-100));
    });

    socket.on('systemStatus', (status) => {
      setSystemLog((current) => [status, ...current].slice(0, 30));
    });

    return () => socket.close();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const devices = useMemo(
    () => Array.from(new Set(packets.map((packet) => packet.deviceId).filter(Boolean))),
    [packets]
  );
  const latestDeviceId = lastLivePacket?.deviceId ?? '';
  const activeDeviceId = selectedDevice === 'latest' ? latestDeviceId : selectedDevice;
  const visiblePackets = useMemo(() => {
    const rows =
      activeDeviceId === 'all' || !activeDeviceId
        ? packets
        : packets.filter((packet) => packet.deviceId === activeDeviceId);

    return rows.map((packet, index) => applyFallRisk(packet, rows[index - 1] ?? null));
  }, [activeDeviceId, packets]);
  const historyLatestPacket = visiblePackets.at(-1) ?? null;
  const selectedLivePacket =
    lastLivePacket && (activeDeviceId === 'all' || !activeDeviceId || lastLivePacket.deviceId === activeDeviceId)
      ? lastLivePacket
      : null;
  const visibleLatestPacket = selectedLivePacket ?? historyLatestPacket;
  const latestFreefallEvent = visiblePackets.filter((packet) => packet.event?.freefall).at(-1) ?? null;
  const replayPacket = visiblePackets[replayIndex] ?? historyLatestPacket;
  const mapPacket = replayPlaying || replayIndex > 0 ? replayPacket : visibleLatestPacket;
  const geofenceCenter = useMemo(() => {
    const firstGps = visiblePackets.find((packet) => packet.gps?.valid);
    return firstGps ? { lat: firstGps.gps.latitude, lng: firstGps.gps.longitude } : null;
  }, [visiblePackets]);

  const secondsSinceLastPacket = useMemo(() => {
    if (!lastPacketAt) {
      return null;
    }
    return Math.floor((now - lastPacketAt) / 1000);
  }, [lastPacketAt, now]);

  const isTelemetryStale = secondsSinceLastPacket === null || secondsSinceLastPacket > 5;
  const currentFreefallEvent =
    visibleLatestPacket?.event?.freefall && !isTelemetryStale ? visibleLatestPacket : null;
  const activeIncidentId = currentFreefallEvent
    ? `${currentFreefallEvent.deviceId}-${currentFreefallEvent.sequence}-${currentFreefallEvent.receivedAt}`
    : null;
  const deviceStartedAt = visiblePackets[0]?.receivedAt ? new Date(visiblePackets[0].receivedAt).getTime() : null;
  const deviceUptimeMs = deviceStartedAt ? now - deviceStartedAt : 0;

  useEffect(() => {
    if (!replayPlaying || visiblePackets.length === 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setReplayIndex((current) => (current + 1 >= visiblePackets.length ? 0 : current + 1));
    }, replaySpeed);

    return () => window.clearInterval(timer);
  }, [replayPlaying, replaySpeed, visiblePackets.length]);

  useEffect(() => {
    if (!visibleLatestPacket?.event?.freefall && incidentMuted) {
      setIncidentMuted(false);
    }
  }, [incidentMuted, visibleLatestPacket]);

  useEffect(() => {
    if (!activeIncidentId || incidentMuted) {
      return;
    }

    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.frequency.value = 880;
      gain.gain.value = 0.05;
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      window.setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 350);
    } catch {
      // Browser sound can be blocked before user interaction.
    }

    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('AAD Freefall Detected', {
          body: 'Check the person or device immediately.'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, [activeIncidentId, incidentMuted]);

  function handleNavigate(sectionId) {
    setActiveSection(sectionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <main className="min-h-screen bg-[#030b16] text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar
          activeSection={activeSection}
          onNavigate={handleNavigate}
          socketConnected={socketConnected}
        />

        <section className="min-w-0 flex-1">
          <div className="mx-auto flex max-w-[1660px] flex-col gap-5 px-4 py-4 sm:px-6">
            <Header
              latestPacket={visibleLatestPacket}
              packetCount={visiblePackets.length}
              secondsSinceLastPacket={secondsSinceLastPacket}
            />

            <div className="flex gap-2 overflow-x-auto rounded-lg border border-white/10 bg-[#071426]/80 p-2 lg:hidden">
              {['overview', 'tracking', 'analytics', 'events', 'logs'].map((section) => (
                <button
                  key={section}
                  className={`h-10 shrink-0 rounded-md px-4 text-sm font-semibold capitalize transition ${
                    activeSection === section
                      ? 'bg-cyan-400/15 text-cyan-100 ring-1 ring-cyan-300/20'
                      : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                  }`}
                  onClick={() => handleNavigate(section)}
                  type="button"
                >
                  {section}
                </button>
              ))}
            </div>

            {activeSection === 'overview' && (
              <div className="grid gap-5">
                <HeroCommandCenter
                  isTelemetryStale={isTelemetryStale}
                  packet={visibleLatestPacket}
                  packets={visiblePackets}
                  secondsSinceLastPacket={secondsSinceLastPacket}
                />
                <ConnectionStatus
                  socketConnected={socketConnected}
                  isTelemetryStale={isTelemetryStale}
                  secondsSinceLastPacket={secondsSinceLastPacket}
                />
                <SafetySummary
                  isTelemetryStale={isTelemetryStale}
                  latestPacket={visibleLatestPacket}
                  uptimeMs={deviceUptimeMs}
                />
                <section className="grid gap-4 xl:grid-cols-[280px_1fr]">
                  <DeviceSelector
                    devices={devices}
                    selectedDevice={selectedDevice}
                    latestDeviceId={latestDeviceId}
                    setSelectedDevice={(device) => {
                      setSelectedDevice(device);
                      setReplayIndex(0);
                    }}
                  />
                  <GeofencePanel center={geofenceCenter} packet={visibleLatestPacket} radiusMeters={500} />
                </section>
                <StatusCards packet={visibleLatestPacket} />
                <AdvancedMetrics
                  isTelemetryStale={isTelemetryStale}
                  packet={visibleLatestPacket}
                  packets={visiblePackets}
                />
              </div>
            )}

            {activeSection === 'tracking' && (
              <div className="grid gap-5">
                <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
                  <MapView
                    geofenceCenter={geofenceCenter}
                    geofenceRadius={500}
                    packet={mapPacket}
                    packets={visiblePackets}
                    onToggle={() => setMapExpanded(true)}
                  />
                  <div className="grid gap-4">
                    <DataMeaningPanel packet={visibleLatestPacket} />
                    <FreefallAlert packet={visibleLatestPacket} />
                    <GpsPanel packet={visibleLatestPacket} />
                  </div>
                </section>
                <ReplayControls
                  isPlaying={replayPlaying}
                  onReset={() => {
                    setReplayPlaying(false);
                    setReplayIndex(0);
                  }}
                  onTogglePlay={() => setReplayPlaying((current) => !current)}
                  replayIndex={replayIndex}
                  replaySpeed={replaySpeed}
                  setReplaySpeed={setReplaySpeed}
                  total={visiblePackets.length}
                />
              </div>
            )}

            {activeSection === 'analytics' && (
              <div className="grid gap-5">
                <section className="grid gap-4 lg:grid-cols-3">
                  <LiveGChart packets={visiblePackets} />
                  <LiveAltitudeChart packets={visiblePackets} />
                  <LiveRssiChart packets={visiblePackets} />
                </section>
                <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                  <LoRaPanel packets={visiblePackets} latestPacket={visibleLatestPacket} />
                  <AccelerationPanel packets={visiblePackets} latestPacket={visibleLatestPacket} />
                </section>
              </div>
            )}

            {activeSection === 'events' && (
              <div className="grid gap-5">
                <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                  <EventSummary packets={visiblePackets} />
                  <EventTimeline packets={visiblePackets} />
                </section>
                <ReportExport eventPacket={latestFreefallEvent} packets={visiblePackets} />
              </div>
            )}

            {activeSection === 'logs' && (
              <section className="grid gap-4 xl:grid-cols-[1.25fr_0.95fr]">
                <TelemetryTable packets={visiblePackets} />
                <SystemLog entries={systemLog} />
              </section>
            )}
            {mapExpanded && (
              <div className="fixed inset-0 z-[1000] bg-slate-950/85 p-4 backdrop-blur">
                <div className="mx-auto flex h-full max-w-7xl flex-col gap-3">
                  <div className="flex items-center justify-between rounded-lg border border-cyan-300/10 bg-[#0b1d35] px-4 py-3">
                    <div>
                      <p className="text-sm font-bold uppercase text-cyan-300">Expanded GPS Tracking</p>
                      <p className="text-sm text-slate-400">Click close to return to dashboard</p>
                    </div>
                    <button
                      className="rounded-md border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100"
                      onClick={() => setMapExpanded(false)}
                      type="button"
                    >
                      Close Map
                    </button>
                  </div>
                  <MapView
                    isExpanded
                    geofenceCenter={geofenceCenter}
                    geofenceRadius={500}
                    packet={mapPacket}
                    packets={visiblePackets}
                    onToggle={() => setMapExpanded(false)}
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
      <IncidentMode
        acknowledged={incidentMuted}
        currentPacket={visibleLatestPacket}
        eventPacket={currentFreefallEvent}
        onAcknowledge={() => setIncidentMuted(true)}
        packets={visiblePackets}
      />
    </main>
  );
}

export default App;

