import express from 'express';
import {
  addEmi,
  deleteEmi,
  getAllEmi,
  updateEmi,
} from '../controllers/emiController.js';

const router = express.Router();

router.route('/').get(getAllEmi).post(addEmi);
router.route('/:emiId').delete(deleteEmi).put(updateEmi);

export default router;
