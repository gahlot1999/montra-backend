import express from 'express';
import {
  addCategory,
  deleteCategory,
  getAllCategory,
} from '../controllers/categoryController.js';

const router = express.Router();

router.route('/').get(getAllCategory).post(addCategory);
router.delete('/:categoryId', deleteCategory);

export default router;
