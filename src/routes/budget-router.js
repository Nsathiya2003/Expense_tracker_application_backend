import express from "express";
import { isAuthenticated } from "../middleware/authorization-middleware.js";

const budgetRouter = express.Router();

budgetRouter.post('/create',isAuthenticated);

budgetRouter.get('/find',isAuthenticated);

budgetRouter.get('/find/:id',isAuthenticated);

budgetRouter.put('/update/:id',isAuthenticated);

budgetRouter.delete('/delete/:id',isAuthenticated);

budgetRouter.post('/filter',isAuthenticated);

export default budgetRouter;