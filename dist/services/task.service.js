"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const sequelize_1 = require("sequelize");
const task_model_1 = require("../models/task.model");
const user_model_1 = require("../models/user.model");
const zod_1 = require("zod");
class TaskService {
    static async createTask(taskData) {
        const validatedData = this.taskSchema.parse(taskData);
        return await task_model_1.Task.create(validatedData);
    }
    static async getAllTasks() {
        return await task_model_1.Task.findAll({ include: [{ model: user_model_1.User, as: 'developer' }] });
    }
    static async getTasksByDeveloper(developerId) {
        return await task_model_1.Task.findAll({
            where: { developerId },
            include: [{ model: user_model_1.User, as: 'developer' }]
        });
    }
    static async getTaskById(id) {
        return await task_model_1.Task.findByPk(id, { include: [{ model: user_model_1.User, as: 'developer' }] });
    }
    static async updateTask(id, taskData) {
        const task = await task_model_1.Task.findByPk(id);
        if (!task)
            return null;
        const validatedData = this.taskUpdateSchema.parse(taskData);
        // Cast status to TaskStatus to satisfy Sequelize type
        return await task.update({ ...validatedData, status: validatedData.status });
    }
    static async deleteTask(id) {
        const deleted = await task_model_1.Task.destroy({ where: { id } });
        return deleted > 0;
    }
    static async bulkDeleteTasks(ids) {
        const uniqueIds = [...new Set(ids)];
        const count = await task_model_1.Task.destroy({ where: { id: { [sequelize_1.Op.in]: uniqueIds } } });
        return { ids: uniqueIds, count };
    }
    static async bulkUpdateStatus(ids, status) {
        const uniqueIds = [...new Set(ids)];
        const { status: validatedStatus } = this.bulkStatusSchema.parse({ status });
        const [count] = await task_model_1.Task.update({ status: validatedStatus }, { where: { id: { [sequelize_1.Op.in]: uniqueIds } } });
        const items = await task_model_1.Task.findAll({
            where: { id: { [sequelize_1.Op.in]: uniqueIds } },
            include: [{ model: user_model_1.User, as: 'developer' }],
        });
        return { ids: items.map((t) => t.id), count, items };
    }
}
exports.TaskService = TaskService;
TaskService.taskSchema = zod_1.z.object({
    title: zod_1.z.string().min(3),
    description: zod_1.z.string().min(10),
    status: zod_1.z.enum(['pending', 'in_progress', 'completed']).optional(),
    developerId: zod_1.z.string().uuid(),
});
TaskService.taskUpdateSchema = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'in_progress', 'completed']),
});
TaskService.bulkStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'in_progress', 'completed']),
});
