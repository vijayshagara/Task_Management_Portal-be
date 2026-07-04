import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { socialMediaUpload } from '../middlewares/upload.middleware';

const router = Router();
const auth = authMiddleware([]);

router.get('/me', auth, (req, res, next) => ProfileController.getMe(req, res).catch(next));
router.get('/suggested', auth, (req, res, next) => ProfileController.getSuggested(req, res).catch(next));
router.get('/:userId', auth, (req, res, next) => ProfileController.getProfile(req, res).catch(next));
router.put('/me', auth, (req, res, next) => ProfileController.updateProfile(req, res).catch(next));
router.post(
  '/me/avatar',
  auth,
  socialMediaUpload.single('image'),
  (req, res, next) => ProfileController.uploadProfilePicture(req, res).catch(next)
);
router.post(
  '/me/cover',
  auth,
  socialMediaUpload.single('image'),
  (req, res, next) => ProfileController.uploadCoverPhoto(req, res).catch(next)
);

export default router;
