"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const heat_cycle_controller_1 = require("../controllers/heat-cycle.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Get all heat cycles
router.get('/', (0, auth_middleware_1.authMiddleware)(['admin']), (req, res, next) => {
    heat_cycle_controller_1.HeatCycleController.getAllHeatCycles(req, res).catch(next);
});
// Get heat cycle by ID
router.get('/:id', (0, auth_middleware_1.authMiddleware)(['admin']), (req, res, next) => {
    heat_cycle_controller_1.HeatCycleController.getHeatCycleById(req, res).catch(next);
});
// Get heat cycles by cow ID
router.get('/cow/:cowId', (0, auth_middleware_1.authMiddleware)(['admin']), (req, res, next) => {
    heat_cycle_controller_1.HeatCycleController.getHeatCyclesByCowId(req, res).catch(next);
});
// Create heat cycle
router.post('/', (req, res, next) => {
    heat_cycle_controller_1.HeatCycleController.createHeatCycle(req, res).catch(next);
});
// Update heat cycle
router.put('/:id', (0, auth_middleware_1.authMiddleware)(['admin']), (req, res, next) => {
    heat_cycle_controller_1.HeatCycleController.updateHeatCycle(req, res).catch(next);
});
// Delete heat cycle
router.delete('/:id', (0, auth_middleware_1.authMiddleware)(['admin']), (req, res, next) => {
    heat_cycle_controller_1.HeatCycleController.deleteHeatCycle(req, res).catch(next);
});
router.post('/:id/confirm', (0, auth_middleware_1.authMiddleware)(['admin']), (req, res, next) => {
    heat_cycle_controller_1.HeatCycleController.confirmHeat(req, res).catch(next);
});
exports.default = router;
