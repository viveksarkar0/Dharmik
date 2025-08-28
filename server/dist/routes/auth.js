"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const authValidation_1 = require("../validation/authValidation");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
router.post('/register', authValidation_1.registerValidation, validation_1.handleValidationErrors, authController_1.register);
router.post('/login', authValidation_1.loginValidation, validation_1.handleValidationErrors, authController_1.login);
router.post('/logout', authMiddleware_1.protect, authController_1.logout);
router.get('/me', authMiddleware_1.protect, authController_1.getMe);
exports.default = router;
