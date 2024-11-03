import cors from 'cors';
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import xss from 'xss-clean';
import globalErrorHandler from './middlewares/errorMw.js';
import protect from './middlewares/protectMw.js';
import authRouter from './routes/authRoutes.js';
import budgetRouter from './routes/budgetRoutes.js';
import categoryRouter from './routes/categoryRoutes.js';
import expenseRouter from './routes/expenseRoutes.js';
import userRouter from './routes/userRoutes.js';
import AppError from './utils/appError.js';

const app = express();

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests. Please try again in an hour.',
});

app.use(helmet());
// app.use(limiter);
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));

//> Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//> Data sanitization against XSS
app.use(xss());

//> Prevent parameter pollution by parsing GET request query parameters
app.use(hpp());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'API is working properly',
    requestTime: req.requestTime,
  });
});

app.use('/api/v1', authRouter);

app.use(protect);

app.use('/api/v1/user', userRouter);
app.use('/api/v1/budget', budgetRouter);
app.use('/api/v1/expense', expenseRouter);
app.use('/api/v1/category', categoryRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
