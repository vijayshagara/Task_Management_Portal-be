import { Response } from 'express';
import { TaskService } from '../services/task.service';
import { AuthenticatedRequest, getUserId } from '../interfaces/auth.interface';

export class TaskController {
  public static async getAllTasks(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const tasks = await TaskService.getAllTasks();
      return res.json(tasks);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async getDeveloperTasks(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const tasks = await TaskService.getTasksByDeveloper(getUserId(req));
      return res.json(tasks);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async getTaskById(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const task = await TaskService.getTaskById(req.params.id);
      if (!task) return res.status(404).json({ message: 'Task not found' });
      if (req.user!.role !== 'admin' && task.developerId !== getUserId(req)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      return res.json(task);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async createTask(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const task = await TaskService.createTask(req.body);
      return res.status(201).json(task);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public static async updateTask(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const existing = await TaskService.getTaskById(req.params.id);
      if (!existing) return res.status(404).json({ message: 'Task not found' });
      if (req.user!.role !== 'admin' && existing.developerId !== getUserId(req)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      const task = await TaskService.updateTask(req.params.id, req.body);
      if (!task) return res.status(404).json({ message: 'Task not found' });
      return res.json(task);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public static async deleteTask(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const success = await TaskService.deleteTask(req.params.id);
      if (!success) return res.status(404).json({ message: 'Task not found' });
      return res.json({ message: 'Task deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
