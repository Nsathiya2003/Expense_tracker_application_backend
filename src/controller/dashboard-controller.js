import mongoose from "mongoose";
import { Budget } from "../models/budget-model.js";
import { Expense } from "../models/expense-model.js";
import Income from "../models/income -model.js";

export const dashboardSummaryCards = async (req, res) => {
  try {
    // last 30 days date
    const lastThirtyDays = new Date();
    lastThirtyDays.setDate(lastThirtyDays.getDate() - 30);

    const matchCondition = {
      createdBy: new mongoose.Types.ObjectId(req.user?.id),
      createdAt: { $gte: lastThirtyDays }
    };

    console.log('matchCondition---',matchCondition)

    // ---------------- COUNTS ----------------
    const incomeCount = await Income.countDocuments(matchCondition);
    const expenseCount = await Expense.countDocuments(matchCondition);
    const budgetCount = await Budget.countDocuments(matchCondition);

    // ---------------- TOTALS ----------------
    const incomeTotal = await Income.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $cond: [
                { $isNumber: "$income_amount" },
                "$income_amount",
                { $toDouble: "$income_amount" }
              ]
            }
          }
        }
      }
    ]);

    const expenseTotal = await Expense.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $cond: [
                { $isNumber: "$expense_amount" },
                "$expense_amount",
                { $toDouble: "$expense_amount" }
              ]
            }
          }
        }
      }
    ]);

    const budgetTotal = await Budget.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $cond: [
                { $isNumber: "$budget_amount" },
                "$budget_amount",
                { $toDouble: "$budget_amount" }
              ]
            }
          }
        }
      }
    ]);

    // ---------------- RESPONSE ----------------
    res.status(200).json({
      status: true,
      message: "Dashboard last 30 days summary fetched successfully",
      data: {
        income: {
          count: incomeCount,
          total: incomeTotal.length ? incomeTotal[0].total : 0
        },
        expense: {
          count: expenseCount,
          total: expenseTotal.length ? expenseTotal[0].total : 0
        },
        budget: {
          count: budgetCount,
          total: budgetTotal.length ? budgetTotal[0].total : 0
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      message: `Error fetching dashboard summary cards data: ${error.message}`,
      data: null
    });
  }
};

export const getMonthlyIncomeExpenseChart = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentYear = new Date().getFullYear();

    // -------- Income aggregation --------
    const incomeData = await Income.aggregate([
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(userId) ,
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          totalIncome: {
            $sum: {
              $cond: [
                { $isNumber: "$income_amount" },
                "$income_amount",
                { $toDouble: "$income_amount" }
              ]
            }
          }
        }
      }
    ]);

    // -------- Expense aggregation --------
    const expenseData = await Expense.aggregate([
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(userId) ,
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          totalExpense: {
            $sum: {
              $cond: [
                { $isNumber: "$expense_amount" },
                "$expense_amount",
                { $toDouble: "$expense_amount" }
              ]
            }
          }
        }
      }
    ]);

    // -------- Month mapping --------
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    // Convert aggregation result to map
    const incomeMap = {};
    incomeData.forEach(item => {
      incomeMap[item._id.month] = item.totalIncome;
    });

    const expenseMap = {};
    expenseData.forEach(item => {
      expenseMap[item._id.month] = item.totalExpense;
    });

    // -------- Final response format --------
    const result = months.map((month, index) => ({
      month,
      income: incomeMap[index + 1] || 0,
      expense: expenseMap[index + 1] || 0
    }));

    res.status(200).json({
      status: true,
      message: "Monthly income vs expense data fetched successfully",
      data: result
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      message: `Error fetching chart data: ${error.message}`,
      data: null
    });
  }
};


export const getSpendHistory = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // last 30 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);

    const spendHistory = await Expense.aggregate([
      {
        $match: {
          createdBy: userId,
          isDeleted: false,
          expense_date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$expense_date" },
            month: { $month: "$expense_date" },
            year: { $year: "$expense_date" },
          },
          expense: { $sum: "$expense_amount" },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $cond: [
              { $lt: ["$_id.day", 10] },
              { $concat: ["0", { $toString: "$_id.day" }] },
              { $toString: "$_id.day" },
            ],
          },
          expense: 1,
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Spend history fetched successfully",
      data: spendHistory,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch spend history",
    });
  }
};

