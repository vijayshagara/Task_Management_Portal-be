import { Router } from 'express';
import { HealthRecordController } from '../controllers/health-record.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { iotAuthMiddleware } from '../middlewares/iot-auth.middleware';

const router = Router();
const auth = authMiddleware([]);
const farmWrite = authMiddleware(['admin', 'farmer']);

router.get('/', auth, (req, res, next) => {
  HealthRecordController.getAllHealthRecords(req, res).catch(next);
});

// Cow-scoped list must be registered before /:id
router.get('/cow/:cowId', auth, (req, res, next) => {
  HealthRecordController.getHealthRecordsByCowId(req, res).catch(next);
});

router.get('/:id', auth, (req, res, next) => {
  HealthRecordController.getHealthRecordById(req, res).catch(next);
});

router.post('/', farmWrite, (req, res, next) => {
  HealthRecordController.createHealthRecord(req, res).catch(next);
});

router.put('/:id', farmWrite, (req, res, next) => {
  HealthRecordController.updateHealthRecord(req, res).catch(next);
});

router.delete('/:id', farmWrite, (req, res, next) => {
  HealthRecordController.deleteHealthRecord(req, res).catch(next);
});

router.post('/iot', iotAuthMiddleware(), (req, res, next) => {
  HealthRecordController.createFromDevice(req, res).catch(next);
});

export default router;
