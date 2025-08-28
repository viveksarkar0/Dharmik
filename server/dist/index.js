"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV || "development"}` });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const db_1 = require("./config/db");
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const security_1 = require("./middleware/security");
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const stats_1 = __importDefault(require("./routes/stats"));
const app = (0, express_1.default)();
app.set('trust proxy', 1);
// Security middleware
app.use(security_1.securityMiddleware);
app.use(security_1.requestLogger);
// Rate limiting
app.use('/auth', rateLimiter_1.authLimiter);
app.use('/api', rateLimiter_1.apiLimiter);
// Basic middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
app.use(security_1.sanitizeInput);
// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174'
];
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
}));
// Static uploads
const uploadDir = path_1.default.join(process.cwd(), "uploads");
if (!fs_1.default.existsSync(uploadDir))
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express_1.default.static(uploadDir));
// Health route
app.get("/", (req, res) => {
    res.json({ status: "ok" });
});
// Routes
app.use("/auth", auth_1.default);
app.use("/users", users_1.default);
app.use("/tasks", tasks_1.default);
app.use("/stats", stats_1.default);
// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({ message: "API endpoint not found. Please check the URL." });
});
// Error handler
app.use(errorHandler_1.errorHandler);
const PORT = Number(process.env.PORT || 4000);
const HOST = process.env.HOST || "0.0.0.0";
// Connect to DB and start server
(0, db_1.connectDB)().then(() => {
    app.listen(PORT, HOST, () => {
        console.log(`🚀 Server running at http://${HOST}:${PORT}`);
    });
}).catch((error) => {
    console.error("❌ Error starting server:", error);
    process.exit(1);
});
