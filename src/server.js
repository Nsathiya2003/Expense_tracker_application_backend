import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use((req,res)=>{
    console.log(req);
});

// app.use('/user');

//create a server 
const port = process.env.PORT || 5000;
app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
});
