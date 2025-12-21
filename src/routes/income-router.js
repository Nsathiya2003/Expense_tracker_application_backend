import express from 'express';
import { createIncome, deleteIncome, filterIncome, findAll, findOne, incomeBalance, updateIncome } from '../controller/income-controller.js';
import { isAuthenticated } from '../middleware/authorization-middleware.js';

export const incomeRouter = express.Router();

incomeRouter.get('/incomeBalance/total',isAuthenticated,incomeBalance)

incomeRouter.post('/create',isAuthenticated, createIncome) 

incomeRouter.get('/find',isAuthenticated,findAll)

incomeRouter.get('/get/:id',isAuthenticated,findOne)

incomeRouter.put('/update/:id',isAuthenticated,updateIncome)

incomeRouter.delete('/delete/:id',isAuthenticated,deleteIncome)

incomeRouter.post('/filter',isAuthenticated,filterIncome)

