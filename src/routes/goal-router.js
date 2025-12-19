import express from 'express';
import { isAuthenticated } from '../middleware/authorization-middleware.js';
import { createGoal, deleteGoal, filterGoal, findAllGoal, findOne, updateGoal, viewGoalHistory } from '../controller/goal-controller.js';

export const goalRouter = express.Router();

goalRouter.post("/add",isAuthenticated,createGoal);

goalRouter.get("/find",isAuthenticated,findAllGoal);

goalRouter.get("/get/:id",isAuthenticated,findOne);

goalRouter.put("/update/:id",isAuthenticated,updateGoal);

goalRouter.delete("/delete/:id",isAuthenticated,deleteGoal);

goalRouter.post('/filter',isAuthenticated,filterGoal);

goalRouter.post('/viewGoalHistory',isAuthenticated,viewGoalHistory)

