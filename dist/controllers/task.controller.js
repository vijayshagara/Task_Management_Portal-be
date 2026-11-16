"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const task_service_1 = require("../services/task.service");
const auth_interface_1 = require("../interfaces/auth.interface");
const bulk_1 = require("../utils/bulk");
const zod_1 = require("zod");
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
            const tasks = await task_service_1.TaskService.getTasksByDeveloper((0, auth_interface_1.getUserId)(req));
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
            if (req.user.role !== 'admin' && task.developerId !== (0, auth_interface_1.getUserId)(req)) {
                return res.status(403).json({ message: 'Forbidden' });
            }
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
            const existing = await task_service_1.TaskService.getTaskById(req.params.id);
            if (!existing)
                return res.status(404).json({ message: 'Task not found' });
            if (req.user.role !== 'admin' && existing.developerId !== (0, auth_interface_1.getUserId)(req)) {
                return res.status(403).json({ message: 'Forbidden' });
            }
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
    static async bulkDeleteTasks(req, res) {
        try {
            const ids = (0, bulk_1.parseBulkIds)(req.body);
            const result = await task_service_1.TaskService.bulkDeleteTasks(ids);
            return res.json(result);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
    static async bulkUpdateStatus(req, res) {
        try {
            const schema = zod_1.z.object({
                ids: zod_1.z.array(zod_1.z.string().uuid()).min(1).max(500),
                status: zod_1.z.enum(['pending', 'in_progress', 'completed']),
            });
            const { ids, status } = schema.parse(req.body);
            const result = await task_service_1.TaskService.bulkUpdateStatus(ids, status);
            return res.json(result);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
}
exports.TaskController = TaskController;
