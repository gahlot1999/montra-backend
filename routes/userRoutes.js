import express from 'express';
import {
  deleteUser,
  getAllUsers,
  updateUser,
} from '../controllers/userController.js';
import restrictTo from '../middlewares/restrictToMw.js';

const router = express.Router();

router.get('/', restrictTo('admin'), getAllUsers);
router.patch('/update/:id', updateUser);
router.delete('/delete/:id', deleteUser);

export default router;
