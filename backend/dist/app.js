"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const database_1 = require("./config/database");
const env_1 = require("./config/env");
const error_1 = require("./middleware/error");
const rateLimiter_1 = require("./middleware/rateLimiter");
// Route imports
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const post_routes_1 = __importDefault(require("./routes/post.routes"));
const tag_routes_1 = __importDefault(require("./routes/tag.routes"));
const comment_routes_1 = __importDefault(require("./routes/comment.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const search_routes_1 = __importDefault(require("./routes/search.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const media_routes_1 = __importDefault(require("./routes/media.routes"));
const draft_routes_1 = __importDefault(require("./routes/draft.routes"));
const bookmark_routes_1 = __importDefault(require("./routes/bookmark.routes"));
const collection_routes_1 = __importDefault(require("./routes/collection.routes"));
const app = (0, express_1.default)();
// Connect to MongoDB
(0, database_1.connectDB)();
// Middleware
//helmet is a middleware that helps to secure Express apps by setting various HTTP headers
// It helps to protect against common vulnerabilities like clickjacking, cross-site scripting (XSS), and other attacks
// It sets various HTTP headers to help protect the app from well-known web vulnerabilities
// It is a collection of smaller middleware functions that set security-related HTTP headers
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: env_1.config.clientUrl,
    credentials: true
}));
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Logging
if (env_1.config.nodeEnv === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
// Static files
app.use('/uploads', express_1.default.static('uploads'));
// Rate limiting
app.use('/api', rateLimiter_1.apiLimiter);
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/posts', post_routes_1.default);
app.use('/api/tags', tag_routes_1.default);
app.use('/api/comments', comment_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/search', search_routes_1.default);
app.use('/api/categories', category_routes_1.default);
app.use('/api/media', media_routes_1.default);
app.use('/api/drafts', draft_routes_1.default);
app.use('/api/bookmarks', bookmark_routes_1.default);
app.use('/api/collections', collection_routes_1.default);
// Root route
app.get('/', (_req, res) => {
    res.json({
        message: 'Blog API Server',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            posts: '/api/posts',
            users: '/api/users'
        }
    });
});
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Error handling
app.use(error_1.notFound);
app.use(error_1.errorHandler);
exports.default = app;
