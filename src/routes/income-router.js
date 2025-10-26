import express from 'express';
import { createIncome, deleteIncome, findAll, findOne, updateIncome } from '../controller/income-controller.js';
import { isAuthenticated } from '../middleware/authorization-middleware.js';

export const incomeRouter = express.Router();

incomeRouter.post('/create',isAuthenticated, createIncome)

incomeRouter.get('/find',isAuthenticated,findAll)

incomeRouter.get('/get/:id',isAuthenticated,findOne)

incomeRouter.put('/update/:id',isAuthenticated,updateIncome)

incomeRouter.delete('/delete/:id',isAuthenticated,deleteIncome)