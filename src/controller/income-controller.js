import Income from "../models/income -model.js";
import { GoalHistory } from "../models/goal-history-model.js";
import { Goal } from "../models/goal-model.js";
import mongoose from "mongoose";
import { BalanceModel } from "../models/balance-model.js";
import { Expense } from "../models/expense-model.js";


export const createIncome = async (req, res) => {
  try {
    const {
      income_category,
      income_amount,
      income_date,
      notes,
      payment_receive_mode,
      saving_contribution,
      goal_id,
      goal_contribute_amount,
    } = req.body;

    const user_id = req.user.id;

    const incomeAmount = Number(income_amount);
    const goalContribution = Number(goal_contribute_amount || 0);

    if (goalContribution > incomeAmount) {
      return res.status(400).json({
        status: false,
        message:
          "Goal contribution amount cannot be greater than income amount",
        data: null,
      });
    }

    const currentIncomeAmount = incomeAmount - goalContribution;

    const incomeData = await Income.create({
      income_category,
      income_amount: incomeAmount,
      income_date,
      notes,
      payment_receive_mode,
      saving_contribution,
      goal_id: goal_id || null,
      goal_contribute_amount: goalContribution,
      current_income_amount: currentIncomeAmount,
      createdBy: user_id,
      updatedBy: null,
      updatedAt: null,
    });

    await BalanceModel.findOneAndUpdate(
      { createdBy:  new mongoose.Types.ObjectId(user_id) },
      {
        $inc: {
          totalIncome: incomeAmount,
          balanceAmount: currentIncomeAmount,
          totalExpense: 0,
        },
      },
      { new: true, upsert: true }
    );

    if (goal_id && goalContribution > 0) {
      // 1. Create goal history
      await GoalHistory.create({
        goal_id,
        income_type: income_category,
        allocated_amount: goalContribution,
        createdBy: user_id,
        updatedBy: null,
        income_id: incomeData._id,
      });

      // 2. Update goal allocation
      const updateGoalAmt = await Goal.findByIdAndUpdate(
        goal_id,
        { $inc: { allocated_amount: goalContribution } },
        { new: true }
      );

      if (!updateGoalAmt) return;

      // 3. Update goal status correctly
      if (updateGoalAmt.allocated_amount >= updateGoalAmt.target_amount) {
        updateGoalAmt.status = "completed";
      } else if (updateGoalAmt.allocated_amount > 0) {
        updateGoalAmt.status = "In-progress";
      }

      await updateGoalAmt.save();
    }


        return res.status(201).json({
          status: true,
          message: "Income created successfully",
          data: incomeData,
        });
      } catch (error) {
        return res.status(500).json({
          status: false,
          message: `Error creating income: ${error.message}`,
          data: [],
        });
      }
    };

export const findAll = async (req, res) => {
  const userId = req.user.id;
  try {
    const data = await Income.find({
      createdBy: userId,
      isDeleted: false,
    }).populate(["createdBy", "goal_id"]);
    return res.status(201).json({
      status: true,
      message: "income fetched successfully",
      data: data,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: `Error occur find data ${err.message}`,
      data: [],
    });
  }
};

export const findOne = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Income.findById(id);
    if (!data) {
      res.status(404).json({
        status: true,
        message: "data not found",
        data: [],
      });
    }
    return res.status(201).json({
      status: true,
      message: "data fetched successfully",
      data: data,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: `Error fetching details`,
      data: [],
    });
  }
};

// export const updateIncome = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       category,
//       other_category,
//       income_amount,
//       notes,
//       payment_receive_mode,
//       saving_contribution,
//       goal_contribute_amount,
//       goal_id
//     } = req.body;

//     const user_id = req.user.id;
//     const date = new Date();

//     const findIncome = await Income.findById(id);

//     if (!findIncome) {
//       return res.status(404).json({
//         status: false,
//         message: "Income data not found",
//         data: []
//       });
//     }

//         //  Update income_amount ONLY if user sends it
//     if (income_amount !== undefined && findIncome.income_amount !== income_amount) {
//       findIncome.income_amount = income_amount;
//     }

