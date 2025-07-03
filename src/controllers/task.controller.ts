import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';

export class TaskController {
  public static async getAllTasks(req: Request, res: Response): Promise<Response> {
    try {
      const tasks = await TaskService.getAllTasks();
      return res.json(tasks);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async getDeveloperTasks(req: any, res: Response): Promise<Response> {
    try {
      const tasks = await TaskService.getTasksByDeveloper(req.user.id);
      return res.json(tasks);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async getTaskById(req: Request, res: Response): Promise<Response> {
    try {
      const task = await TaskService.getTaskById(req.params.id);
      if (!task) return res.status(404).json({ message: 'Task not found' });
      return res.json(task);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public static async createTask(req: Request, res: Response): Promise<Response> {
    try {
      const task = await TaskService.createTask(req.body);
      return res.status(201).json(task);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public static async updateTask(req: Request, res: Response): Promise<Response> {
    try {
      const task = await TaskService.updateTask(req.params.id, req.body);
      if (!task) return res.status(404).json({ message: 'Task not found' });
      return res.json(task);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public static async deleteTask(req: Request, res: Response): Promise<Response> {
    try {
      const success = await TaskService.deleteTask(req.params.id);
      if (!success) return res.status(404).json({ message: 'Task not found' });
      return res.json({ message: 'Task deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}