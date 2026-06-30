import { formatNumber } from './format.js';

export function buildFreefallReport(eventPacket, packets) {
  const routeBeforeEvent = packets
    .filter((packet) => packet?.receivedAt && new Date(packet.receivedAt) <= new Date(eventPacket.receivedAt))
    .slice(-20);

  return {
    generatedAt: new Date().toISOString(),
    event: eventPacket,
    routeBeforeEvent
  };
}

export function downloadTextFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportFreefallJson(eventPacket, packets) {
  const report = buildFreefallReport(eventPacket, packets);
  downloadTextFile('freefall-report.json', JSON.stringify(report, null, 2), 'application/json');
}

export function exportFreefallCsv(eventPacket, packets) {
  const report = buildFreefallReport(eventPacket, packets);
  const rows = [
    ['time', 'device', 'sequence', 'latitude', 'longitude', 'gForce', 'battery', 'rssi', 'snr'],
    ...report.routeBeforeEvent.map((packet) => [
      packet.receivedAt,
      packet.deviceId,
      packet.sequence,
      packet.gps?.latitude,
      packet.gps?.longitude,
      packet.acceleration?.gMagnitude,
      packet.battery?.voltage,
      packet.lora?.rssi,
      packet.lora?.snr
    ])
  ];

  const csv = rows.map((row) => row.map((cell) => `"${cell ?? ''}"`).join(',')).join('\n');
  downloadTextFile('freefall-report.csv', csv, 'text/csv');
}

export function openPrintableFreefallReport(eventPacket, packets) {
  const report = buildFreefallReport(eventPacket, packets);
  const html = `
    <!doctype html>
    <html>
      <head>
        <title>Freefall Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 32px; color: #111827; }
          h1 { margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 12px; }
          th { background: #f3f4f6; }
          .card { border: 1px solid #d1d5db; padding: 16px; border-radius: 8px; margin-top: 16px; }
        </style>
      </head>
      <body>
        <h1>AAD Freefall Report</h1>
        <p>Generated: ${new Date(report.generatedAt).toLocaleString()}</p>
        <div class="card">
          <h2>Incident Summary</h2>
          <p><strong>Time:</strong> ${new Date(eventPacket.receivedAt).toLocaleString()}</p>
          <p><strong>Device:</strong> ${eventPacket.deviceId}</p>
          <p><strong>Location:</strong> ${formatNumber(eventPacket.gps?.latitude, '', 6)}, ${formatNumber(eventPacket.gps?.longitude, '', 6)}</p>
          <p><strong>G Force:</strong> ${formatNumber(eventPacket.acceleration?.gMagnitude, ' G', 2)}</p>
          <p><strong>Battery:</strong> ${formatNumber(eventPacket.battery?.voltage, ' V', 2)}</p>
          <p><strong>Signal:</strong> RSSI ${formatNumber(eventPacket.lora?.rssi, ' dBm', 0)}, SNR ${formatNumber(eventPacket.lora?.snr, ' dB', 1)}</p>
        </div>
        <table>
          <thead>
            <tr><th>Time</th><th>Seq</th><th>GPS</th><th>G Force</th><th>Battery</th><th>Signal</th></tr>
          </thead>
          <tbody>
            ${report.routeBeforeEvent
              .map(
                (packet) => `<tr>
                  <td>${new Date(packet.receivedAt).toLocaleString()}</td>
                  <td>${packet.sequence}</td>
                  <td>${formatNumber(packet.gps?.latitude, '', 5)}, ${formatNumber(packet.gps?.longitude, '', 5)}</td>
                  <td>${formatNumber(packet.acceleration?.gMagnitude, ' G', 2)}</td>
                  <td>${formatNumber(packet.battery?.voltage, ' V', 2)}</td>
                  <td>${formatNumber(packet.lora?.rssi, ' dBm', 0)} / ${formatNumber(packet.lora?.snr, ' dB', 1)}</td>
                </tr>`
              )
              .join('')}
          </tbody>
        </table>
        <script>window.print();</script>
      </body>
    </html>
  `;

  const reportWindow = window.open('', '_blank');
  reportWindow.document.write(html);
  reportWindow.document.close();
}
