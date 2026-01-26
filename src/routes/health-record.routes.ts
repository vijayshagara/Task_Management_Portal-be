import { Router } from 'express';
import { HealthRecordController } from '../controllers/health-record.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Get all health records
router.get('/', authMiddleware(['admin']), (req, res, next) => {
  HealthRecordController.getAllHealthRecords(req, res).catch(next);
});

// Get health record by ID
router.get('/:id', authMiddleware(['admin']), (req, res, next) => {
  HealthRecordController.getHealthRecordById(req, res).catch(next);
});

// Get health records by cow ID
router.get('/cow/:cowId', authMiddleware(['admin']), (req, res, next) => {
  HealthRecordController.getHealthRecordsByCowId(req, res).catch(next);
});

// Create health record
router.post('/', authMiddleware(['admin']), (req, res, next) => {
  HealthRecordController.createHealthRecord(req, res).catch(next);
});

// Update health record
router.put('/:id', authMiddleware(['admin']), (req, res, next) => {
  HealthRecordController.updateHealthRecord(req, res).catch(next);
});

// Delete health record
router.delete('/:id', authMiddleware(['admin']), (req, res, next) => {
  HealthRecordController.deleteHealthRecord(req, res).catch(next);
});

router.post('/iot', (req, res, next) => {
  HealthRecordController.createFromDevice(req, res).catch(next);
});


export default router;
