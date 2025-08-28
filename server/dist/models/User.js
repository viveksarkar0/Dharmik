"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.Role = void 0;
exports.hashPassword = hashPassword;
const mongoose_1 = __importStar(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
var Role;
(function (Role) {
    Role["Admin"] = "admin";
    Role["Member"] = "member";
})(Role || (exports.Role = Role = {}));
const userSchema = new mongoose_1.Schema({
    avatar: {
        type: String,
        default: function () {
            return 'https://avatar.iran.liara.run/public/boy';
        },
    },
    firstName: { type: String },
    lastName: { type: String, default: "" },
    bio: { type: String, default: "" },
    username: {
        type: String,
        get() {
            return (this.firstName + this.email.slice(0, 5)).trim();
        },
    },
    fullName: {
        type: String,
        get() {
            return `${this.firstName} ${this.lastName}`.trim();
        },
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    salt: { type: String, required: true, select: false }, // Store salt
    onboard: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    account: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Account",
    },
    role: { type: String, enum: Object.values(Role), default: Role.Member },
    status: {
        status: Boolean,
        lastLoginAt: Date,
        lastLogoutAt: Date,
    },
    lastSeen: Date,
    starredChats: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Chat'
        }]
}, { timestamps: true });
// method to hash password
async function hashPassword(password) {
    const salt = crypto_1.default.randomBytes(16).toString("hex");
    const hash = crypto_1.default
        .pbkdf2Sync(password, salt, 10000, 32, "sha512")
        .toString("hex");
    return { hash, salt };
}
// Instance method to compare password
userSchema.methods.comparePassword = function (password) {
    const hashedPassword = crypto_1.default
        .pbkdf2Sync(password, this.salt, 10000, 32, "sha512")
        .toString("hex");
    return hashedPassword === this.password;
};
exports.UserModel = mongoose_1.default.models.User || mongoose_1.default.model("User", userSchema);
