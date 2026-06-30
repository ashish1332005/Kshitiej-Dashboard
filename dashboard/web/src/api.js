export const API_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:5000');

export async function fetchTelemetry() {
  const response = await fetch(`${API_URL}/api/telemetry/history?limit=100`);
  if (!response.ok) {
    throw new Error('Unable to load telemetry');
  }
  return response.json();
}

