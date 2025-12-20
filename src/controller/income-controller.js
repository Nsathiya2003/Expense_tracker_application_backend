import Income from "../models/income -model.js";
import { GoalHistory } from "../models/goal-history-model.js";
import { Goal } from "../models/goal-model.js";
import mongoose from "mongoose";

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

        let goalId;
        if(goal_id){
            goalId = goal_id;
        }
        
        const data = await Income.create({
            income_category:income_category,
            income_amount:after_saving_amount,
            notes:notes,
            payment_receive_mode:payment_receive_mode,
            income_date:income_date,
            saving_contribution:saving_contribution,
            goal_id:goalId,
            goal_contribute_amount:goal_contribute_amount ? goal_contribute_amount : 0,
            createdBy: user_id,
            updatedBy:null,
            updatedAt:null
        });
        
        //set the goal amount...
        let findGoal;
        if(goalId){
            //create a goal history...
             await GoalHistory.create({
                goal_id: goalId,
                income_type: income_category,
                allocated_amount:goal_contribute_amount ? goal_contribute_amount : 0,
                createdBy: user_id,
                updatedBy:null,
                income_id: data._id
            });
        findGoal = await Goal.findById(goal_id);
        findGoal.allocated_amount = findGoal?.allocated_amount + goal_contribute_amount;
        await findGoal.save()
        }
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

export const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category,
      other_category,
      income_amount,
      notes,
      payment_receive_mode,
      saving_contribution,
      goal_contribute_amount,
      goal_id
    } = req.body;

    const user_id = req.user.id;
    const date = new Date();

    const findIncome = await Income.findById(id);

    if (!findIncome) {
      return res.status(404).json({
        status: false,
        message: "Income data not found",
        data: []
      });
    }

        // ⚠️ Update income_amount ONLY if user sends it
    if (income_amount !== undefined && findIncome.income_amount !== income_amount) {
      findIncome.income_amount = income_amount;
    }

    // ===============================
    // DETECT GOAL REMOVAL
    // ===============================
    const isGoalRemoved =
      (goal_id === "" || goal_id === null) &&
      findIncome.goal_id !== null;

    // ===============================
    // REMOVE GOAL CONTRIBUTION
    // ===============================
    if (isGoalRemoved) {
      const findGoalHistory = await GoalHistory.findOne({ income_id: id });

      if (findGoalHistory) {
        const findMainGoal = await Goal.findById(findGoalHistory.goal_id);

        // add back goal amount to income
        findIncome.income_amount += findGoalHistory.allocated_amount;

        // reduce goal allocation
        findMainGoal.allocated_amount -= findGoalHistory.allocated_amount;

        await Promise.all([
          findIncome.save(),
          findMainGoal.save(),
          GoalHistory.findByIdAndDelete(findGoalHistory._id)
        ]);
      }

      // clear goal fields
      findIncome.goal_id = null;
      findIncome.goal_contribute_amount = 0;
    }

    // ===============================
    // SAFE FIELD UPDATES
    // ===============================
    if (category !== undefined) {
      findIncome.income_category = category;
    }

    if (other_category !== undefined) {
      findIncome.other_category = other_category;
    }


    if (notes !== undefined) {
      findIncome.notes = notes;
    }

    if (payment_receive_mode !== undefined) {
      findIncome.payment_receive_mode = payment_receive_mode;
    }

    if (saving_contribution !== undefined) {
      findIncome.saving_contribution = saving_contribution;
    }

    if (goal_contribute_amount !== undefined && !isGoalRemoved) {
      findIncome.goal_contribute_amount = goal_contribute_amount;
    }

    // only set goal_id if NOT removed
    if (!isGoalRemoved && goal_id) {
      findIncome.goal_id = goal_id;
    }

    findIncome.income_date = date;
    findIncome.updatedBy = user_id;

    await findIncome.save();

    return res.status(200).json({
      status: true,
      message: "Income updated successfully",
      data: findIncome
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Error updating data: ${error.message}`,
      data: []
    });
  }
};




export const deleteIncome = async (req,res) => {
    const { id} = req.params;
    console.log('income id---',id)
    const data = await Income.findByIdAndDelete(id);
       return res.status(201).json( {
        status:true,
        message:'income deleted successfully',
        data:data
    });


}


export const filterIncome = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search,
      fromDate,
      toDate,
      income_date,
      goal_id
    } = req.body;

    const user_id = req?.user?.id;

    // pagination safety
    page = Number(page);
    limit = Number(limit);

    // ===============================
    // 1. BASE QUERY (find & count)
    // ===============================
    let query = {
      createdBy: user_id,
    };

    // ===============================
    // 2. SEARCH FILTER
    // ===============================
    if (search) {
      query.$or = [
        { income_category: { $regex: search, $options: "i" } }
      ];
    }

    // ===============================
    // 3. DATE RANGE FILTER
    // ===============================
    if (fromDate && toDate) {
      query.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate)
      };
    }

    // ===============================
    // 4. INCOME DATE FILTER
    // ===============================
    if (income_date) {
      query.income_date = new Date(income_date);
    }

    // ===============================
    // 5. GOAL FILTER
    // ===============================
    if (goal_id) {
      query.goal_id = new mongoose.Types.ObjectId(goal_id);
    }

    // ===============================
    // 6. TOTAL COUNT
    // ===============================
    const total_count = await Income.countDocuments(query);

    // ===============================
    // 7. AGGREGATION QUERY (IMPORTANT)
    // ===============================
    const aggregateQuery = {
      ...query,
      createdBy: new mongoose.Types.ObjectId(user_id)
    };

    const aggregateResult = await Income.aggregate([
      { $match: aggregateQuery },
      {
        $group: {
          _id: null,
          totalIncomeAmount: { $sum: "$income_amount" },
          totalGoalContribution: { $sum: "$goal_contribute_amount" }
        }
      }
    ]);

    const totalIncomeAmount =
      aggregateResult.length > 0 ? aggregateResult[0].totalIncomeAmount : 0;

    const totalGoalContribution =
      aggregateResult.length > 0 ? aggregateResult[0].totalGoalContribution : 0;

    // ===============================
    // 8. PAGINATION
    // ===============================
    const totalPages = Math.ceil(total_count / limit);

    const data = await Income.find(query)
      .populate(["createdBy", "goal_id"])
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // ===============================
    // 9. RESPONSE
    // ===============================
    return res.status(200).json({
      status: true,
      message: "Income data fetched successfully",
      data,
      pagination: {
        page,
        limit,
        totalRecords: total_count,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        totalIncomeAmount,
        totalGoalContribution
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

export const incomeBalance = async (req,res) => {
    const { user_id } = req.user.id;
    console.log('ueser id---',user_id); 

    const findIncome = await Income.aggregate([
      { $match: { createdBy:user_id } },
      { $group: {
          _id: null,
          totalIncome: { $sum: "$income_amount" }
        }
      }
    ]);

    console.log('findIncome---',findIncome);

    try{
      return res.status(200).json({
      status: true,
      message: "Income balance fetched successfully",
      data: findIncome
    });
    }
    catch(error){
      return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
    }
}

