import express from 'express';
import { createUser, findUser, forgotOtp, resetPassword, updateUser, userLogin } from '../controller/user-controller.js';
import { upload } from '../middleware/multer.js';

export const userRouter = express.Router();

userRouter.post('/create',createUser)

userRouter.get('/get/:id',findUser) 

userRouter.put('/update/:id',upload.single('user_profile'), updateUser)

userRouter.post('/login',userLogin)

userRouter.post('/forgot-password',forgotOtp)

userRouter.post('/reset-password',resetPassword)


