import mongoose from "mongoose";
import { Budget } from "../models/budget-model.js";

// export const createBudget = async(req,res) => {
//     const  user_id = req.user?.id;
//     const {budget_category,budget_amount,notes,budget_start_date,need_notification,
//       budget_exceeded,budget_reaches,reach_percentage } = req.body;

//     try{
//         //If the category is existing
//         let existingBudget = await Budget.findOne({ budget_category: budget_category, createdBy: user_id });
//         if(existingBudget){

//           let BudgetAmount = existingBudget.budget_amount + (+budget_amount);

//              existingBudget.createdBy = user_id,
//              existingBudget.budget_amount= BudgetAmount,
//              existingBudget.notes =notes,
//             //  existingBudget.budget_month =budget_month,
//              existingBudget.budget_start_date = budget_start_date,
//              existingBudget.need_notification= need_notification,
//              existingBudget.budget_exceeded= budget_exceeded,
//              existingBudget.budget_reaches=budget_reaches,
//              existingBudget.reach_percentage =+reach_percentage,
//              existingBudget.updatedBy = user_id

//              await existingBudget.save();
//              return res.status(200).json({
//                 success: true,
//                 message: "Budget updated successfully",
//                 data: existingBudget
//             });
//         }
//         else{
//             existingBudget = new Budget({
//             createdBy: user_id,
//             budget_category: budget_category,
//             budget_amount: + budget_amount,
//             notes :notes,
//             // budget_month :budget_month,
//             budget_start_date : budget_start_date,
//             need_notification: need_notification,
//             budget_exceeded: budget_exceeded,
//             budget_reaches:budget_reaches,
//             reach_percentage :+reach_percentage

//             });
//         }

//         const createBudget = await existingBudget.save();
//         res.status(201).json({
//             success: true,
//             message: "Budget created successfully",
//             data: createBudget
//         });
//     }catch(error){
//         console.error("Error creating budget:", error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to create budget",
//             error: error.message
//         });
//     }

// }

export const createBudget = async (req, res) => {
  const user_id = req.user?.id;
  const {
    budget_category,
    budget_amount,
    notes,
    budget_start_date,
    budget_end_date,
    need_notification,
    budget_exceeded,
    budget_reaches,
    reach_percentage,
  } = req.body;

  try {
    // Check for existing budget in the same category with overlapping date
    let existingBudget = await Budget.findOne({
      budget_category: budget_category,
      createdBy: user_id,
      $or: [
        {
          budget_start_date: { $lte: new Date(budget_end_date) },
          budget_end_date: { $gte: new Date(budget_start_date) },
        },
      ],
    });

    if (existingBudget) {
      // Merge amounts
      existingBudget.budget_amount += +budget_amount;
      existingBudget.notes = notes;
      existingBudget.budget_start_date = new Date(
        Math.min(
          new Date(existingBudget.budget_start_date),
          new Date(budget_start_date)
        )
      );
      existingBudget.budget_end_date = new Date(
        Math.max(
          new Date(existingBudget.budget_end_date),
          new Date(budget_end_date)
        )
      );
      existingBudget.need_notification = need_notification;
      existingBudget.budget_exceeded = budget_exceeded;
      existingBudget.budget_reaches = budget_reaches;
      existingBudget.reach_percentage = +reach_percentage;
      existingBudget.updatedBy = user_id;

      await existingBudget.save();

      return res.status(200).json({
        success: true,
        message: "Budget updated successfully",
        data: existingBudget,
      });
    }

    // Create new budget if no overlapping
    const newBudget = new Budget({
      createdBy: user_id,
      budget_category,
      budget_amount: +budget_amount,
      notes,
      budget_start_date,
      budget_end_date,
      need_notification,
      budget_exceeded,
      budget_reaches: budget_reaches,
      reach_percentage: +reach_percentage,
    });

    const savedBudget = await newBudget.save();

    res.status(201).json({
      success: true,
      message: "Budget created successfully",
      data: savedBudget,
    });
  } catch (error) {
    console.error("Error creating budget:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create budget",
      error: error.message,
    });
  }
};

export const getBudgets = async (req, res) => {
  const { user_id } = req.user?.id;
  try {
    const budgets = await Budget.find({ created_by: user_id });
    res.status(200).json({
      success: true,
      message: "Budgets retrieved successfully",
      data: budgets,
    });
  } catch (error) {
    console.error("Error retrieving budgets:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve budgets",
      error: error.message,
    });
  }
};

