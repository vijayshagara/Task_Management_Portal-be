"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthRecordController = void 0;
const health_record_service_1 = require("../services/health-record.service");
const auth_interface_1 = require("../interfaces/auth.interface");
const bulk_1 = require("../utils/bulk");
class HealthRecordController {
    static async getAllHealthRecords(req, res) {
        try {
            const records = await health_record_service_1.HealthRecordService.getAllHealthRecords((0, auth_interface_1.getUserId)(req), req.user.role);
            res.json(records);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    static async getHealthRecordById(req, res) {
        try {
            const record = await health_record_service_1.HealthRecordService.getHealthRecordById(req.params.id, (0, auth_interface_1.getUserId)(req), req.user.role);
            if (!record) {
                res.status(404).json({ message: 'Health record not found' });
                return;
            }
            res.json(record);
        }
        catch (error) {
            const status = error.message?.includes('access') ? 403 : 500;
            res.status(status).json({ message: error.message });
        }
    }
    static async getHealthRecordsByCowId(req, res) {
        try {
            const records = await health_record_service_1.HealthRecordService.getHealthRecordsByCowId(req.params.cowId, (0, auth_interface_1.getUserId)(req), req.user.role);
            res.json(records);
        }
        catch (error) {
            const status = error.message?.includes('access') || error.message?.includes('not found') ? 403 : 500;
            res.status(status).json({ message: error.message });
        }
    }
    static async createHealthRecord(req, res) {
        try {
            const record = await health_record_service_1.HealthRecordService.createHealthRecord(req.body, (0, auth_interface_1.getUserId)(req), req.user.role);
            res.status(201).json(record);
        }
        catch (error) {
            const status = error.message?.includes('access') ? 403 : 400;
            res.status(status).json({ message: error.message });
        }
    }
    static async updateHealthRecord(req, res) {
        try {
            const record = await health_record_service_1.HealthRecordService.updateHealthRecord(req.params.id, req.body, (0, auth_interface_1.getUserId)(req), req.user.role);
            if (!record) {
                res.status(404).json({ message: 'Health record not found' });
                return;
            }
            res.json(record);
        }
        catch (error) {
            const status = error.message?.includes('access') ? 403 : 400;
            res.status(status).json({ message: error.message });
        }
    }
    static async deleteHealthRecord(req, res) {
        try {
            const success = await health_record_service_1.HealthRecordService.deleteHealthRecord(req.params.id, (0, auth_interface_1.getUserId)(req), req.user.role);
            if (!success) {
                res.status(404).json({ message: 'Health record not found' });
                return;
            }
            res.json({ message: 'Health record deleted successfully' });
        }
        catch (error) {
            const status = error.message?.includes('access') ? 403 : 500;
            res.status(status).json({ message: error.message });
        }
    }
    static async bulkDeleteHealthRecords(req, res) {
        try {
            const ids = (0, bulk_1.parseBulkIds)(req.body);
            const result = await health_record_service_1.HealthRecordService.bulkDeleteHealthRecords(ids, (0, auth_interface_1.getUserId)(req), req.user.role);
            res.json(result);
        }
        catch (error) {
            const status = error.message?.includes('access') ? 403 : 400;
            res.status(status).json({ message: error.message });
        }
    }
    static async createFromDevice(req, res) {
        try {
            const record = await health_record_service_1.HealthRecordService.createHealthRecord(req.body);
            res.status(201).json(record);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}
exports.HealthRecordController = HealthRecordController;
