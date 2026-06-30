import { Pause, Play, RotateCcw } from 'lucide-react';

function ReplayControls({ isPlaying, onReset, onTogglePlay, replayIndex, replaySpeed, setReplaySpeed, total }) {
  return (
    <section className="rounded-lg border border-cyan-300/10 bg-[#0b1d35] p-4 shadow-xl shadow-black/20">
      <div className="mb-4">
        <h2 className="text-sm font-bold uppercase text-white">Replay Mode</h2>
        <p className="text-sm text-slate-400">Replay the last {total} packets on the map.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-bold text-white" onClick={onTogglePlay} type="button">
          {isPlaying ? <Pause className="inline" size={16} /> : <Play className="inline" size={16} />} {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button className="rounded-md border border-cyan-300/20 px-4 py-2 text-sm font-semibold text-cyan-100" onClick={onReset} type="button">
          <RotateCcw className="inline" size={16} /> Reset
        </button>
        <label className="text-sm text-slate-300">
          Speed
          <select
            className="ml-2 rounded border border-cyan-300/20 bg-slate-950 px-2 py-1 text-white"
            onChange={(event) => setReplaySpeed(Number(event.target.value))}
            value={replaySpeed}
          >
            <option value={1000}>1x</option>
            <option value={500}>2x</option>
            <option value={250}>4x</option>
          </select>
        </label>
        <span className="text-sm text-slate-400">
          Packet {total === 0 ? 0 : replayIndex + 1} / {total}
        </span>
      </div>
    </section>
  );
}

export default ReplayControls;
