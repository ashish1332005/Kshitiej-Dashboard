function DeviceSelector({ devices, latestDeviceId, selectedDevice, setSelectedDevice }) {
  return (
    <section className="rounded-lg border border-cyan-300/10 bg-[#0b1d35] p-4 shadow-xl shadow-black/20">
      <label className="text-sm font-bold uppercase text-white" htmlFor="device-selector">
        Device
      </label>
      <select
        className="mt-2 w-full rounded-md border border-cyan-300/20 bg-slate-950 px-3 py-2 text-white"
        id="device-selector"
        onChange={(event) => setSelectedDevice(event.target.value)}
        value={selectedDevice}
      >
        <option value="latest">Latest live device{latestDeviceId ? ` (${latestDeviceId})` : ''}</option>
        <option value="all">All devices / history</option>
        {devices.map((device) => (
          <option key={device} value={device}>
            {device}
          </option>
        ))}
      </select>
    </section>
  );
}

export default DeviceSelector;
