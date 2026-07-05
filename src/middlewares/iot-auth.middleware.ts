import { Request, Response, NextFunction } from 'express';
import { DeviceApiKeyService } from '../services/farm.service';

export const iotAuthMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.header('X-Device-Key') || req.body?.apiKey;

    if (!apiKey) {
      res.status(401).json({ message: 'Device API key required (X-Device-Key header)' });
      return;
    }

    try {
      const device = await DeviceApiKeyService.validate(apiKey);
      if (!device) {
        res.status(401).json({ message: 'Invalid or inactive device API key' });
        return;
      }
      (req as any).device = device;
      if (device.cowId && !req.body.cowId) {
        req.body.cowId = device.cowId;
      }
      next();
    } catch {
      res.status(401).json({ message: 'Device authentication failed' });
    }
  };
};