// export const updateBudget = async (req, res) => {
//   const { id } = req.params;
//   const { user_id } = req.user?.id;
//   const {
//     budget_category,
//     budget_amount,
//     notes,
//     budget_start_date,
//     need_notification,
//     budget_exceeded,
//     budget_reaches,
//     reach_percentage,
//   } = req.body;
//   try {
//     const updatedBudget = await Budget.findOneAndUpdate(
//       { _id: id },
//       {
//         budget_category,
//         budget_amount,
//         notes,
//         // budget_month,
//         budget_start_date,
//         need_notification,
//         budget_exceeded,
//         budget_reaches,
//         reach_percentage,
//         updatedBy: user_id,
//       },
//       { new: true }
//     );
//     if (!updatedBudget) {
//       return res.status(404).json({
//         success: false,
//         message: "Budget not found or you do not have permission to update it",
//       });
//     }
//     res.status(200).json({
//       success: true,
//       message: "Budget updated successfully",
//       data: updatedBudget,
//     });
//   } catch (error) {
//     console.error("Error updating budget:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update budget",
//       error: error.message,
//     });
//   }
// };

export const updateBudget = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user?.id; // fixed destructuring
  const {
    budget_category,
    budget_amount,
    notes,
    budget_start_date,
    budget_end_date,
    need_notification,
    budget_exceeded,
    budget_reaches,
    reach_percentage,
  } = req.body;

  try {
    const updatedBudget = await Budget.findOneAndUpdate(
      { _id: id, createdBy: user_id }, 
      {
        budget_category,
        budget_amount: +budget_amount,
        notes,
        budget_start_date: new Date(budget_start_date),
        budget_end_date: new Date(budget_end_date),
        need_notification,
        budget_exceeded,
        budget_reaches,
        reach_percentage: +reach_percentage,
        updatedBy: user_id,
      },
      { new: true }
    );

    if (!updatedBudget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found or you do not have permission to update it",
      });
    }

    res.status(200).json({
      success: true,
      message: "Budget updated successfully",
      data: updatedBudget,
    });
  } catch (error) {
    console.error("Error updating budget:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update budget",
      error: error.message,
    });
  }
};

export const deleteBudget = async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.user?.id;
  try {
    const deletedBudget = await Budget.findOneAndDelete({ _id: id });
    if (!deletedBudget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found or you do not have permission to delete it",
      });
    }
    res.status(200).json({
      success: true,
      message: "Budget deleted successfully",
      data: deletedBudget,
    });
  } catch (error) {
    console.error("Error deleting budget:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete budget",
      error: error.message,
    });
  }
};
export const getBudgetById = async (req, res) => {
  const { id } = req.params;

  console.log("budget_id iss---", id);

  try {
    const budget = await Budget.findOne({ _id: id });
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found or you do not have permission to access it",
      });
    }
    res.status(200).json({
      success: true,
      message: "Budget retrieved successfully",
      data: budget,
    });
  } catch (error) {
    console.error("Error retrieving budget:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve budget",
      error: error.message,
    });
  }
};

export const filterBudget = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search,
      fromDate,
      toDate,
      budget_start_date,
    } = req.body;

    const user_id = req?.user?.id;

    // pagination safety
    page = Number(page);
    limit = Number(limit);

    // 1. BASE QUERY (find & count)
    let query = {
      createdBy: user_id,
    };

    // 2. SEARCH FILTER
    if (search) {
      query.$or = [{ budget_category: { $regex: search, $options: "i" } }];
    }

    // 3. DATE RANGE FILTER
    if (fromDate && toDate) {
      query.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    // 4. INCOME DATE FILTER
    if (budget_start_date) {
      query.budget_start_date = new Date(budget_start_date);
    }

    // 6. TOTAL COUNT
    const total_count = await Budget.countDocuments(query);

    // 7. AGGREGATION QUERY (IMPORTANT)
    const aggregateQuery = {
      // ...query,
      createdBy: new mongoose.Types.ObjectId(user_id),
    };

    //total budget amount...
    const aggregateResult = await Budget.aggregate([
      { $match: aggregateQuery },
      {
        $group: {
          _id: null,
          budget_amount: { $sum: "$budget_amount" },
          budget_exceeded_counts: { $sum: "$budget_exceeded_counts" },
        },
      },
    ]);

    const totalBudgetAmount =
      aggregateResult.length > 0 ? aggregateResult[0].budget_amount : 0;

    const budgetExceededCounts =
      aggregateResult.length > 0
        ? aggregateResult[0].budget_exceeded_counts
        : 0;

    // 8. PAGINATION
    const totalPages = Math.ceil(total_count / limit);

    const data = await Budget.find(query)
      .populate(["createdBy"])
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // 9. RESPONSE
    return res.status(200).json({
      status: true,
      message: "budget data fetched successfully",
      data,
      pagination: {
        page,
        limit,
        totalRecords: total_count,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        totalBudgetAmount,
        budgetExceededCounts,
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
