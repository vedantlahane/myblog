import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { connectDB } from './config/database';
import { config } from './config/env';
import { errorHandler, notFound } from './middleware/error';
import { apiLimiter } from './middleware/rateLimiter';

// Route imports
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import postRoutes from './routes/post.routes';
import tagRoutes from './routes/tag.routes';
import commentRoutes from './routes/comment.routes';
import notificationRoutes from './routes/notification.routes';
import searchRoutes from './routes/search.routes';
import categoryRoutes from './routes/category.routes';
import mediaRoutes from './routes/media.routes';
import draftRoutes from './routes/draft.routes';
import bookmarkRoutes from './routes/bookmark.routes';
import collectionRoutes from './routes/collection.routes';

const app: Application = express();

// Connect to MongoDB
connectDB();

// Middleware

//helmet is a middleware that helps to secure Express apps by setting various HTTP headers
// It helps to protect against common vulnerabilities like clickjacking, cross-site scripting (XSS), and other attacks
// It sets various HTTP headers to help protect the app from well-known web vulnerabilities
// It is a collection of smaller middleware functions that set security-related HTTP headers
app.use(helmet());
app.use(cors({
  origin: config.clientUrl,
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static files
app.use('/uploads', express.static('uploads'));

// Rate limiting
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/drafts', draftRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/collections', collectionRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;