//     // DETECT GOAL REMOVAL
//     const isGoalRemoved =
//       (goal_id === "" || goal_id === null) &&
//       findIncome.goal_id !== null;

//     // REMOVE GOAL CONTRIBUTION
//     if (isGoalRemoved) {
//       const findGoalHistory = await GoalHistory.findOne({ income_id: id });

//       if (findGoalHistory) {
//         const findMainGoal = await Goal.findById(findGoalHistory.goal_id);

//         // add back goal amount to income
//         findIncome.income_amount += findGoalHistory.allocated_amount;

//         // reduce goal allocation
//         findMainGoal.allocated_amount -= findGoalHistory.allocated_amount;

//         await Promise.all([
//           findIncome.save(),
//           findMainGoal.save(),
//           GoalHistory.findByIdAndDelete(findGoalHistory._id)
//         ]);
//       }

//       // clear goal fields
//       findIncome.goal_id = null;
//       findIncome.goal_contribute_amount = 0;
//     }

//     // SAFE FIELD UPDATES
//     if (category !== undefined) {
//       findIncome.income_category = category;
//     }

//     if (other_category !== undefined) {
//       findIncome.other_category = other_category;
//     }

//     if (notes !== undefined) {
//       findIncome.notes = notes;
//     }

//     if (payment_receive_mode !== undefined) {
//       findIncome.payment_receive_mode = payment_receive_mode;
//     }

//     if (saving_contribution !== undefined) {
//       findIncome.saving_contribution = saving_contribution;
//     }

//     if (goal_contribute_amount !== undefined && !isGoalRemoved) {
//       findIncome.goal_contribute_amount = goal_contribute_amount;
//     }

//     // only set goal_id if NOT removed
//     if (!isGoalRemoved && goal_id) {
//       findIncome.goal_id = goal_id;
//     }

//     findIncome.income_date = date;
//     findIncome.updatedBy = user_id;

//     await findIncome.save();

//     return res.status(200).json({
//       status: true,
//       message: "Income updated successfully",
//       data: findIncome
//     });

//   } catch (error) {
//     return res.status(500).json({
//       status: false,
//       message: `Error updating data: ${error.message}`,
//       data: []
//     });
//   }
// };

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
      goal_id,
    } = req.body;

    const user_id = req.user.id;

    const findIncome = await Income.findById(id);
    if (!findIncome) {
      return res.status(404).json({
        status: false,
        message: "Income data not found",
        data: [],
      });
    }

    /* =========================
       1. STORE OLD VALUES
    ========================== */
    const oldIncomeAmount = Number(findIncome.income_amount);
    const oldGoalAmount = Number(findIncome.goal_contribute_amount || 0);
    const oldCurrentIncome = Number(findIncome.current_income_amount);

    /* =========================
       2. CALCULATE NEW VALUES
    ========================== */
    const newIncomeAmount =
      income_amount !== undefined ? Number(income_amount) : oldIncomeAmount;

    const newGoalAmount =
      goal_contribute_amount !== undefined
        ? Number(goal_contribute_amount)
        : oldGoalAmount;

    if (newGoalAmount > newIncomeAmount) {
      return res.status(400).json({
        status: false,
        message: "Goal amount cannot be greater than income amount",
        data: [],
      });
    }

    const newCurrentIncome = newIncomeAmount - newGoalAmount;

    console.log('newCurrentIncome Amount----',newCurrentIncome);


    /* =========================
       3. UPDATE BALANCE USING DIFFERENCE
    ========================== */
    const incomeDiff = newIncomeAmount - oldIncomeAmount;

        console.log('incomeDiff incomeDiff----',incomeDiff);

    const balanceDiff = newCurrentIncome - oldCurrentIncome;

            console.log('balanceDiff----',balanceDiff);


    await BalanceModel.findOneAndUpdate(
      { createdBy : new mongoose.Types.ObjectId(user_id)},
      {
        $inc: {
          totalIncome: incomeDiff,
          balanceAmount: balanceDiff,
        },
      },
      { new: true }
    );

    // /* =========================
    //    4. GOAL HANDLING
    // ========================== */
    // const hadGoalBefore = oldGoalAmount > 0;
    // const hasGoalNow = newGoalAmount > 0;

    // // Goal removed
    // if (!hasGoalNow && hadGoalBefore) {
    //   const history = await GoalHistory.findOne({ income_id: id });
    //   if (history) {
    //     await Goal.findByIdAndUpdate(history.goal_id, {
    //       $inc: { allocated_amount: -history.allocated_amount },
    //     });
    //     await GoalHistory.findByIdAndDelete(history._id);
    //   }
    //   findIncome.goal_id = null;
    // }

    // // Goal added
    // if (hasGoalNow && !hadGoalBefore && goal_id) {
    //   await GoalHistory.create({
    //     goal_id,
    //     income_type: findIncome.income_category,
    //     allocated_amount: newGoalAmount,
    //     createdBy: user_id,
    //     income_id: findIncome._id,
    //   });

    //   let updatedAmt = await Goal.findByIdAndUpdate(goal_id, {
    //     $inc: { allocated_amount: newGoalAmount },
    //   });

    //   if (updatedAmt.allocated_amount >= updatedAmt.target_amount) {
    //     updatedAmt.status = "completed";
    //     await updatedAmt.save();
    //   }
    // }

    // findIncome.goal_id = goal_id;


    /* =========================
   4. GOAL HANDLING (CORRECTED)
========================== */
const hadGoalBefore = oldGoalAmount > 0;
const hasGoalNow = newGoalAmount > 0;

