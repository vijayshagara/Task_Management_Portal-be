import { Router } from 'express';
import { CowController } from '../controllers/cow.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { cowImageUpload } from '../middlewares/upload.middleware';

const router = Router();

router.get('/', authMiddleware([]), (req, res, next) => {
  CowController.getAllCows(req, res).catch(next);
});

router.get('/:id/image', (req, res, next) => {
  CowController.getCowImage(req, res).catch(next);
});

router.post(
  '/:id/image',
  authMiddleware(['admin']),
  cowImageUpload.single('image'),
  (req, res, next) => {
    CowController.uploadCowImage(req, res).catch(next);
  }
);

router.get('/:id', authMiddleware([]), (req, res, next) => {
  CowController.getCowById(req, res).catch(next);
});

router.post('/', authMiddleware(['admin']), (req, res, next) => {
  CowController.createCow(req, res).catch(next);
});

router.put('/:id', authMiddleware(['admin']), (req, res, next) => {
  CowController.updateCow(req, res).catch(next);
});

router.delete('/:id', authMiddleware(['admin']), (req, res, next) => {
  CowController.deleteCow(req, res).catch(next);
});

export default router;
