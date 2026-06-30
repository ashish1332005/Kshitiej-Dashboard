function SystemLog({ entries }) {
  return (
    <section className="rounded-lg border border-cyan-300/10 bg-[#0b1d35] p-4 shadow-xl shadow-black/20">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase text-white">System Log</h2>
        <span className="text-sm text-slate-400">{entries.length} entries</span>
      </div>

      <div className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
        {entries.length === 0 && (
          <div className="rounded border border-cyan-300/10 bg-slate-950/40 p-3 text-sm text-slate-400">
            Waiting for system status
          </div>
        )}

        {entries.map((entry, index) => (
          <div
            key={`${entry.at}-${index}`}
            className="rounded border border-cyan-300/10 bg-slate-950/40 p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-white">
                {entry.service ?? 'system'} - {entry.status ?? 'info'}
              </p>
              <p className="text-xs text-slate-500">{formatTime(entry.at)}</p>
            </div>
            <p className="mt-1 text-sm text-slate-400">{friendlyMessage(entry.message)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function formatTime(value) {
  if (!value) {
    return '';
  }
  return new Date(value).toLocaleTimeString();
}

function friendlyMessage(message) {
  if (!message) {
    return 'No message';
  }

  if (message.includes('Invalid JSON') || message.includes('not valid JSON')) {
    return 'Ignored a debug message from ESP32. Live telemetry is still running.';
  }

  if (message.includes('broadcast without MongoDB save')) {
    return 'Live data was shown, but database save needs attention.';
  }

  return message;
}

export default SystemLog;
