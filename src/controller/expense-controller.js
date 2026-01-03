import mongoose from "mongoose";
import { Expense } from "../models/expense-model.js";
import { BalanceModel } from "../models/balance-model.js";
import { Budget } from "../models/budget-model.js";
import notificationModel from "../models/notification-model.js";

// export const createExpense = async (req, res) => {
//   try {
//     const {
//       expense_category,
//       expense_amount,
//       budget_category,
//       expense_date,
//       is_recurring,
//       notes,
//       payment_mode,
//       tags,
//     } = req.body;

//     const user_id = req.user.id;

//     /* ---------- 1. Basic Validation ---------- */
//     if (!expense_category || !expense_amount) {
//       return res.status(400).json({
//         success: false,
//         message: "Expense category and amount are required",
//       });
//     }

//     if (Number(expense_amount) <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Expense amount must be greater than zero",
//       });
//     }

//     /* ---------- 2. Check Balance ---------- */
//     const findBalance = await BalanceModel.findOne({
//       createdBy: new mongoose.Types.ObjectId(user_id),
//     });

//     if (!findBalance) {
//       return res.status(404).json({
//         success: false,
//         message: "Balance record not found",
//       });
//     }

//     if (findBalance.balanceAmount < Number(expense_amount)) {
//       return res.status(400).json({
//         success: false,
//         message: "You don't have enough balance to add this expense",
//       });
//     }

//     /* ---------- 3. OPTIONAL Budget Logic ---------- */
//     const budget = await Budget.findOne({
//       budget_category: expense_category,
//       createdBy: user_id,
//     });

//     if (budget) {
//       const {
//         budget_amount,
//         budget_reaches,
//         reach_percentage = 0,
//         budget_exceeded,
//         budget_start_date,
//         budget_end_date,
//       } = budget;

//       const startDate = new Date(budget_start_date);
//       const endDate = new Date(budget_end_date);
//       endDate.setHours(23, 59, 59, 999);

//       const expenseAgg = await Expense.aggregate([
//         {
//           $match: {
//             createdBy: new mongoose.Types.ObjectId(user_id),
//             expense_category,
//             isDeleted: false,
//             createdAt: {
//               $gte: startDate,
//               $lte: endDate,
//             },
//           },
//         },
//         {
//           $group: {
//             _id: null,
//             totalExpense: { $sum: "$expense_amount" },
//           },
//         },
//       ]);

//       const totalExpense = expenseAgg[0]?.totalExpense || 0;
//       const projectedTotal = totalExpense + Number(expense_amount);

//       /* ---- Percentage Alert ---- */
//       if (budget_reaches && reach_percentage > 0) {
//         const usedPercentage = (projectedTotal / budget_amount) * 100;

//         if (usedPercentage >= reach_percentage) {
//           await createNotificationIfNotExists({
//             userId: user_id,
//             type: "budget_percentage",
//             category: expense_category,
//             title: "Budget Alert",
//             message: `You have used ${Math.round(
//               usedPercentage
//             )}% of your ${expense_category} budget.`,
//             fullMessage: `Your ${expense_category} budget is ₹${budget_amount}. After adding this expense, your total spending will be ₹${projectedTotal}.`,
//           });
//         }
//       }

//       /* ---- Exceeded Alert ---- */
//       if (budget_exceeded && projectedTotal > budget_amount) {
//         const exceededBy = projectedTotal - budget_amount;

//         await createNotificationIfNotExists({
//           userId: user_id,
//           type: "budget_exceeded",
//           category: expense_category,
//           title: "Budget Exceeded",
//           message: `This expense will exceed your ${expense_category} budget.`,
//           fullMessage: `Your budget is ₹${budget_amount}. This expense exceeds the limit by ₹${exceededBy}.`,
//         });
//       }

//       /* ---- Increment count ONLY first time ---- */
//       const wasAlreadyExceeded = totalExpense > budget_amount;
//       const isNowExceeded = projectedTotal > budget_amount;

