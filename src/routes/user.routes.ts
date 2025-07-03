import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware(['admin']), (req, res, next) => {
  UserController.getAllUsers(req, res).catch(next);
});

router.get('/developers', authMiddleware(['admin']), (req, res, next) => {
  UserController.getDevelopers(req, res).catch(next);
});

router.get('/:id', authMiddleware(['admin']), (req, res, next) => {
  UserController.getUserById(req, res).catch(next);
});

router.post('/', authMiddleware(['admin']), (req, res, next) => {
  UserController.createUser(req, res).catch(next);
});

router.put('/:id', authMiddleware(['admin']), (req, res, next) => {
  UserController.updateUser(req, res).catch(next);
});

router.delete('/:id', authMiddleware(['admin']), (req, res, next) => {
  UserController.deleteUser(req, res).catch(next);
});

export default router;