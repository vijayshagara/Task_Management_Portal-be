"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthRecordController = void 0;
const health_record_service_1 = require("../services/health-record.service");
class HealthRecordController {
    // Get all health records
    static async getAllHealthRecords(req, res) {
        try {
            const records = await health_record_service_1.HealthRecordService.getAllHealthRecords();
            res.json(records);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // Get health record by ID
    static async getHealthRecordById(req, res) {
        try {
            const record = await health_record_service_1.HealthRecordService.getHealthRecordById(req.params.id);
            if (!record) {
                res.status(404).json({ message: 'Health record not found' });
                return;
            }
            res.json(record);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // Get health records by cow ID
    static async getHealthRecordsByCowId(req, res) {
        try {
            const records = await health_record_service_1.HealthRecordService.getHealthRecordsByCowId(req.params.cowId);
            res.json(records);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // Create health record (admin / app)
    static async createHealthRecord(req, res) {
        try {
            const record = await health_record_service_1.HealthRecordService.createHealthRecord(req.body);
            res.status(201).json(record);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    // Update health record
    static async updateHealthRecord(req, res) {
        try {
            const record = await health_record_service_1.HealthRecordService.updateHealthRecord(req.params.id, req.body);
            if (!record) {
                res.status(404).json({ message: 'Health record not found' });
                return;
            }
            res.json(record);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    // Delete health record
    static async deleteHealthRecord(req, res) {
        try {
            const success = await health_record_service_1.HealthRecordService.deleteHealthRecord(req.params.id);
            if (!success) {
                res.status(404).json({ message: 'Health record not found' });
                return;
            }
            res.json({ message: 'Health record deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // Create health record from IoT device (ESP32)
    static async createFromDevice(req, res) {
        try {
            const record = await health_record_service_1.HealthRecordService.createHealthRecord(req.body);
            res.status(201).json({
                message: 'Health data received from device',
                data: record,
            });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}
exports.HealthRecordController = HealthRecordController;