//       if (!wasAlreadyExceeded && isNowExceeded) {
//         await Budget.updateOne(
//           { _id: budget._id },
//           { $inc: { budget_exceeded_counts: 1 } }
//         );
//       }
//     }

//     /* ---------- 4. Create Expense (ALWAYS) ---------- */
//     const data = await Expense.create({
//       expense_category,
//       expense_amount: Number(expense_amount),
//       budget_category,
//       expense_date,
//       is_recurring,
//       notes,
//       payment_mode,
//       tags,
//       createdBy: user_id,
//     });
// /* ---------- 5. Update Balance (ALWAYS) ---------- */

// // Ensure totalIncome and totalExpense are numbers
// const totalIncome = Number(findBalance.totalIncome) || 0;
// const totalExpense = Number(findBalance.totalExpense) || 0;
// const expenseAmount = Number(expense_amount);

// // Update totalExpense and balanceAmount safely
// findBalance.totalExpense = totalExpense + expenseAmount;
// findBalance.balanceAmount = totalIncome - findBalance.totalExpense;

// await findBalance.save();


//     /* ---------- 6. Success ---------- */
//     return res.status(201).json({
//       success: true,
//       message: "Expense created successfully",
//       data,
//     });
//   } catch (error) {
//     console.error("Create Expense Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error creating expense",
//     });
//   }
// };


