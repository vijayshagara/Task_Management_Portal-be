import { Router } from 'express';
import { CowController } from '../controllers/cow.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Get all cows
router.get('/', authMiddleware(['admin']), (req, res, next) => {  
  CowController.getAllCows(req, res).catch(next);
});

// Get cow by ID
router.get('/:id', authMiddleware(['admin']), (req, res, next) => {
  CowController.getCowById(req, res).catch(next);
});

// Create cow
router.post('/', authMiddleware(['admin']), (req, res, next) => {
  CowController.createCow(req, res).catch(next);
});

// Update cow
router.put('/:id', authMiddleware(['admin']), (req, res, next) => {
  CowController.updateCow(req, res).catch(next);
});

// Delete cow
router.delete('/:id', authMiddleware(['admin']), (req, res, next) => {
  CowController.deleteCow(req, res).catch(next);
});

// router.get('/breed/:breed', authMiddleware(['admin']), (req, res, next) => {
//   CowController.getCowsByBreed(req, res).catch(next);
// });


export default router;
