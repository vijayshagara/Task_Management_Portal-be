"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cow_controller_1 = require("../controllers/cow.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const router = (0, express_1.Router)();
router.get('/', (0, auth_middleware_1.authMiddleware)([]), (req, res, next) => {
    cow_controller_1.CowController.getAllCows(req, res).catch(next);
});
router.get('/:id/image', (req, res, next) => {
    cow_controller_1.CowController.getCowImage(req, res).catch(next);
});
router.post('/:id/image', (0, auth_middleware_1.authMiddleware)(['admin']), upload_middleware_1.cowImageUpload.single('image'), (req, res, next) => {
    cow_controller_1.CowController.uploadCowImage(req, res).catch(next);
});
router.get('/:id', (0, auth_middleware_1.authMiddleware)([]), (req, res, next) => {
    cow_controller_1.CowController.getCowById(req, res).catch(next);
});
router.post('/', (0, auth_middleware_1.authMiddleware)(['admin']), (req, res, next) => {
    cow_controller_1.CowController.createCow(req, res).catch(next);
});
router.put('/:id', (0, auth_middleware_1.authMiddleware)(['admin']), (req, res, next) => {
    cow_controller_1.CowController.updateCow(req, res).catch(next);
});
router.delete('/:id', (0, auth_middleware_1.authMiddleware)(['admin']), (req, res, next) => {
    cow_controller_1.CowController.deleteCow(req, res).catch(next);
});
exports.default = router;