export const createExpense = async (req, res) => {
  try {
    const {
      expense_category,
      expense_amount,
      budget_category,
      expense_date,
      is_recurring,
      notes,
      payment_mode,
      tags,
    } = req.body;

    const user_id = new mongoose.Types.ObjectId(req.user.id);
    const today = new Date(expense_date || new Date());

    // 1. Basic validation
    if (!expense_category || !expense_amount || Number(expense_amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Expense category and amount (greater than 0) are required",
      });
    }

    // 2. Get balance
    const findBalance = await BalanceModel.findOne({
      createdBy: new mongoose.Types.ObjectId(user_id),
    });
    if (!findBalance) {
      return res.status(404).json({
        success: false,
        message: "Balance record not found",
      });
    }

    const totalIncome = Number(findBalance.totalIncome) || 0;
    const totalExpense = Number(findBalance.totalExpense) || 0;
    const expenseAmount = Number(expense_amount);

    if (totalIncome - totalExpense < expenseAmount) {
      return res.status(400).json({
        success: false,
        message: "You don't have enough balance to add this expense",
      });
    }

    // 3. Budget logic & notifications
    // if (budget_category) {
    //   const budget = await Budget.findOne({
    //     budget_category: expense_category,
    //     createdBy: user_id,
    //   });

    //   if (budget) {
    //     const {
    //       budget_amount,
    //       budget_reaches,
    //       reach_percentage = 0,
    //       budget_exceeded,
    //       budget_start_date,
    //       budget_end_date,
    //     } = budget;

    //     const startDate = new Date(budget_start_date);
    //     const endDate = new Date(budget_end_date);
    //     endDate.setHours(23, 59, 59, 999);

    //     const expenseAgg = await Expense.aggregate([
    //       {
    //         $match: {
    //           createdBy: new mongoose.Types.ObjectId(user_id),
    //           expense_category,
    //           isDeleted: false,
    //           createdAt: { $gte: startDate, $lte: endDate },
    //         },
    //       },
    //       { $group: { _id: null, totalExpense: { $sum: "$expense_amount" } } },
    //     ]);

    //     const totalExp = expenseAgg[0]?.totalExpense || 0;
    //     const projectedTotal = totalExp + expenseAmount;

    //     // Percentage alert
    //     if (budget_reaches && reach_percentage > 0) {
    //       const usedPercentage = (projectedTotal / budget_amount) * 100;
    //       if (usedPercentage >= reach_percentage) {
    //         await createNotificationIfNotExists({
    //           userId: user_id,
    //           type: "budget_percentage",
    //           category: expense_category,
    //           title: "Budget Alert",
    //           message: `You have used ${Math.round(
    //             usedPercentage
    //           )}% of your ${expense_category} budget.`,
    //           fullMessage: `Your ${expense_category} budget is ₹${budget_amount}. After adding this expense, your total spending will be ₹${projectedTotal}.`,
    //         });
    //       }
    //     }

    //     // Budget exceeded alert
    //     if (budget_exceeded && projectedTotal > budget_amount) {
    //       const exceededBy = projectedTotal - budget_amount;
    //       await createNotificationIfNotExists({
    //         userId: user_id,
    //         type: "budget_exceeded",
    //         category: expense_category,
    //         title: "Budget Exceeded",
    //         message: `This expense will exceed your ${expense_category} budget.`,
    //         fullMessage: `Your budget is ₹${budget_amount}. This expense exceeds the limit by ₹${exceededBy}.`,
    //       });
    //     }

    //     // Increment exceeded count
    //     const wasAlreadyExceeded = totalExp > budget_amount;
    //     const isNowExceeded = projectedTotal > budget_amount;
    //     if (!wasAlreadyExceeded && isNowExceeded) {
    //       await Budget.updateOne(
    //         { _id: budget._id },
    //         { $inc: { budget_exceeded_counts: 1 } }
    //       );
    //     }
    //   }
    // }

// 3. Budget logic & notifications
if (budget_category) {
  const budget = await Budget.findOne({
    budget_category: expense_category,
    createdBy: user_id,
  });

  if (budget && budget.need_notification) {
    const {
      budget_amount,
      budget_reaches,
      reach_percentage = 0,
      budget_exceeded,
      budget_start_date,
      budget_end_date,
    } = budget;

    const startDate = new Date(budget_start_date);
    const endDate = new Date(budget_end_date);
    endDate.setHours(23, 59, 59, 999);

    const expenseDate = expense_date
      ? new Date(expense_date)
      : new Date();

    // ⛔ outside range → no notification
    if (expenseDate < startDate || expenseDate > endDate) return;

    // ✅ FIXED: use expense_date (NOT createdAt)
    const expenseAgg = await Expense.aggregate([
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(user_id),
          expense_category,
          isDeleted: false,
          expense_date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalExpense: { $sum: "$expense_amount" },
        },
      },
    ]);

    const totalExp = expenseAgg[0]?.totalExpense || 0;
    const projectedTotal = totalExp + expenseAmount;

    // Percentage alert
    if (budget_reaches && reach_percentage > 0) {
      const usedPercentage = (projectedTotal / budget_amount) * 100;

      if (usedPercentage >= reach_percentage) {
        await createNotificationIfNotExists({
          userId: user_id,
          type: "budget_percentage",
          category: expense_category,
          title: "Budget Alert",
          message: `You have used ${Math.round(
            usedPercentage
          )}% of your ${expense_category} budget.`,
          fullMessage: `Your ${expense_category} budget is ₹${budget_amount}. After adding this expense, your total spending will be ₹${projectedTotal}.`,
        });
      }
    }

    // Budget exceeded alert
    if (budget_exceeded && projectedTotal > budget_amount) {
      const exceededBy = projectedTotal - budget_amount;

      await createNotificationIfNotExists({
        userId: user_id,
        type: "budget_exceeded",
        category: expense_category,
        title: "Budget Exceeded",
        message: `This expense will exceed your ${expense_category} budget.`,
        fullMessage: `Your budget is ₹${budget_amount}. This expense exceeds the limit by ₹${exceededBy}.`,
      });
    }

    // Increment exceeded count
    if (totalExp <= budget_amount && projectedTotal > budget_amount) {
      await Budget.updateOne(
        { _id: budget._id },
        { $inc: { budget_exceeded_counts: 1 } }
      );
    }
  }
}



    // 4. Create Expense
    const newExpense = await Expense.create({
      expense_category,
      expense_amount: expenseAmount,
      budget_category,
      expense_date,
      is_recurring,
      notes,
      payment_mode,
      tags,
      createdBy: user_id,
    });

    // 5. Update Balance safely
    findBalance.totalExpense = totalExpense + expenseAmount;
    findBalance.balanceAmount = Math.max(totalIncome - findBalance.totalExpense, 0);
    await findBalance.save();

    // 6. Return success
    return res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data: newExpense,
    });
  } catch (error) {
    console.error("Create Expense Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating expense",
    });
  }
};

