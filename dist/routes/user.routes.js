"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', (0, auth_middleware_1.authMiddleware)(['admin']), (req, res, next) => {
    user_controller_1.UserController.getAllUsers(req, res).catch(next);
});
router.get('/developers', (0, auth_middleware_1.authMiddleware)(['admin']), (req, res, next) => {
    user_controller_1.UserController.getDevelopers(req, res).catch(next);
});
router.get('/:id', (0, auth_middleware_1.authMiddleware)(['admin']), (req, res, next) => {
    user_controller_1.UserController.getUserById(req, res).catch(next);
});
router.post('/', (0, auth_middleware_1.authMiddleware)(['admin']), (req, res, next) => {
    user_controller_1.UserController.createUser(req, res).catch(next);
});
router.put('/:id', (0, auth_middleware_1.authMiddleware)(['admin']), (req, res, next) => {
    user_controller_1.UserController.updateUser(req, res).catch(next);
});
router.delete('/:id', (0, auth_middleware_1.authMiddleware)(['admin']), (req, res, next) => {
    user_controller_1.UserController.deleteUser(req, res).catch(next);
});
exports.default = router;
