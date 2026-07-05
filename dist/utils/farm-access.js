"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = isAdmin;
exports.cowScopeWhere = cowScopeWhere;
exports.assertCowAccess = assertCowAccess;
const cow_model_1 = require("../models/cow.model");
function isAdmin(role) {
    return role === 'admin';
}
function cowScopeWhere(userId, role) {
    if (isAdmin(role))
        return {};
    return { ownerId: userId };
}
async function assertCowAccess(cowId, userId, role) {
    const cow = await cow_model_1.Cow.findByPk(cowId);
    if (!cow)
        throw new Error('Cow not found');
    if (!isAdmin(role) && cow.ownerId !== userId) {
        throw new Error('You do not have access to this cow');
    }
    return cow;
}
