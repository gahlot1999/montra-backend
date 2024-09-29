import express from 'express';
import {
  login,
  signup,
  forgotPassword,
  resetPassword,
  updatePassword,
} from '../controllers/authController.js';
import protect from '../middlewares/protectMw.js';

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updatePassword', protect, updatePassword);

export default router;