export const findAllExpense = async (req, res) => {
  const user_id = req.user.id;
  try {
    const expense = await Expense.find({
      createdBy: user_id,
    });
    return res.status(201).json({
      status: true,
      message: "Expense data fetched successfully",
      data: expense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `error fetching expense ${error.message}`,
      data: null,
    });
  }
};

export const getExpenseById = async (req, res) => {
  const user_id = req.user.id;
  const { id } = req.params;

  console.log("id----,user_id", user_id, id);

  try {
    const expenseData = await Expense.findById(id);
    console.log("expenseData--", expenseData);

    if (!expenseData) {
      return res.status(201).json({
        status: true,
        message: "Expense data not found",
        data: null,
      });
    }
    return res.status(201).json({
      status: true,
      message: "Expense data fetched successfully",
      data: expenseData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `error fetching expense ${error.message}`,
      data: null,
    });
  }
};

// export const updateExpense = async (req, res) => {
//   try {
//     const user_id = req.user.id;
//     const { id } = req.params;
//     const {
//       expense_category,
//       expense_amount,
//       budget_category,
//       expense_date,
//       is_recurring,
//       notes,
//       payment_mode,
//       tags,
//     } = req.body;

//     const findExpense = await Expense.findById(id);
//     if (!findExpense) {
//       return res.status(404).json({
//         status: false,
//         message: "Expense data not found",
//         data: null,
//       });
//     }

//     /* =========================
//        1. STORE OLD VALUE
//     ========================== */
//     const oldExpenseAmount = Number(findExpense.expense_amount);

//     /* =========================
//        2. CALCULATE NEW VALUE
//     ========================== */
//     const newExpenseAmount =
//       expense_amount !== undefined ? Number(expense_amount) : oldExpenseAmount;

//     /* =========================
//        3. UPDATE BALANCE USING DIFFERENCE
//     ========================== */
//     const expenseDiff = newExpenseAmount - oldExpenseAmount;

//     if (expenseDiff !== 0) {
//       await BalanceModel.findOneAndUpdate(
//         { createdBy: user_id },
//         {
//           $inc: {
//             totalExpense: expenseDiff,
//             balanceAmount: -expenseDiff,
//           },
//           $set: { updatedBy: user_id },
//         },
//         { new: true }
//       );
//     }

//     /* =========================
//        4. UPDATE EXPENSE FIELDS
//     ========================== */
//     if (expense_category !== undefined)
//       findExpense.expense_category = expense_category;
//     if (expense_amount !== undefined)
//       findExpense.expense_amount = newExpenseAmount;
//     if (budget_category !== undefined)
//       findExpense.budget_category = budget_category;
//     if (expense_date !== undefined) findExpense.expense_date = expense_date;
//     if (is_recurring !== undefined) findExpense.is_recurring = is_recurring;
//     if (notes !== undefined) findExpense.notes = notes;
//     if (payment_mode !== undefined) findExpense.payment_mode = payment_mode;
//     if (tags !== undefined) findExpense.tags = tags;

//     findExpense.updatedBy = user_id;

//     await findExpense.save();

