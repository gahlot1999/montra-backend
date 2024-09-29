import express from 'express';
import {
  addExpense,
  deleteExpense,
  getExpense,
  updateExpense,
} from '../controllers/expenseController.js';
import checkBudgetAccess from '../middlewares/checkBudgetAccessMw.js';

const router = express.Router({ mergeParams: true });

router.use(checkBudgetAccess);

router.route('/').post(addExpense);
router
  .route('/:expenseId')
  .get(getExpense)
  .delete(deleteExpense)
  .put(updateExpense);

export default router;
