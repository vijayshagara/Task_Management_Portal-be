import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';

export class UserController {
  public static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await UserService.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async getDevelopers(req: Request, res: Response): Promise<void> {
    try {
      const developers = await UserService.getDevelopers();
      res.json(developers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const user = await UserService.getUserById(req.params.id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async createUser(req: Request, res: Response): Promise<void> {
    try {
      // const user = await UserService.createUser(req.body);
      const user = await AuthService.register(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await UserService.updateUser(req.params.id, req.body);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const success = await UserService.deleteUser(req.params.id);
      if (!success) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}