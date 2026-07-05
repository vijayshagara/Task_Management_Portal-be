"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const farm_controller_1 = require("../controllers/farm.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const auth = (0, auth_middleware_1.authMiddleware)([]);
// Farm Diary
router.get('/diary', auth, (req, res, next) => farm_controller_1.FarmController.listDiary(req, res).catch(next));
router.post('/diary', auth, (req, res, next) => farm_controller_1.FarmController.createDiary(req, res).catch(next));
router.put('/diary/:id', auth, (req, res, next) => farm_controller_1.FarmController.updateDiary(req, res).catch(next));
router.delete('/diary/:id', auth, (req, res, next) => farm_controller_1.FarmController.deleteDiary(req, res).catch(next));
// Milk Production
router.get('/milk', auth, (req, res, next) => farm_controller_1.FarmController.listMilk(req, res).catch(next));
router.get('/milk/trends', auth, (req, res, next) => farm_controller_1.FarmController.milkTrends(req, res).catch(next));
router.post('/milk', auth, (req, res, next) => farm_controller_1.FarmController.createMilk(req, res).catch(next));
router.delete('/milk/:id', auth, (req, res, next) => farm_controller_1.FarmController.deleteMilk(req, res).catch(next));
// Vaccinations
router.get('/vaccinations', auth, (req, res, next) => farm_controller_1.FarmController.listVaccinations(req, res).catch(next));
router.get('/vaccinations/upcoming', auth, (req, res, next) => farm_controller_1.FarmController.upcomingVaccinations(req, res).catch(next));
router.post('/vaccinations', auth, (req, res, next) => farm_controller_1.FarmController.createVaccination(req, res).catch(next));
router.put('/vaccinations/:id', auth, (req, res, next) => farm_controller_1.FarmController.updateVaccination(req, res).catch(next));
router.delete('/vaccinations/:id', auth, (req, res, next) => farm_controller_1.FarmController.deleteVaccination(req, res).catch(next));
// Pregnancies
router.get('/pregnancies', auth, (req, res, next) => farm_controller_1.FarmController.listPregnancies(req, res).catch(next));
router.post('/pregnancies', auth, (req, res, next) => farm_controller_1.FarmController.createPregnancy(req, res).catch(next));
router.put('/pregnancies/:id', auth, (req, res, next) => farm_controller_1.FarmController.updatePregnancy(req, res).catch(next));
router.post('/pregnancies/:id/calving', auth, (req, res, next) => farm_controller_1.FarmController.recordCalving(req, res).catch(next));
// Milk Collections (Cooperative)
router.get('/collections', auth, (req, res, next) => farm_controller_1.FarmController.listCollections(req, res).catch(next));
router.post('/collections', auth, (req, res, next) => farm_controller_1.FarmController.createCollection(req, res).catch(next));
router.put('/collections/:id', auth, (req, res, next) => farm_controller_1.FarmController.updateCollection(req, res).catch(next));
router.delete('/collections/:id', auth, (req, res, next) => farm_controller_1.FarmController.deleteCollection(req, res).catch(next));
// Knowledge Base
router.get('/knowledge', auth, (req, res, next) => farm_controller_1.FarmController.listKnowledge(req, res).catch(next));
router.post('/knowledge', auth, (req, res, next) => farm_controller_1.FarmController.createKnowledge(req, res).catch(next));
router.post('/knowledge/:id/upvote', auth, (req, res, next) => farm_controller_1.FarmController.upvoteKnowledge(req, res).catch(next));
// Push Notifications
router.post('/push/register', auth, (req, res, next) => farm_controller_1.FarmController.registerPush(req, res).catch(next));
router.post('/push/unregister', auth, (req, res, next) => farm_controller_1.FarmController.unregisterPush(req, res).catch(next));
// IoT Device Keys
router.get('/devices', auth, (req, res, next) => farm_controller_1.FarmController.listDevices(req, res).catch(next));
router.post('/devices', auth, (req, res, next) => farm_controller_1.FarmController.createDevice(req, res).catch(next));
router.delete('/devices/:id', auth, (req, res, next) => farm_controller_1.FarmController.revokeDevice(req, res).catch(next));
// Analytics & Health Insights
router.get('/analytics', auth, (req, res, next) => farm_controller_1.FarmController.analytics(req, res).catch(next));
router.get('/health-insights', auth, (req, res, next) => farm_controller_1.FarmController.healthInsights(req, res).catch(next));
router.get('/health-insights/:cowId', auth, (req, res, next) => farm_controller_1.FarmController.cowInsight(req, res).catch(next));
exports.default = router;
