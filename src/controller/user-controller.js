import bcrypt from 'bcrypt';
import { generateAccessToken } from '../helpers/authentication.js';
import User from '../models/user-model.js';
import mongoose, { Types } from 'mongoose';

export const createUser = async (req,res) => {
        console.log("req.body----",req.body)

    const { username, mobileNumber, emailId, password} = req.body;
    console.log("req.body----",req.body)

    try{
        const existing = await User.findOne({ where : { emailId: emailId}});
        if(existing){
            return res.status(400).json({
                status:true,
                message:'EmailId already exists',
                data:[]
            });
        }
        //password hashing
        const hashedPassword = await bcrypt.hash(password,10);
        console.log('hashedPassword----',hashedPassword)

        const data = await User.create({
            username: username,
            mobileNumber:mobileNumber,
            emailId:emailId,
            password:hashedPassword
        });
         return res.status(200).json({
            status: true,
            message:'user created successfully',
            data: data
        })
    }
    catch(err){
        return res.status(500).json({
            status:false,
            message:`Error creating user ${err.message}`,
            data:[]
        })
    }
}

export const findUser = async (req,res) => {
    const { id} = req.params;
    const objectId = new mongoose.Types.ObjectId(String(id));
    try{
        const data = await User.findById(objectId);

        if(!data){
          return res.status(404).json({
            status:true,
            message:'user not found',
            data:[]
        });
        }
         return res.status(404).json({
            status:true,
            message:'user fetched successfully',
            data:data
        });
    }
    catch(err){
           return res.status(500).json({
            status:true,
            message:`Error occured find user${err.message}`,
            data:[]
        });
    }
}

export const updateUser = async (req,res) => {
    const {id} = req.params;
    const { username, mobileNumber , emailId} = req.body;
    const objectId = new mongoose.Types.ObjectId(String(id));

    try{    
        const existing = await User.findById(objectId);
        if(!existing){
          return res.status(404).json({
            status:true,
            message:'user not found',
            data:[]
        });
        }  
        const duplicateEmail = await User.findOne({
            emailId,
            _id: {$ne :objectId}
        })
        if(duplicateEmail){
            return res.status(404).json({
            status:true,
            message:'EmailId already exists',
            data:[]
            })
        }
        existing.username = username,
        existing.mobileNumber = mobileNumber,
        existing.emailId = emailId,
        existing.updatedBy = objectId
        // existing.password = password
        await existing.save();

        return res.status(201).json({
            status:true,
            message:'user updated successfully',
            data:existing
            })
    }
    catch(err){
        return res.status(500).json({
            status:false,
            message:`Error occuring update user${err.message}`,
            data:[]
        })
    }
}

export const userLogin = async (req,res) => {
    const { emailId, password } = req.body;
    try{
      const findUser = await User.findOne({ where : { emailId: emailId}});
        if(!findUser){
            return res.status(400).json({
                status:true,
                message:'EmailId is wrong please enter correct emailId',
                data:[]
            });
        }
      
        //password hash...
        const hashedPassword = bcrypt.hash(password,10);

        if(findUser.password!=hashedPassword){
            return res.status(400).json({
                status:true,
                message:'Password is wrong please enter correct password',
                data:[]
            });
        }
        //generate access-token 
        const token = await generateAccessToken(
          {
                id: findUser.id,
                emailId: findUser.emailId
            }
        )
        return res.status(201).json({
            status:true,
            message:'user logged in successfully',
            data:{
                data: findUser,
                access_token: token.access_token
            }
        })
    }
    catch(err){
        return res.status(500).json({
            status:true,
            message:`Error occuring login${err.message}`,
            data:[]
        })
    }





}