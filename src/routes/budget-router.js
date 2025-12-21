import express from "express";
import { isAuthenticated } from "../middleware/authorization-middleware.js";
import { createBudget, deleteBudget, filterBudget, getBudgetById, getBudgets, updateBudget } from "../controller/budget-controller.js";

const budgetRouter = express.Router();

budgetRouter.post('/create',isAuthenticated,createBudget);

budgetRouter.get('/find',isAuthenticated,getBudgets);

budgetRouter.get('/get/:id',isAuthenticated,getBudgetById);

budgetRouter.put('/update/:id',isAuthenticated,updateBudget);

budgetRouter.delete('/delete/:id',isAuthenticated,deleteBudget);

budgetRouter.post('/filter',isAuthenticated,filterBudget);

export default budgetRouter;