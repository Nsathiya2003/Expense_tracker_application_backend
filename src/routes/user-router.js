import express from 'express';
import { createUser, findUser, updateUser, userLogin } from '../controller/user-controller.js';

export const userRouter = express.Router();

userRouter.post('/create',createUser)

userRouter.get('/get/:id',findUser)

userRouter.put('/update/:id',updateUser)

userRouter.post('/login',userLogin)

// userRouter.post('/forgot-password',)

