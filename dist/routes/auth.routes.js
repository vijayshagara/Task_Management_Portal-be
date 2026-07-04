"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
router.post('/register', (req, res) => auth_controller_1.AuthController.register(req, res));
router.post('/login', (req, res) => auth_controller_1.AuthController.login(req, res));
exports.default = router;
