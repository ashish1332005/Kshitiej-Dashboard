import { Router } from 'express';
import { config } from '../config.js';
import { mongoState } from '../database/mongoConnection.js';
import { Telemetry } from '../database/telemetryModel.js';
import { parseTelemetryLine, serializeTelemetry } from '../serial/telemetryParser.js';

function parseLimit(value, fallback = 100) {
  const limit = Number(value ?? fallback);
  if (!Number.isFinite(limit) || limit <= 0) {
    return fallback;
  }
  return Math.min(Math.floor(limit), 1000);
}

export function telemetryRoutes(socketServer) {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'aad-telemetry-backend',
      mode: config.simulatorMode ? 'simulator' : 'serial',
      mongo: mongoState(),
      at: new Date().toISOString()
    });
  });

  router.get('/telemetry/latest', async (_req, res, next) => {
    try {
      const latest = await Telemetry.findOne().sort({ receivedAt: -1 });
      res.json(latest ? serializeTelemetry(latest) : null);
    } catch (error) {
      next(error);
    }
  });

  router.get('/telemetry/history', async (req, res, next) => {
    try {
      const rows = await Telemetry.find()
        .sort({ receivedAt: -1 })
        .limit(parseLimit(req.query.limit))
        .lean();

      res.json(rows.reverse().map(serializeTelemetry));
    } catch (error) {
      next(error);
    }
  });

  router.get('/telemetry/freefall', async (req, res, next) => {
    try {
      const rows = await Telemetry.find({ 'event.freefall': true })
        .sort({ receivedAt: -1 })
        .limit(parseLimit(req.query.limit, 100))
        .lean();

      res.json(rows.map(serializeTelemetry));
    } catch (error) {
      next(error);
    }
  });

  router.get('/telemetry/stats', async (_req, res, next) => {
    try {
      const [totalPackets, freefallEvents, latest, byAlertLevel] = await Promise.all([
        Telemetry.countDocuments(),
        Telemetry.countDocuments({ 'event.freefall': true }),
        Telemetry.findOne().sort({ receivedAt: -1 }).lean(),
        Telemetry.aggregate([
          {
            $group: {
              _id: '$event.alertLevel',
              count: { $sum: 1 }
            }
          }
        ])
      ]);

      res.json({
        totalPackets,
        freefallEvents,
        latest: latest ? serializeTelemetry(latest) : null,
        byAlertLevel: byAlertLevel.reduce((acc, row) => {
          acc[row._id] = row.count;
          return acc;
        }, {})
      });
    } catch (error) {
      next(error);
    }
  });

  router.post('/telemetry', async (req, res, next) => {
    try {
      const parsed = parseTelemetryLine(JSON.stringify(req.body));
      if (parsed.type !== 'telemetry') {
        res.status(400).json({ error: 'Telemetry payload expected' });
        return;
      }

      const saved = await Telemetry.create(parsed.payload);
      const packet = serializeTelemetry(saved);
      socketServer.broadcastTelemetry(packet);
      res.status(201).json(packet);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
