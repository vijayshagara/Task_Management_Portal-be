import { Router } from 'express';
import { FarmController } from '../controllers/farm.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const auth = authMiddleware([]);

// Farm Diary
router.get('/diary', auth, (req, res, next) => FarmController.listDiary(req, res).catch(next));
router.post('/diary', auth, (req, res, next) => FarmController.createDiary(req, res).catch(next));
router.put('/diary/:id', auth, (req, res, next) => FarmController.updateDiary(req, res).catch(next));
router.delete('/diary/:id', auth, (req, res, next) => FarmController.deleteDiary(req, res).catch(next));

// Milk Production
router.get('/milk', auth, (req, res, next) => FarmController.listMilk(req, res).catch(next));
router.get('/milk/trends', auth, (req, res, next) => FarmController.milkTrends(req, res).catch(next));
router.post('/milk', auth, (req, res, next) => FarmController.createMilk(req, res).catch(next));
router.delete('/milk/:id', auth, (req, res, next) => FarmController.deleteMilk(req, res).catch(next));

// Vaccinations
router.get('/vaccinations', auth, (req, res, next) => FarmController.listVaccinations(req, res).catch(next));
router.get('/vaccinations/upcoming', auth, (req, res, next) => FarmController.upcomingVaccinations(req, res).catch(next));
router.post('/vaccinations', auth, (req, res, next) => FarmController.createVaccination(req, res).catch(next));
router.put('/vaccinations/:id', auth, (req, res, next) => FarmController.updateVaccination(req, res).catch(next));
router.delete('/vaccinations/:id', auth, (req, res, next) => FarmController.deleteVaccination(req, res).catch(next));

// Pregnancies
router.get('/pregnancies', auth, (req, res, next) => FarmController.listPregnancies(req, res).catch(next));
router.post('/pregnancies', auth, (req, res, next) => FarmController.createPregnancy(req, res).catch(next));
router.put('/pregnancies/:id', auth, (req, res, next) => FarmController.updatePregnancy(req, res).catch(next));
router.post('/pregnancies/:id/calving', auth, (req, res, next) => FarmController.recordCalving(req, res).catch(next));

// Milk Collections (Cooperative)
router.get('/collections', auth, (req, res, next) => FarmController.listCollections(req, res).catch(next));
router.post('/collections', auth, (req, res, next) => FarmController.createCollection(req, res).catch(next));
router.put('/collections/:id', auth, (req, res, next) => FarmController.updateCollection(req, res).catch(next));
router.delete('/collections/:id', auth, (req, res, next) => FarmController.deleteCollection(req, res).catch(next));

// Knowledge Base
router.get('/knowledge', auth, (req, res, next) => FarmController.listKnowledge(req, res).catch(next));
router.post('/knowledge', auth, (req, res, next) => FarmController.createKnowledge(req, res).catch(next));
router.post('/knowledge/:id/upvote', auth, (req, res, next) => FarmController.upvoteKnowledge(req, res).catch(next));

// Push Notifications
router.post('/push/register', auth, (req, res, next) => FarmController.registerPush(req, res).catch(next));
router.post('/push/unregister', auth, (req, res, next) => FarmController.unregisterPush(req, res).catch(next));

// IoT Device Keys
router.get('/devices', auth, (req, res, next) => FarmController.listDevices(req, res).catch(next));
router.post('/devices', auth, (req, res, next) => FarmController.createDevice(req, res).catch(next));
router.delete('/devices/:id', auth, (req, res, next) => FarmController.revokeDevice(req, res).catch(next));

// Analytics & Health Insights
router.get('/analytics', auth, (req, res, next) => FarmController.analytics(req, res).catch(next));
router.get('/health-insights', auth, (req, res, next) => FarmController.healthInsights(req, res).catch(next));
router.get('/health-insights/:cowId', auth, (req, res, next) => FarmController.cowInsight(req, res).catch(next));

export default router;