//     return res.status(200).json({
//       status: true,
//       message: "Expense updated successfully",
//       data: findExpense,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: false,
//       message: `Error updating expense: ${error.message}`,
//       data: null,
//     });
//   }
// };

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
      tags,
    } = req.body;

    const findExpense = await Expense.findById(id);
    if (!findExpense) {
      return res.status(404).json({
        status: false,
        message: "Expense data not found",
        data: null,
      });
    }

    // Old & new amounts
    const oldExpenseAmount = Number(findExpense.expense_amount) || 0;
    const newExpenseAmount = expense_amount !== undefined ? Number(expense_amount) : oldExpenseAmount;
    const expenseDiff = newExpenseAmount - oldExpenseAmount;

    // Update balance safely
    if (expenseDiff !== 0) {
      const updatedBalance = await BalanceModel.findOneAndUpdate(
        { createdBy: user_id },
        {
          $inc: {
            totalExpense: expenseDiff,
            balanceAmount: -expenseDiff,
          },
          $set: { updatedBy: user_id },
        },
        { new: true }
      );

      updatedBalance.totalExpense = Math.max(updatedBalance.totalExpense, 0);
      updatedBalance.balanceAmount = Math.max(updatedBalance.balanceAmount, 0);
      await updatedBalance.save();
    }

    // Update expense fields
    if (expense_category !== undefined) findExpense.expense_category = expense_category;
    if (expense_amount !== undefined) findExpense.expense_amount = newExpenseAmount;
    if (budget_category !== undefined) findExpense.budget_category = budget_category;
    if (expense_date !== undefined) findExpense.expense_date = expense_date;
    if (is_recurring !== undefined) findExpense.is_recurring = is_recurring;
    if (notes !== undefined) findExpense.notes = notes;
    if (payment_mode !== undefined) findExpense.payment_mode = payment_mode;
    if (tags !== undefined) findExpense.tags = tags;

    findExpense.updatedBy = user_id;
    await findExpense.save();

    return res.status(200).json({
      status: true,
      message: "Expense updated successfully",
      data: findExpense,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Error updating expense: ${error.message}`,
      data: null,
    });
  }
};


// export const deleteExpense = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const user_id = req.user.id;

//     const expense = await Expense.findById(id);
//     if (!expense) {
//       return res.status(404).json({
//         status: false,
//         message: "Expense already deleted or not found",
//         data: null,
//       });
//     }

//     await BalanceModel.findOneAndUpdate(
//       { createdBy: new mongoose.Types.ObjectId(user_id) },
//       {
//         $inc: {
//           totalExpense: -expense.expense_amount,
//         },
//       },
//       { new: true }
//     );

//     const deleteExpense = await Expense.findByIdAndDelete(id);

//     return res.status(200).json({
//       status: true,
//       message: "expense deleted successfully",
//       data: deleteExpense,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: false,
//       message: `Error deleting expense: ${error.message}`,
//       data: null,
//     });
//   }
// };


export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({
        status: false,
        message: "Expense already deleted or not found",
        data: null,
      });
    }

    // Update balance safely
    const updatedBalance = await BalanceModel.findOneAndUpdate(
      { createdBy: new mongoose.Types.ObjectId(user_id) },
      {
        $inc: {
          totalExpense: -Number(expense.expense_amount),
          balanceAmount: + Number(expense.expense_amount)
        },
      },
      { new: true }
    );

    updatedBalance.totalExpense = Math.max(updatedBalance.totalExpense, 0);
    updatedBalance.balanceAmount = Math.max(updatedBalance.balanceAmount, 0);
    await updatedBalance.save();

    const deletedExpense = await Expense.findByIdAndDelete(id);

    return res.status(200).json({
      status: true,
      message: "Expense deleted successfully",
      data: deletedExpense,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Error deleting expense: ${error.message}`,
      data: null,
    });
  }
};

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
      query.$or = [{ expense_category: { $regex: search, $options: "i" } }];
    }

    // 3. DATE RANGE FILTER
    if (fromDate && toDate) {
      query.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
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
      createdBy: new mongoose.Types.ObjectId(user_id),
    };

    const aggregateResult = await Expense.aggregate([
      { $match: aggregateQuery },
      {
        $group: {
          _id: null,
          totalExpenseAmount: { $sum: "$expense_amount" },
        },
      },
    ]);

    const totalExpenseAmount =
      aggregateResult.length > 0 ? aggregateResult[0].totalExpenseAmount : 0;

    //tdy's expense calculation
    const today = new Date();
    // const startOfToday = new Date(
    //   today.getFullYear(),
    //   today.getMonth(),
    //   today.getDate()
    // );
    // const endOfToday = new Date(
    //   today.getFullYear(),
    //   today.getMonth(),
    //   today.getDate() + 1
    // );

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayExpenseAggregate = await Expense.aggregate([
      {
        $match: {
          ...aggregateQuery,
          expense_date: {
            $gte: startOfToday,
            $lte: endOfToday,
          },
        },
      },
      {
        $group: {
          _id: null,
          todayExpenseAmount: { $sum: "$expense_amount" },
        },
      },
    ]);

    const todayExpenseAmount =
      todayExpenseAggregate.length > 0
        ? todayExpenseAggregate[0].todayExpenseAmount
        : 0;

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
        todayExpenseAmount,
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

