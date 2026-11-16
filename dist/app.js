"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const google_service_1 = require("./services1/google.service");
const env_1 = __importDefault(require("./utils/env"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const cow_routes_1 = __importDefault(require("./routes/cow.routes"));
const health_record_routes_1 = __importDefault(require("./routes/health-record.routes"));
const heat_cycle_routes_1 = __importDefault(require("./routes/heat-cycle.routes"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const profile_routes_1 = __importDefault(require("./routes/profile.routes"));
const post_routes_1 = __importDefault(require("./routes/post.routes"));
const follow_routes_1 = __importDefault(require("./routes/follow.routes"));
const social_routes_1 = __importDefault(require("./routes/social.routes"));
const farm_routes_1 = __importDefault(require("./routes/farm.routes"));
const init_db_1 = require("./config/init-db");
const app = (0, express_1.default)();
// Behind Railway / Vercel / Netlify proxies — needed so rate limiting sees the real client IP.
app.set('trust proxy', 1);
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "https://task-management-portal-be.vercel.app",
    "https://toral-cattle-farm.netlify.app",
    "https://toral-cattle-farm.netlify.app/",
    // Extra origins for new deployments, e.g. CORS_ORIGINS=https://my-app.up.railway.app,https://example.com
    ...(process.env.CORS_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean),
];
/** Vite may bind 5173+ when multiple instances run; allow local dev hosts. */
function isAllowedOrigin(origin) {
    if (!origin)
        return true;
    if (allowedOrigins.includes(origin))
        return true;
    if (env_1.default.NODE_ENV !== 'production') {
        try {
            const url = new URL(origin);
            if ((url.hostname === 'localhost' || url.hostname === '127.0.0.1') &&
                url.protocol === 'http:') {
                return true;
            }
        }
        catch {
            return false;
        }
    }
    return false;
}
function corsOrigin(origin, callback) {
    // Use false (not Error) so rejected origins get a clean CORS failure, not HTTP 500
    callback(null, isAllowedOrigin(origin));
}
// --------------------
// Middleware
// --------------------
app.use((0, cors_1.default)({
    origin: corsOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.options(/.*/, (0, cors_1.default)({
    origin: corsOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// Security headers (images are served cross-origin to the web/mobile apps).
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express_1.default.json({ limit: '10mb' }));
// Brute-force protection for credential endpoints.
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many attempts. Please try again in a few minutes.' },
});
app.use(['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password', '/api/auth/reset-password'], authLimiter);
// General API limiter (generous; protects against runaway clients).
app.use('/api', (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many requests. Please slow down.' },
}));
// Ensure DB schema is up to date (fixes missing columns on Vercel production)
app.use(async (_req, res, next) => {
    try {
        await (0, init_db_1.ensureDbReady)();
        next();
    }
    catch (error) {
        console.error('DB init failed:', error.message);
        res.status(503).json({ message: 'Database unavailable', detail: error.message });
    }
});
// --------------------
// Routes
// --------------------
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/cows', cow_routes_1.default);
app.use('/api/health', health_record_routes_1.default);
app.use('/api/heat-cycles', heat_cycle_routes_1.default);
app.use('/api/tasks', task_routes_1.default);
app.use('/api/profile', profile_routes_1.default);
app.use('/api/posts', post_routes_1.default);
app.use('/api/follow', follow_routes_1.default);
app.use('/api/social', social_routes_1.default);
app.use('/api/farm', farm_routes_1.default);
// --------------------
// Health check (IMPORTANT for free hosting)
// --------------------
app.get('/health', (_, res) => {
    res.status(200).json({ status: 'ok' });
});
// --------------------
// Error handling
// --------------------
app.use('/api', (_req, res) => {
    res.status(404).json({ message: 'Not found' });
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err?.message || err);
    if (res.headersSent)
        return;
    const status = err?.status || err?.statusCode || 500;
    res.status(status).json({ message: status >= 500 ? 'Internal server error' : err.message });
});
// Google OAuth helper routes — disabled in production
if (env_1.default.NODE_ENV !== 'production') {
    app.get("/generate-token", (req, res) => {
        if (!env_1.default.GOOGLE_CLIENT_ID || !env_1.default.GOOGLE_CLIENT_SECRET || !env_1.default.GOOGLE_REDIRECT_URI) {
            return res.status(400).json({
                error: "Google OAuth credentials not configured in .env",
                required: [
                    "GOOGLE_CLIENT_ID",
                    "GOOGLE_CLIENT_SECRET",
                    "GOOGLE_REDIRECT_URI",
                ],
            });
        }
        if (!google_service_1.oauth2Client) {
            return res.status(500).json({ error: "OAuth client not initialized" });
        }
        const url = google_service_1.oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: ["https://www.googleapis.com/auth/calendar"],
            prompt: "consent",
        });
        res.redirect(url);
    });
    app.get("/oauth2callback", async (req, res) => {
        try {
            const { code } = req.query;
            if (!code) {
                return res.status(400).send("Missing authorization code");
            }
            if (!google_service_1.oauth2Client) {
                return res.status(500).json({ error: "OAuth client not initialized" });
            }
            const { tokens } = await google_service_1.oauth2Client.getToken(code);
            if (!tokens.refresh_token) {
                return res.status(400).send("Failed to obtain refresh token");
            }
            console.log("\n");
            console.log("═".repeat(60));
            console.log("🔥 REFRESH TOKEN GENERATED SUCCESSFULLY 🔥");
            console.log("═".repeat(60));
            console.log("\n📋 Add this to your .env file:\n");
            console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
            console.log("═".repeat(60));
            console.log("\n");
            res.send(`
        <h1>Success</h1>
        <p>Your refresh token has been generated and printed in the server console.</p>
        <p>Copy the token from your terminal and add it to your .env file.</p>
        <p>Then restart your server.</p>
      `);
        }
        catch (error) {
            console.error("Token generation error:", error.message);
            res.status(500).send(`<h1>Error generating refresh token</h1><p>See server logs for details.</p>`);
        }
    });
}
exports.default = app;
