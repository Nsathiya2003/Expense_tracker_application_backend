import mongoose from "mongoose";
import Income from "../models/income -model.js";
import User from "../models/user-model.js";

export const createIncome = async(req,res) => {
    const { income_category,income_amount,income_date,notes,payment_receive_mode,saving_contribution,goal_id,goal_contribute_amount} = req.body;
    const date = new Date();
    const user_id = req.user.id;

    try{
        const data = await Income.create({
            income_category:income_category,
            income_amount:income_amount,
            notes:notes,
            payment_receive_mode:payment_receive_mode,
            income_date:income_date,
            saving_contribution:saving_contribution,
            goal_id:goal_id,
            goal_contribute_amount:goal_contribute_amount,
            createdBy: user_id,
            updatedBy:null,
            updatedAt:null
        });
        return res.status(201).json({
            status:true,
            message:'income data created successfully',
            data:data
        })
    }
    catch(err){
        return res.status(500).json({
            status:false,
            message:`Error creating income data${err.message}`,
            data:[]
        })
    }
}

export const findAll = async (req,res) => {
    const userId = req.user._id;
    try{
        const data = await Income.find({createdBy:userId,isDeleted:false});
        return res.status(201).json({
            status:true,
            message:'income fetched successfully',
            data:data
        });
    }
    catch(err){
        return res.status(500).json({
            status:false,
            message:`Error occur find data ${err.message}`,
            data:[]
        })
    }
}

export const findOne = async (req,res) => {
    const {id} = req.params;
    try{
        const data = await Income.findById(id);
        if(!data){
            res.status(404).json({
                status:true,
                message:'data not found',
                data:[]
            })
        }
        return res.status(201).json({
              status:true,
              message:'data fetched successfully',
              data:data
        })
    }
    catch(err){
        return res.status(500).json({
            status:false,
            message:`Error fetching details`,
            data:[]
        })
    }
}

export const updateIncome = async (req,res) => {
    const { id } = req.params;
    const {category, other_category,income_amount,notes,payment_receive_mode} = req.body;
    const user_id = req.user.id;

    const date = new Date();
    try{
        const findIncome = await Income.findById(id);
        console.log('findIncome------',findIncome)

        findIncome.category = category,
        findIncome.other_category = other_category,
        findIncome.income_amount = income_amount,
        findIncome.notes = notes,
        findIncome.payment_receive_mode = payment_receive_mode,
        findIncome.income_date = date,
        findIncome.updatedBy = user_id

        await findIncome.save();

        return res.status(401).json({
            status:true,
            message:'income updated successfully',
            data:findIncome
        })

    }
    catch(error){
        return res.status(500).json({
            status:false,
            message:`Error updating data${error.message}`,
            data:[]
        })
    }
}

export const deleteIncome = async (req,res) => {
    const { id} = req.params;
    const data = await Income.findById(id);
    data.isDeleted = true
    await data.save();
    return res.status(201).json( {
        status:true,
        message:'income deleted successfully',
        data:data
    });


}