export const checkBudgetLimit = async (req, res) => {
  try {
    const { category, expense_amount, expense_date } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // 🔥 Use EXPENSE DATE instead of current date
    const expenseDate = expense_date
      ? new Date(expense_date)
      : new Date();

    /* -------- 1. Find Budget -------- */
    const budget = await Budget.findOne({
      budget_category: category,
      createdBy: userId,
    });

    console.log('budgrt is----',budget)

    if (!budget) {
      return res.status(200).json({ alert: false });
    }

    const {
      budget_amount,
      budget_reaches,
      reach_percentage = 0,
      budget_start_date,
      budget_end_date,
      budget_exceeded,
    } = budget;

    /* -------- 2. Expense date must be INSIDE budget range -------- */
    const startDate = new Date(budget_start_date);
    const endDate = new Date(budget_end_date);
    endDate.setHours(23, 59, 59, 999); // 🔥 important

    console.log('startDate---',startDate);
        console.log('endDate---',endDate);

        console.log('expenseDate---',expenseDate);


    if (expenseDate < startDate || expenseDate > endDate) {
      console.log('helooo')
      return res.status(200).json({ alert: false });
    }

    /* -------- 3. Calculate Existing Expenses -------- */
const expenseAgg = await Expense.aggregate([
  {
    $match: {
      createdBy: userId,
      expense_category: category,
      isDeleted: false,
      expense_date: {
        $gte: startDate,
        $lte: endDate,
      },
    },
  },
  {
    $group: {
      _id: null,
      totalExpense: { $sum: "$expense_amount" },
    },
  },
]);


    const totalExpense = expenseAgg[0]?.totalExpense || 0;

    /* -------- 4. Projected Total -------- */
    const incomingAmount = Number(expense_amount) || 0;
    const projectedTotal = totalExpense + incomingAmount;

    /* -------- 5. Percentage Alert -------- */
    if (budget_reaches && reach_percentage > 0) {
      const usedPercentage = (projectedTotal / budget_amount) * 100;

      if (usedPercentage >= reach_percentage) {
        return res.status(200).json({
          alert: true,
          type: "percentage",
          message: `You have used ${Math.round(
            usedPercentage
          )}% of your ${category} budget.`,
          details: `Your ${category} budget is ₹${budget_amount}. After adding this expense, your total spending will be ₹${projectedTotal}.`,
          usedPercentage: Math.round(usedPercentage),
        });
      }
    }

    /* -------- 6. Exceeded Alert -------- */
    if (budget_exceeded && projectedTotal > budget_amount) {
      const exceededBy = projectedTotal - budget_amount;

      return res.status(200).json({
        alert: true,
        type: "exceeded",
        message: `This expense will exceed your ${category} budget.`,
        details: `Your budget is ₹${budget_amount}. This expense exceeds the limit by ₹${exceededBy}.`,
        exceededBy,
      });
    }

    /* -------- 7. No Alert -------- */
    return res.status(200).json({ alert: false });
  } catch (error) {
    console.error("checkBudgetLimit error:", error);
    return res.status(500).json({
      alert: false,
      message: "Internal server error",
    });
  }
};


