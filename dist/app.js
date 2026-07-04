"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
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
const app = (0, express_1.default)();
const allowedOrigins = [
    "http://localhost:5173",
    "https://task-management-portal-be.vercel.app",
    "https://toral-cattle-farm.netlify.app/"
];
// --------------------
// Middleware
// --------------------
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // allow requests with no origin (Postman, mobile apps)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.options(/.*/, (0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' })); // safety for payload size
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
// --------------------
// Health check (IMPORTANT for free hosting)
// --------------------
app.get('/health', (_, res) => {
    res.status(200).json({ status: 'ok' });
});
// --------------------
// Error handling (enable later)
// --------------------
// app.use(errorHandler);
// 🔹 Generate Refresh Token (Temporary Route)
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
// 🔹 Callback Route
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
      <h1>✅ Success!</h1>
      <p>Your refresh token has been generated and printed in the server console.</p>
      <p>Copy the token from your terminal and add it to your .env file.</p>
      <p>Then restart your server.</p>
    `);
    }
    catch (error) {
        console.error("❌ Token generation error:", error.message);
        res.status(500).send(`<h1>Error generating refresh token</h1><p>${error.message}</p>`);
    }
});
exports.default = app;
