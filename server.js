import mongoose from 'mongoose';
import app from './app.js';

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const PORT = process.env.PORT || 3000;
const dbUrl = process.env.DB_URL.replace('<DB_USER>', process.env.DB_USER)
  .replace('<DB_PASSWORD>', process.env.DB_PASSWORD)
  .replace('<DB_NAME>', process.env.DB_NAME);

mongoose
  .connect(dbUrl)
  .then(() => console.log('-----Connected to database-----'));

const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`),
);

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
