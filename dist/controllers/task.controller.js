"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const task_service_1 = require("../services/task.service");
class TaskController {
    static async getAllTasks(req, res) {
        try {
            const tasks = await task_service_1.TaskService.getAllTasks();
            return res.json(tasks);
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
    static async getDeveloperTasks(req, res) {
        try {
            const tasks = await task_service_1.TaskService.getTasksByDeveloper(req.user.id);
            return res.json(tasks);
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
    static async getTaskById(req, res) {
        try {
            const task = await task_service_1.TaskService.getTaskById(req.params.id);
            if (!task)
                return res.status(404).json({ message: 'Task not found' });
            return res.json(task);
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
    static async createTask(req, res) {
        try {
            const task = await task_service_1.TaskService.createTask(req.body);
            return res.status(201).json(task);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
    static async updateTask(req, res) {
        try {
            const task = await task_service_1.TaskService.updateTask(req.params.id, req.body);
            if (!task)
                return res.status(404).json({ message: 'Task not found' });
            return res.json(task);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
    static async deleteTask(req, res) {
        try {
            const success = await task_service_1.TaskService.deleteTask(req.params.id);
            if (!success)
                return res.status(404).json({ message: 'Task not found' });
            return res.json({ message: 'Task deleted successfully' });
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}
exports.TaskController = TaskController;
