"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthMiddleware = exports.authMiddleware = void 0;
const auth_service_1 = require("../services/auth.service");
const authMiddleware = (roles = []) => {
    return async (req, res, next) => {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            if (!token) {
                res.status(401).json({ message: 'No token provided' });
                return;
            }
            const decoded = auth_service_1.AuthService.verifyToken(token);
            req.user = decoded;
            if (roles.length && !roles.includes(decoded.role)) {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }
            next();
        }
        catch {
            res.status(401).json({ message: 'Invalid token' });
        }
    };
};
exports.authMiddleware = authMiddleware;
const optionalAuthMiddleware = () => {
    return async (req, _res, next) => {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            if (token) {
                req.user = auth_service_1.AuthService.verifyToken(token);
            }
        }
        catch {
            // ignore invalid token for optional auth
        }
        next();
    };
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
