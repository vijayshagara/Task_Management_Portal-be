import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware(['admin']), (req, res, next) => { TaskController.getAllTasks(req, res).catch(next) });
router.get('/developer', authMiddleware(['developer']), (req, res, next) => { TaskController.getDeveloperTasks(req, res).catch(next) });
router.get('/:id', authMiddleware(), (req, res, next) => { TaskController.getTaskById(req, res).catch(next) });
router.post('/', authMiddleware(['admin']), (req, res, next) => { TaskController.createTask(req, res).catch(next) });
router.put('/:id', authMiddleware(), (req, res, next) => { TaskController.updateTask(req, res).catch(next) });
router.delete('/:id', authMiddleware(['admin']), (req, res, next) => { TaskController.deleteTask(req, res).catch(next) });

export default router;