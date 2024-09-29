import express from 'express';
import {
  addBudget,
  getAllBudget,
  getBudget,
  deleteBudget,
  updateBudget,
} from '../controllers/budgetController.js';
import expenseRouter from './expenseRoutes.js';

const router = express.Router();

router.use('/:budgetId/expense', expenseRouter);
router.route('/').get(getAllBudget).post(addBudget);
router
  .route('/:budgetId')
  .get(getBudget)
  .delete(deleteBudget)
  .put(updateBudget);

export default router;
