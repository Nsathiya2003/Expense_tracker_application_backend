import express from 'express';
import dotenv from 'dotenv';
import { userRouter } from './routes/user-router.js';
import { ConnectDB } from './config/db.js';

dotenv.config();
ConnectDB();

const app = express();

app.use(express.json()); //recive body data

app.use('/api/user',userRouter);


 
//create a server 
const port = process.env.PORT || 5000;
app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
});
