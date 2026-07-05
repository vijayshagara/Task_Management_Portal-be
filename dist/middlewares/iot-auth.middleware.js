"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iotAuthMiddleware = void 0;
const farm_service_1 = require("../services/farm.service");
const iotAuthMiddleware = () => {
    return async (req, res, next) => {
        const apiKey = req.header('X-Device-Key') || req.body?.apiKey;
        if (!apiKey) {
            res.status(401).json({ message: 'Device API key required (X-Device-Key header)' });
            return;
        }
        try {
            const device = await farm_service_1.DeviceApiKeyService.validate(apiKey);
            if (!device) {
                res.status(401).json({ message: 'Invalid or inactive device API key' });
                return;
            }
            req.device = device;
            if (device.cowId && !req.body.cowId) {
                req.body.cowId = device.cowId;
            }
            next();
        }
        catch {
            res.status(401).json({ message: 'Device authentication failed' });
        }
    };
};
exports.iotAuthMiddleware = iotAuthMiddleware;
