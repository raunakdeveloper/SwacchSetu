import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { verifyTransporter } from './config/nodemailer.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import workerRoutes from './routes/workerRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

dotenv.config();

const app = express();

connectDB();
verifyTransporter();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Public PDF routes (non-API paths as requested) - also accessible via /api/notices
app.use('/notices', noticeRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/reports/:reportId/comments', commentRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/worker', workerRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
  res.send('Garbage Management System API is running');
});

// Error Handling Middleware  

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
