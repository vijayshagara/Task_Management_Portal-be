"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceListing = exports.ListingStatus = exports.ListingType = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const user_model_1 = __importDefault(require("./user.model"));
const cow_model_1 = __importDefault(require("./cow.model"));
var ListingType;
(function (ListingType) {
    ListingType["COW"] = "cow";
    ListingType["CALF"] = "calf";
    ListingType["BULL"] = "bull";
    ListingType["FODDER"] = "fodder";
    ListingType["EQUIPMENT"] = "equipment";
    ListingType["DAIRY_PRODUCT"] = "dairy_product";
})(ListingType || (exports.ListingType = ListingType = {}));
var ListingStatus;
(function (ListingStatus) {
    ListingStatus["ACTIVE"] = "active";
    ListingStatus["SOLD"] = "sold";
    ListingStatus["DRAFT"] = "draft";
})(ListingStatus || (exports.ListingStatus = ListingStatus = {}));
let MarketplaceListing = class MarketplaceListing extends sequelize_typescript_1.Model {
};
exports.MarketplaceListing = MarketplaceListing;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        primaryKey: true,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
    }),
    __metadata("design:type", String)
], MarketplaceListing.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false }),
    __metadata("design:type", String)
], MarketplaceListing.prototype, "sellerId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(ListingType)),
        allowNull: false,
    }),
    __metadata("design:type", String)
], MarketplaceListing.prototype, "listingType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], MarketplaceListing.prototype, "title", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: true }),
    __metadata("design:type", Object)
], MarketplaceListing.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.ARRAY(sequelize_typescript_1.DataType.STRING), defaultValue: [] }),
    __metadata("design:type", Array)
], MarketplaceListing.prototype, "photos", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", Object)
], MarketplaceListing.prototype, "breed", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", Object)
], MarketplaceListing.prototype, "age", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.FLOAT, allowNull: true }),
    __metadata("design:type", Object)
], MarketplaceListing.prototype, "weight", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", Object)
], MarketplaceListing.prototype, "milkProduction", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", Object)
], MarketplaceListing.prototype, "pregnancyStatus", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: true }),
    __metadata("design:type", Object)
], MarketplaceListing.prototype, "healthInfo", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", Object)
], MarketplaceListing.prototype, "vaccinationStatus", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(12, 2), allowNull: false }),
    __metadata("design:type", Number)
], MarketplaceListing.prototype, "price", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.BOOLEAN, defaultValue: false }),
    __metadata("design:type", Boolean)
], MarketplaceListing.prototype, "negotiable", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", Object)
], MarketplaceListing.prototype, "location", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(ListingStatus)),
        defaultValue: ListingStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], MarketplaceListing.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => cow_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: true }),
    __metadata("design:type", Object)
], MarketplaceListing.prototype, "cowId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.default),
    __metadata("design:type", user_model_1.default)
], MarketplaceListing.prototype, "seller", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => cow_model_1.default),
    __metadata("design:type", cow_model_1.default)
], MarketplaceListing.prototype, "cow", void 0);
exports.MarketplaceListing = MarketplaceListing = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'marketplace_listings', timestamps: true })
], MarketplaceListing);
exports.default = MarketplaceListing;
