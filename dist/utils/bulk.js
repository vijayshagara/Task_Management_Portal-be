"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkIdsSchema = void 0;
exports.parseBulkIds = parseBulkIds;
const zod_1 = require("zod");
exports.bulkIdsSchema = zod_1.z.object({
    ids: zod_1.z.array(zod_1.z.string().uuid()).min(1).max(500),
});
function parseBulkIds(body) {
    return exports.bulkIdsSchema.parse(body).ids;
}
