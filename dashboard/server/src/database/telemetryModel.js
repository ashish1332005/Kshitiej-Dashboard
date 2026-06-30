import mongoose from 'mongoose';

const telemetrySchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, index: true },
    sequence: { type: Number, required: true },
    gps: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      altitude: { type: Number, default: null },
      speed: { type: Number, default: null },
      satellites: { type: Number, default: null },
      valid: { type: Boolean, required: true }
    },
    acceleration: {
      ax: { type: Number, required: true },
      ay: { type: Number, required: true },
      az: { type: Number, required: true },
      gMagnitude: { type: Number, required: true }
    },
    event: {
      freefall: { type: Boolean, required: true, index: true },
      alertLevel: { type: String, required: true, enum: ['normal', 'warning', 'critical'] }
    },
    lora: {
      rssi: { type: Number, default: null },
      snr: { type: Number, default: null }
    },
    battery: {
      voltage: { type: Number, default: null }
    },
    packet: {
      raw: { type: mongoose.Schema.Types.Mixed, required: true }
    },
    receivedAt: { type: Date, required: true, index: true }
  },
  {
    collection: 'telemetry',
    versionKey: false
  }
);

telemetrySchema.index({ deviceId: 1, sequence: -1 });
telemetrySchema.index({ 'event.freefall': 1, receivedAt: -1 });

export const Telemetry = mongoose.model('Telemetry', telemetrySchema);
