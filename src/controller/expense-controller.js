import mongoose from "mongoose";
import { Expense } from "../models/expense-model.js";
import { BalanceModel } from "../models/balance-model.js";

export const createExpense = async( req,res) => {

    const { expense_category, expense_amount, budget_category, expense_date, is_recurring,notes,payment_mode,tags } = req.body;
    const user_id = req.user.id;

    try{
        const data = await Expense.create({
            expense_category : expense_category,
            expense_amount: expense_amount,
            budget_category: budget_category,
            expense_date: expense_date,
            is_recurring: is_recurring,
            notes: notes,
            payment_mode: payment_mode,
            tags: tags,
            createdBy: user_id
        });


        //reduce that amount from income amount
        let findBalance = await BalanceModel.findOne({createdBy:user_id});
        console.log('findBalance---',findBalance);
        if(findBalance){
            findBalance.totalExpense += Number(expense_amount);
            findBalance.balanceAmount = findBalance.totalIncome - findBalance.totalExpense;
            await findBalance.save();
        }

        return res.status(201).json({
            status: true,
            message:'Expense created successfully',
            data:data
        });

    }
       catch(error){
        return res.status(500).json({
            success:false,
            message:`error creating expense ${error.message}`,
            data:null
        })
    }


}

export const findAllExpense = async(req,res) => {
    const user_id = req.user.id;
    try{
        const expense = await Expense.find({
            createdBy : user_id
        });
        return res.status(201).json({
            status: true,
            message:'Expense data fetched successfully',
            data:expense
        })
    }
    catch(error){
    return res.status(500).json({
            success:false,
            message:`error fetching expense ${error.message}`,
            data:null
        })
    }
}

export const getExpenseById = async (req,res) => {
    const user_id = req.user.id;
    const {id} = req.params;

    console.log('id----,user_id',user_id,id)

    try{
        const expenseData  = await Expense.findById(id);
        console.log('expenseData--',expenseData);

         if(!expenseData){
            return res.status(201).json({
            status: true,
            message:'Expense data not found',
            data:null
        })
        }
         return res.status(201).json({
            status: true,
            message:'Expense data fetched successfully',
            data:expenseData
        })
    }
    catch(error){
         return res.status(500).json({
            success:false,
            message:`error fetching expense ${error.message}`,
            data:null
        })
    }
}

export const updateExpense = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;
    const {
      expense_category,
      expense_amount,
      budget_category,
      expense_date,
      is_recurring,
      notes,
      payment_mode,
      tags
    } = req.body;

    const findExpense = await Expense.findById(id);
    if (!findExpense) {
      return res.status(404).json({
        status: false,
        message: "Expense data not found",
        data: null
      });
    }

    /* =========================
       1. STORE OLD VALUE
    ========================== */
    const oldExpenseAmount = Number(findExpense.expense_amount);

    /* =========================
       2. CALCULATE NEW VALUE
    ========================== */
    const newExpenseAmount =
      expense_amount !== undefined
        ? Number(expense_amount)
        : oldExpenseAmount;

    /* =========================
       3. UPDATE BALANCE USING DIFFERENCE
    ========================== */
    const expenseDiff = newExpenseAmount - oldExpenseAmount;

    if (expenseDiff !== 0) {
      await BalanceModel.findOneAndUpdate(
        { createdBy: user_id },
        {
          $inc: {
            totalExpense: expenseDiff,
            balanceAmount: -expenseDiff
          },
          $set: { updatedBy: user_id }
        },
        { new: true }
      );
    }

    /* =========================
       4. UPDATE EXPENSE FIELDS
    ========================== */
    if (expense_category !== undefined)
      findExpense.expense_category = expense_category;
    if (expense_amount !== undefined)
      findExpense.expense_amount = newExpenseAmount;
    if (budget_category !== undefined)
      findExpense.budget_category = budget_category;
    if (expense_date !== undefined)
      findExpense.expense_date = expense_date;
    if (is_recurring !== undefined)
      findExpense.is_recurring = is_recurring;
    if (notes !== undefined)
      findExpense.notes = notes;
    if (payment_mode !== undefined)
      findExpense.payment_mode = payment_mode;
    if (tags !== undefined)
      findExpense.tags = tags;

    findExpense.updatedBy = user_id;

    await findExpense.save();

    return res.status(200).json({
      status: true,
      message: "Expense updated successfully",
      data: findExpense
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Error updating expense: ${error.message}`,
      data: null
    });
  }
};


export const deleteExpense = async (req,res) => {
    const { id} = req.params;
    const data = await Expense.findByIdAndDelete(id);
       return res.status(201).json( {
        status:true,
        message:'expense deleted successfully',
        data:data
    });


}


export const filterExpense = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search,
      fromDate,
      toDate,
      expense_date,
    } = req.body;

    const user_id = req?.user?.id;

    // pagination safety
    page = Number(page);
    limit = Number(limit);

    let query = {
      createdBy: user_id,
    };

    // 2. SEARCH FILTER
    if (search) {
      query.$or = [
        { expense_category: { $regex: search, $options: "i" } }
      ];
    }

    // 3. DATE RANGE FILTER
    if (fromDate && toDate) {
      query.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate)
      };
    }


    // 4. Expense DATE FILTER
    if (expense_date) {
      query.expense_date = new Date(expense_date);
    }



    // 6. TOTAL COUNT
    const total_count = await Expense.countDocuments(query);

    // 7. AGGREGATION QUERY (IMPORTANT)
    const aggregateQuery = {
      ...query,
      createdBy: new mongoose.Types.ObjectId(user_id)
    };

    const aggregateResult = await Expense.aggregate([
      { $match: aggregateQuery },
      {
        $group: {
          _id: null,
          totalExpenseAmount: { $sum: "$expense_amount" },
        }
      }
    ]);

    const totalExpenseAmount =
      aggregateResult.length > 0 ? aggregateResult[0].totalExpenseAmount : 0;

    //tdy's expense calculation
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const todayExpenseAggregate = await Expense.aggregate([
      {
        $match: {
          ...aggregateQuery,
          createdAt: { $gte: startOfToday, $lt: endOfToday }
        }
      },
      { $group: {
          _id: null,
          todayExpenseAmount: { $sum: "$expense_amount" },
        }
      }
    ]);
    const todayExpenseAmount =
      todayExpenseAggregate.length > 0 ? todayExpenseAggregate[0].todayExpenseAmount : 0;

    // 8. PAGINATION
    const totalPages = Math.ceil(total_count / limit);

    const data = await Expense.find(query)
      .populate(["createdBy"])
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // 9. RESPONSE
    return res.status(200).json({
      status: true,
      message: "expense data fetched successfully",
      data,
      pagination: {
        page,
        limit,
        totalRecords: total_count,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        totalExpenseAmount,
        todayExpenseAmount
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

