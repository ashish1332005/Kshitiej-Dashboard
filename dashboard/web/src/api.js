export const API_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:5000');

export async function fetchTelemetry() {
  const response = await fetch(`${API_URL}/api/telemetry/history?limit=100`, {
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error('Unable to load telemetry');
  }
  return response.json();
}

export async function fetchLatestTelemetry() {
  const response = await fetch(`${API_URL}/api/telemetry/latest`, {
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error('Unable to load latest telemetry');
  }
  return response.json();
}