// export const checkBudgetLimit = async (req, res) => {
//   try {
//     const { category, expense_amount } = req.body;
//     const userId = new mongoose.Types.ObjectId(req.user.id);
//     const today = new Date();

//     /* -------- 1. Find Budget -------- */
//     const budget = await Budget.findOne({
//       budget_category: category,
//       createdBy: userId,
//     });

//     if (!budget) {
//       return res.status(200).json({ alert: false });
//     }

//     const {
//       budget_amount,
//       budget_reaches,
//       reach_percentage = 0,
//       budget_start_date,
//       budget_end_date,
//       budget_exceeded,
//     } = budget;

//     /* -------- 2. Start Date Check -------- */
//     if (today < new Date(budget_start_date)) {
//       return res.status(200).json({ alert: false });
//     }

//     /* -------- 3. Calculate Existing Expenses -------- */
//     const expenseAgg = await Expense.aggregate([
//       {
//         $match: {
//           createdBy: userId,
//           expense_category: category,
//           createdAt: { $gte: new Date(budget_start_date) , $lte: new Date(budget_end_date) },
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

//     /* -------- 4. Projected Expense (IMPORTANT) -------- */
//     const incomingAmount = Number(expense_amount) || 0;
//     const projectedTotal = totalExpense + incomingAmount;

//     console.log("projectedTotal,budget_amount", projectedTotal, budget_amount);
//     console.log(
//       "budget_reaches,reach_percentage",
//       budget_reaches,
//       reach_percentage
//     );
//     console.log("budgetAmount", budget_amount);

//     /* -------- 5. Percentage Alert -------- */
//     if (budget_reaches && reach_percentage > 0) {
//       const usedPercentage = (projectedTotal / budget_amount) * 100;

//       if (usedPercentage >= reach_percentage) {
//         const rounded = Math.round(usedPercentage);

//         const message = `You have used ${rounded}% of your ${category} budget.`;
//         const details = `Your ${category} budget is ₹${budget_amount}. After adding this expense, your total spending will be ₹${projectedTotal}.`;

//         return res.status(200).json({
//           alert: true,
//           type: "percentage",
//           message,
//           details,
//           usedPercentage: rounded,
//         });
//       }
//     }

//     /* -------- 6. Exceeded Alert -------- */
//     if (budget_exceeded && projectedTotal > budget_amount) {
//       const exceededBy = projectedTotal - budget_amount;

//       const message = `This expense will exceed your ${category} budget.`;
//       const details = `Your budget is ₹${budget_amount}. This expense exceeds the limit by ₹${exceededBy}.`;

//       return res.status(200).json({
//         alert: true,
//         type: "exceeded",
//         message,
//         details,
//         exceededBy,
//       });
//     }

//     /* -------- 7. No Alert -------- */
//     return res.status(200).json({ alert: false });
//   } catch (error) {
//     console.error("checkBudgetLimit error:", error);
//     return res.status(500).json({
//       alert: false,
//       message: "Internal server error",
//     });
//   }
// };

const createNotificationIfNotExists = async ({
  userId,
  type,
  title,
  message,
  fullMessage,
  category,
}) => {
  try {
    // Optional: check if a similar notification exists
    // const exists = await notificationModel.findOne({
    //   userId,
    //   type,
    //   category,
    // });

    // if (exists) return;

    const notif = await notificationModel.create({
      userId,
      type,
      title,
      message,
      fullMessage,
      category,
    });

    console.log("Notification created:", notif._id);
    return notif;
  } catch (err) {
    console.error("Notification creation failed:", err);
  }
};
