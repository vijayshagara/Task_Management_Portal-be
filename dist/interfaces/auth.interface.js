"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserId = getUserId;
function getUserId(req) {
    if (!req.user?.id) {
        throw new Error('Unauthorized');
    }
    return req.user.id;
}
