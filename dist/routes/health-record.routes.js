"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_record_controller_1 = require("../controllers/health-record.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Get all health records
router.get('/', (0, auth_middleware_1.authMiddleware)(['admin']), (req, res, next) => {
    health_record_controller_1.HealthRecordController.getAllHealthRecords(req, res).catch(next);
});
// Get health record by ID
router.get('/:id', (0, auth_middleware_1.authMiddleware)(['admin']), (req, res, next) => {
    health_record_controller_1.HealthRecordController.getHealthRecordById(req, res).catch(next);
});
// Get health records by cow ID
router.get('/cow/:cowId', (0, auth_middleware_1.authMiddleware)(['admin']), (req, res, next) => {
    health_record_controller_1.HealthRecordController.getHealthRecordsByCowId(req, res).catch(next);
});
// Create health record
router.post('/', (0, auth_middleware_1.authMiddleware)(['admin']), (req, res, next) => {
    health_record_controller_1.HealthRecordController.createHealthRecord(req, res).catch(next);
});
// Update health record
router.put('/:id', (0, auth_middleware_1.authMiddleware)(['admin']), (req, res, next) => {
    health_record_controller_1.HealthRecordController.updateHealthRecord(req, res).catch(next);
});
// Delete health record
router.delete('/:id', (0, auth_middleware_1.authMiddleware)(['admin']), (req, res, next) => {
    health_record_controller_1.HealthRecordController.deleteHealthRecord(req, res).catch(next);
});
router.post('/iot', (req, res, next) => {
    health_record_controller_1.HealthRecordController.createFromDevice(req, res).catch(next);
});
exports.default = router;