let goalDoc = null;

/* ---- Goal removed ---- */
if (!hasGoalNow && hadGoalBefore) {
  const history = await GoalHistory.findOne({ income_id: id });

  if (history) {
    goalDoc = await Goal.findByIdAndUpdate(
      history.goal_id,
      { $inc: { allocated_amount: -history.allocated_amount } },
      { new: true }
    );

    await GoalHistory.findByIdAndDelete(history._id);
  }

  findIncome.goal_id = null;
}

/* ---- Goal added ---- */
if (hasGoalNow && !hadGoalBefore && goal_id) {
  await GoalHistory.create({
    goal_id,
    income_type: findIncome.income_category,
    allocated_amount: newGoalAmount,
    createdBy: user_id,
    income_id: findIncome._id,
  });

  goalDoc = await Goal.findByIdAndUpdate(
    goal_id,
    { $inc: { allocated_amount: newGoalAmount } },
    { new: true }
  );

  findIncome.goal_id = goal_id;
}

/* ---- Goal updated (amount changed) ---- */
if (hasGoalNow && hadGoalBefore) {
  const diff = newGoalAmount - oldGoalAmount;

  if (diff !== 0) {
    const history = await GoalHistory.findOne({ income_id: id });

    if (history) {
      history.allocated_amount = newGoalAmount;
      await history.save();

      goalDoc = await Goal.findByIdAndUpdate(
        history.goal_id,
        { $inc: { allocated_amount: diff } },
        { new: true }
      );
    }
  }
}

