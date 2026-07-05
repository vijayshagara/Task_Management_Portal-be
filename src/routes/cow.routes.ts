import { Router } from 'express';
import { CowController } from '../controllers/cow.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { cowImageUpload } from '../middlewares/upload.middleware';

const router = Router();
const auth = authMiddleware([]);
const farmWrite = authMiddleware(['admin', 'farmer']);

router.get('/', auth, (req, res, next) => {
  CowController.getAllCows(req, res).catch(next);
});

router.get('/:id/image', (req, res, next) => {
  CowController.getCowImage(req, res).catch(next);
});

router.post(
  '/:id/image',
  farmWrite,
  cowImageUpload.single('image'),
  (req, res, next) => {
    CowController.uploadCowImage(req, res).catch(next);
  }
);

router.get('/:id', auth, (req, res, next) => {
  CowController.getCowById(req, res).catch(next);
});

router.post('/', farmWrite, (req, res, next) => {
  CowController.createCow(req, res).catch(next);
});

router.put('/:id', farmWrite, (req, res, next) => {
  CowController.updateCow(req, res).catch(next);
});

router.delete('/:id', farmWrite, (req, res, next) => {
  CowController.deleteCow(req, res).catch(next);
});

export default router;
