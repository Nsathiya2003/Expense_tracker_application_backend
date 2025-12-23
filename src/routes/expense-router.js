import express from 'express';
import { isAuthenticated } from '../middleware/authorization-middleware.js';
import { checkBudgetLimit, createExpense, deleteExpense, filterExpense, findAllExpense, getExpenseById, updateExpense } from '../controller/expense-controller.js';

const expenseRouter = express.Router();

expenseRouter.post('/create',isAuthenticated,createExpense);

expenseRouter.get('/find',isAuthenticated,findAllExpense);

expenseRouter.get('/get/:id',isAuthenticated,getExpenseById);

expenseRouter.put('/update/:id',isAuthenticated,updateExpense);

expenseRouter.delete('/delete/:id',isAuthenticated,deleteExpense);

expenseRouter.post('/filter',isAuthenticated,filterExpense);

expenseRouter.post('/checkBudgetLimit',isAuthenticated,checkBudgetLimit)



export { expenseRouter };