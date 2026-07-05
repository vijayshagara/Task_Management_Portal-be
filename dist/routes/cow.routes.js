"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cow_controller_1 = require("../controllers/cow.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const router = (0, express_1.Router)();
const auth = (0, auth_middleware_1.authMiddleware)([]);
const farmWrite = (0, auth_middleware_1.authMiddleware)(['admin', 'farmer']);
router.get('/', auth, (req, res, next) => {
    cow_controller_1.CowController.getAllCows(req, res).catch(next);
});
router.get('/:id/image', (req, res, next) => {
    cow_controller_1.CowController.getCowImage(req, res).catch(next);
});
router.post('/:id/image', farmWrite, upload_middleware_1.cowImageUpload.single('image'), (req, res, next) => {
    cow_controller_1.CowController.uploadCowImage(req, res).catch(next);
});
router.get('/:id', auth, (req, res, next) => {
    cow_controller_1.CowController.getCowById(req, res).catch(next);
});
router.post('/', farmWrite, (req, res, next) => {
    cow_controller_1.CowController.createCow(req, res).catch(next);
});
router.put('/:id', farmWrite, (req, res, next) => {
    cow_controller_1.CowController.updateCow(req, res).catch(next);
});
router.delete('/:id', farmWrite, (req, res, next) => {
    cow_controller_1.CowController.deleteCow(req, res).catch(next);
});
exports.default = router;