/* ---- Update Goal Status (COMMON LOGIC) ---- */
if (goalDoc) {
  if (goalDoc.allocated_amount >= goalDoc.target_amount) {
    goalDoc.status = "completed";
  } else if (goalDoc.allocated_amount > 0) {
    goalDoc.status = "In-progress";
  }

  await goalDoc.save();
}


    /* =========================
       5. UPDATE INCOME FIELDS
    ========================== */
    findIncome.income_amount = newIncomeAmount;
    findIncome.goal_contribute_amount = newGoalAmount;
    findIncome.current_income_amount = newCurrentIncome;

    if (category !== undefined) findIncome.income_category = category;
    if (other_category !== undefined)
      findIncome.other_category = other_category;
    if (notes !== undefined) findIncome.notes = notes;
    if (payment_receive_mode !== undefined)
      findIncome.payment_receive_mode = payment_receive_mode;
    if (saving_contribution !== undefined)
      findIncome.saving_contribution = saving_contribution;

    findIncome.updatedBy = user_id;
    findIncome.income_date = new Date();

    await findIncome.save();

    return res.status(200).json({
      status: true,
      message: "Income updated successfully",
      data: findIncome,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Error updating income: ${error.message}`,
      data: [],
    });
  }
};

export const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const income = await Income.findById(id);
    if (!income) {
      return res.status(404).json({
        status: false,
        message: "Income already deleted or not found",
        data: null,
      });
    }

    await BalanceModel.findOneAndUpdate(
      { createdBy: new mongoose.Types.ObjectId(user_id) },
      {
        $inc: {
          totalIncome: -income.income_amount,
          balanceAmount: -income.current_income_amount,
        },
      },
      { new: true }
    );

    const deletedIncome = await Income.findByIdAndDelete(id);

    return res.status(200).json({
      status: true,
      message: "Income deleted successfully",
      data: deletedIncome,
    });
  }
   catch (error) {
    return res.status(500).json({
      status: false,
      message: `Error deleting income: ${error.message}`,
      data: null,
    })
  }
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
      goal_id,
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
      query.$or = [{ income_category: { $regex: search, $options: "i" } }];
    }

    // ===============================
    // 3. DATE RANGE FILTER
    // ===============================
    if (fromDate && toDate) {
      query.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
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
      // ...query,
      createdBy: new mongoose.Types.ObjectId(user_id),
    };

    const aggregateResult = await Income.aggregate([
      { $match: aggregateQuery },
      {
        $group: {
          _id: null,
          totalIncomeAmount: { $sum: "$income_amount" },
          totalGoalContribution: { $sum: "$goal_contribute_amount" },
        },
      },
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
        totalGoalContribution,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const incomeBalance = async (req, res) => {
  try {
    const user_id = req.user.id;

    const balance = await BalanceModel.findOne({
      createdBy: new mongoose.Types.ObjectId(user_id),
      isDeleted: false,
    }).select("totalIncome totalExpense balanceAmount");

    console.log("ba;veee---", balance);

    return res.status(200).json({
      status: true,
      message: "Income balance fetched successfully",
      data: balance || {
        totalIncome: 0,
        totalExpense: 0,
        balanceAmount: 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// export const incomeBalance = async (req, res) => {
//   try {
//     const userId = new mongoose.Types.ObjectId(req.user.id);

//     /* -------- 1. Total Current Income (after goal contribution) -------- */
//     const incomeAgg = await Income.aggregate([
//       {
//         $match: {
//           createdBy: userId,
//           isDeleted: { $ne: true },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           totalIncome: {
//             $sum: {
//               $cond: [
//                 { $isNumber: "$current_income_amount" },
//                 "$current_income_amount",
//                 { $toDouble: "$current_income_amount" },
//               ],
//             },
//           },
//         },
//       },
//     ]);

//     const totalIncome = incomeAgg[0]?.totalIncome || 0;

//     /* -------- 2. Total Expense -------- */
//     const expenseAgg = await Expense.aggregate([
//       {
//         $match: {
//           createdBy: userId,
//           isDeleted: { $ne: true },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           totalExpense: {
//             $sum: {
//               $cond: [
//                 { $isNumber: "$expense_amount" },
//                 "$expense_amount",
//                 { $toDouble: "$expense_amount" },
//               ],
//             },
//           },
//         },
//       },
//     ]);

//     const totalExpense = expenseAgg[0]?.totalExpense || 0;

//     /* -------- 3. Final Balance (NO NEGATIVE) -------- */
//     const rawBalance = totalIncome - totalExpense;
//     const balanceAmount = rawBalance > 0 ? rawBalance : 0;

//     /* -------- 4. Response -------- */
//     return res.status(200).json({
//       status: true,
//       message: "Income balance fetched successfully",
//       data: {
//         totalIncome,
//         totalExpense,
//         balanceAmount,
//       },
//     });
//   } catch (error) {
//     console.error("incomeBalance error:", error);
//     return res.status(500).json({
//       status: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };
