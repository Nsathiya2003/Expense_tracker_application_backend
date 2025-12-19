import Income from "../models/income -model.js";
import { GoalHistory } from "../models/goal-history-model.js";
import { Goal } from "../models/goal-model.js";

export const createIncome = async(req,res) => {
    const { income_category,income_amount,income_date,notes,payment_receive_mode,saving_contribution,goal_id,goal_contribute_amount} = req.body;
    const date = new Date();
    const user_id = req.user.id;

    try{

        if(goal_contribute_amount > income_amount){
            return res.status(404).json({
                status:false,
                message:'Your goal spend amount is greater than income amount',
                data: null
            })
        }

        let after_saving_amount = income_amount - goal_contribute_amount;
        
        const data = await Income.create({
            income_category:income_category,
            income_amount:after_saving_amount,
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

        //create a goal history...
         let saved = await GoalHistory.create({
            goal_id: goal_id,
            income_type: income_category,
            allocated_amount:goal_contribute_amount,
            createdBy: user_id,
            updatedBy:null,
        });
        console.log('saved-----',saved)

        //set the goal amount...
        let findGoal = await Goal.findById(goal_id);
        console.log('findGoal is---',findGoal)

        findGoal.allocated_amount = findGoal?.allocated_amount + goal_contribute_amount;
        await findGoal.save()

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
    const userId = req.user.id;
    console.log('userID is---',userId)
    try{
        const data = await Income.find({createdBy:userId,isDeleted:false}).populate(['createdBy','goal_id'])
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
    const {category, other_category,income_amount,notes,payment_receive_mode,saving_contribution,goal_contribute_amount} = req.body;
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
        findIncome.saving_contribution = saving_contribution,
        findIncome.goal_contribute_amount = goal_contribute_amount,
        findIncome.updatedBy = user_id

        await findIncome.save();

        return res.status(201).json({
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

export const filterIncome = async (req,res) => {
    const { page, limit, search, fromDate, toDate, income_date,goal_id} = req.body;
    const user_id = req?.user?.id;    

    //1.set needed condition based...
    let query = {
        createdBy: user_id
    } 

    //2.search
    if(search){
        query.$or =[
            {income_category : { $regex: search, $options: "i"} },
        ]
    }

    //3.filter
    if(fromDate && toDate){
        query.createdAt = {
            $gte: fromDate,
            $lte: toDate
        }
    }

    //deadline_date 
    if(income_date){
        query.income_date = income_date
    }
    if(goal_id){
        query.goal_id = goal_id
    }

    //3.total count 
    const total_count = await Income.countDocuments(query);

    //4. calculate paginated data...
    const data = await Income.find(query)
    .populate(["createdBy","goal_id"])
    .sort({ createdAt: -1})
    .skip((page-1)* limit)
    .limit(limit)

    //5.return response 
    return res.status(201).json({
        status: true,
        message:'Income data fetched successfully',
        data: data,
        pagination: {
            page: page,
            limit:limit,
            totalRecords:total_count,
            totalPages: Math.ceil(total_count/limit),
            hasNextPage:page <Math.ceil(total_count/limit),
            hasPrevPage:page>1
        }
    })


}