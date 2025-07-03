import { Task } from '../models/task.model';
import { User } from '../models/user.model';
import { ITask, ITaskUpdate } from '../interfaces/task.interface';
import { z } from 'zod';

export class TaskService {
  private static taskSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    status: z.enum(['pending', 'in_progress', 'completed']).optional(),
    developerId: z.string().uuid(),
  });

  private static taskUpdateSchema = z.object({
    status: z.enum(['pending', 'in_progress', 'completed']),
  });

  public static async createTask(taskData: ITask): Promise<Task> {
    const validatedData = this.taskSchema.parse(taskData);
    return await Task.create<any>(validatedData);
  }

  public static async getAllTasks(): Promise<Task[]> {
    return await Task.findAll({ include: [{ model: User, as: 'developer' }] });
  }

  public static async getTasksByDeveloper(developerId: string): Promise<Task[]> {
    return await Task.findAll({ 
      where: { developerId },
      include: [{ model: User, as: 'developer' }]
    });
  }

  public static async getTaskById(id: string): Promise<Task | null> {
    return await Task.findByPk(id, { include: [{ model: User, as: 'developer' }] });
  }

  public static async updateTask(id: string, taskData: ITaskUpdate): Promise<Task | null> {
    const task = await Task.findByPk(id);
    if (!task) return null;

    const validatedData = this.taskUpdateSchema.parse(taskData);
    // Cast status to TaskStatus to satisfy Sequelize type
    return await task.update({ ...validatedData, status: validatedData.status as Task['status'] });
  }

  public static async deleteTask(id: string): Promise<boolean> {
    const deleted = await Task.destroy({ where: { id } });
    return deleted > 0;
  }
}