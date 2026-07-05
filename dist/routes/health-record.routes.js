"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_record_controller_1 = require("../controllers/health-record.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const iot_auth_middleware_1 = require("../middlewares/iot-auth.middleware");
const router = (0, express_1.Router)();
const auth = (0, auth_middleware_1.authMiddleware)([]);
const farmWrite = (0, auth_middleware_1.authMiddleware)(['admin', 'farmer']);
router.get('/', auth, (req, res, next) => {
    health_record_controller_1.HealthRecordController.getAllHealthRecords(req, res).catch(next);
});
router.get('/:id', auth, (req, res, next) => {
    health_record_controller_1.HealthRecordController.getHealthRecordById(req, res).catch(next);
});
router.get('/cow/:cowId', auth, (req, res, next) => {
    health_record_controller_1.HealthRecordController.getHealthRecordsByCowId(req, res).catch(next);
});
router.post('/', farmWrite, (req, res, next) => {
    health_record_controller_1.HealthRecordController.createHealthRecord(req, res).catch(next);
});
router.put('/:id', farmWrite, (req, res, next) => {
    health_record_controller_1.HealthRecordController.updateHealthRecord(req, res).catch(next);
});
router.delete('/:id', farmWrite, (req, res, next) => {
    health_record_controller_1.HealthRecordController.deleteHealthRecord(req, res).catch(next);
});
router.post('/iot', (0, iot_auth_middleware_1.iotAuthMiddleware)(), (req, res, next) => {
    health_record_controller_1.HealthRecordController.createFromDevice(req, res).catch(next);
});
exports.default = router;
