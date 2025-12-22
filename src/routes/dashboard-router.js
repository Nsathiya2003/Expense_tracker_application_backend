import express from 'express';
import { dashboardSummaryCards, getMonthlyIncomeExpenseChart, getSpendHistory } from '../controller/dashboard-controller.js';
import { isAuthenticated } from '../middleware/authorization-middleware.js';

const dashboardRouter = express.Router();

dashboardRouter.get('/summaryCards',isAuthenticated, dashboardSummaryCards);

dashboardRouter.get('/monthlyExpenseIncome',isAuthenticated,getMonthlyIncomeExpenseChart)

dashboardRouter.get("/spend-history", isAuthenticated, getSpendHistory);

export {dashboardRouter};