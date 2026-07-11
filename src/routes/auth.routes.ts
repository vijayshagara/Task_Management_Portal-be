import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', (req, res) => AuthController.register(req, res));
router.post('/login', (req, res) => AuthController.login(req, res));
router.post('/refresh', (req, res) => AuthController.refresh(req, res));
router.post('/forgot-password', (req, res) => AuthController.forgotPassword(req, res));
router.post('/reset-password', (req, res) => AuthController.resetPassword(req, res));
router.post('/change-password', authMiddleware([]), (req, res) => AuthController.changePassword(req, res));
router.post('/logout', authMiddleware([]), (req, res) => AuthController.logout(req, res));

export default router;
