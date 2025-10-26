import express from 'express';
import dotenv from 'dotenv';
import { userRouter } from './routes/user-router.js';
import { ConnectDB } from './config/db.js';
import { incomeRouter } from './routes/income-router.js';

dotenv.config();
ConnectDB();

const app = express();

app.use(express.json()); //receive body data

app.use('/api/user',userRouter);
app.use('/api/income',incomeRouter)


 
//create a server 
const port = process.env.PORT || 5000;
app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
});
