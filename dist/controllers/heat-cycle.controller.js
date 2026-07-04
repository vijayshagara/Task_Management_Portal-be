"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeatCycleController = void 0;
const heat_cycle_service_1 = require("../services/heat-cycle.service");
class HeatCycleController {
    static async getAllHeatCycles(req, res) {
        try {
            const cycles = await heat_cycle_service_1.HeatCycleService.getAllHeatCycles();
            res.json(cycles);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    static async getHeatCycleById(req, res) {
        try {
            const cycle = await heat_cycle_service_1.HeatCycleService.getHeatCycleById(req.params.id);
            if (!cycle) {
                res.status(404).json({ message: 'Heat cycle not found' });
                return;
            }
            res.json(cycle);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    static async getHeatCyclesByCowId(req, res) {
        try {
            const cycles = await heat_cycle_service_1.HeatCycleService.getHeatCyclesByCowId(req.params.cowId);
            res.json(cycles);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    static async createHeatCycle(req, res) {
        try {
            const cycle = await heat_cycle_service_1.HeatCycleService.createHeatCycle(req.body);
            res.status(201).json(cycle);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async updateHeatCycle(req, res) {
        try {
            const cycle = await heat_cycle_service_1.HeatCycleService.updateHeatCycle(req.params.id, req.body);
            if (!cycle) {
                res.status(404).json({ message: 'Heat cycle not found' });
                return;
            }
            res.json(cycle);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async deleteHeatCycle(req, res) {
        try {
            const success = await heat_cycle_service_1.HeatCycleService.deleteHeatCycle(req.params.id);
            if (!success) {
                res.status(404).json({ message: 'Heat cycle not found' });
                return;
            }
            res.json({ message: 'Heat cycle deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    static async confirmHeat(req, res) {
        try {
            const result = await heat_cycle_service_1.HeatCycleService.confirmHeat(req.params.id);
            if (!result) {
                res.status(404).json({ message: 'Heat cycle not found' });
                return;
            }
            res.json({
                message: 'Heat confirmed. Future alerts cancelled.',
            });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
exports.HeatCycleController = HeatCycleController;
