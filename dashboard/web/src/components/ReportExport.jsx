import { Download } from 'lucide-react';
import { exportFreefallCsv, exportFreefallJson, openPrintableFreefallReport } from '../utils/exportReports.js';

function ReportExport({ eventPacket, packets }) {
  const disabled = !eventPacket;

  return (
    <section className="rounded-lg border border-cyan-300/10 bg-[#0b1d35] p-4 shadow-xl shadow-black/20">
      <div className="mb-4 flex items-center gap-3">
        <Download className="text-cyan-200" size={20} />
        <div>
          <h2 className="text-sm font-bold uppercase text-white">Freefall Report Export</h2>
          <p className="text-sm text-slate-400">Download incident data and route before the event.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button disabled={disabled} onClick={() => exportFreefallCsv(eventPacket, packets)}>CSV</Button>
        <Button disabled={disabled} onClick={() => exportFreefallJson(eventPacket, packets)}>JSON</Button>
        <Button disabled={disabled} onClick={() => openPrintableFreefallReport(eventPacket, packets)}>PDF / Print</Button>
      </div>
      {disabled && <p className="mt-3 text-sm text-slate-500">No freefall event available yet.</p>}
    </section>
  );
}

function Button({ children, disabled, onClick }) {
  return (
    <button
      className="rounded-md border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 disabled:cursor-not-allowed disabled:opacity-40"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export default ReportExport;
