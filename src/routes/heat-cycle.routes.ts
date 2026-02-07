import { Router } from 'express';
import { HeatCycleController } from '../controllers/heat-cycle.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Get all heat cycles
router.get('/', authMiddleware(['admin']), (req, res, next) => {
  HeatCycleController.getAllHeatCycles(req, res).catch(next);
});

// Get heat cycle by ID
router.get('/:id', authMiddleware(['admin']), (req, res, next) => {
  HeatCycleController.getHeatCycleById(req, res).catch(next);
});

// Get heat cycles by cow ID
router.get('/cow/:cowId', authMiddleware(['admin']), (req, res, next) => {
  HeatCycleController.getHeatCyclesByCowId(req, res).catch(next);
});

// Create heat cycle
router.post('/', (req, res, next) => {
  HeatCycleController.createHeatCycle(req, res).catch(next);
});

// Update heat cycle
router.put('/:id', authMiddleware(['admin']), (req, res, next) => {
  HeatCycleController.updateHeatCycle(req, res).catch(next);
});

// Delete heat cycle
router.delete('/:id', authMiddleware(['admin']), (req, res, next) => {
  HeatCycleController.deleteHeatCycle(req, res).catch(next);
});

router.post(
  '/:id/confirm',
  authMiddleware(['admin']),
  (req, res, next) => {
    HeatCycleController.confirmHeat(req, res).catch(next);
  }
);


export default router;
