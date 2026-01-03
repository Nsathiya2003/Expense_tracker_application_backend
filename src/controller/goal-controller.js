import { GoalHistory } from "../models/goal-history-model.js";
import { Goal } from "../models/goal-model.js";

export const createGoal = async (req, res) => {
  const { goal_name, target_amount, deadline_date, notes } = req.body;
  const user_id = req.user.id;

  try {
    let isExisting = await Goal.findOne({ goal_name: goal_name });
    if (isExisting) {
      return res.status(409).json({
        success: true,
        message: "Goal name already exists",
        data: null,
      });
    }

    const createGoal = await Goal.create({
      goal_name: goal_name,
      target_amount: target_amount,
      deadline_date: deadline_date,
      notes: notes,
      createdBy: user_id,
      updatedBy: null,
      status: "PENDING",
      allocated_amount: 0,
    });

    //maintain goal history...
    // const history = await GoalHistory.create({
    //     goal_id: createGoal._id,
    //     income_type: 'initial',
    //     allocated_amount:0
    // })

    return res.status(200).json({
      success: true,
      message: "Your new goal was created",
      data: createGoal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `error creating goal ${error.message}`,
      data: null,
    });
  }
};

export const findAllGoal = async (req, res) => {
  const user_id = req?.user?.id;
  try {
    const find = await Goal.find({ createdBy: user_id }).populate([
      "createdBy",
    ]);

    return res.status(200).json({
      status: true,
      message: "All goals fetched successfully",
      data: find,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Error fetching goals${error?.message}`,
      data: null,
    });
  }
};

export const findOne = async (req, res) => {
  const { id } = req?.params;
  try {
    const findData = await Goal.findById(id);
    return res.status(201).json({
      status: true,
      message: "Data fetched successfully",
      data: findData,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `error finding data${error.message}`,
      data: null,
    });
  }
};

export const updateGoal = async (req, res) => {
  const { id } = req?.params;
  const { goal_name, target_amount, deadline_date, notes } = req.body;
  const user_id = req?.user?.id;
  try {
    const findData = await Goal.findById(id);
    if (!findData) {
      return res.status(404).json({
        status: false,
        message: "Data not found",
        data: [],
      });
    }
      (findData.goal_name = goal_name),
      (findData.target_amount = target_amount),
      (findData.deadline_date = deadline_date),
      (findData.notes = notes);
       findData.updatedBy = user_id;

    await findData.save();

      //update goal status...
      if (findData) {
      if (findData.allocated_amount >= findData.target_amount) {
        findData.status = "completed";
      } else if (findData.allocated_amount > 0) {
        findData.status = "In-progress";
      } else {
        findData.status = "pending";
      }
      await findData.save(); // save the status change
    }

    return res.status(201).json({
      status: true,
      message: "Your goal was updated successfully",
      data: findData,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `error updating goal ${error?.message}`,
      data: [],
    });
  }
};

export const deleteGoal = async (req, res) => {
  const { id } = req?.params;

  try {
    const findData = await Goal.findByIdAndDelete(id);
    return res.status(201).json({
      status: true,
      message: "your goal was deleted",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error deleting data",
      data: [],
    });
  }
};

export const filterGoal = async (req, res) => {
  const { page, limit, search, fromDate, toDate, deadline_date, status } =
    req.body;
  const user_id = req?.user?.id;

  console.log("req.body is----", req?.body);

  //1.set needed condition based...
  let query = {
    createdBy: user_id,
  };

  //2.search
  if (search) {
    query.$or = [
      { goal_name: { $regex: search, $options: "i" } },
      { target_amount: { $regex: search, $options: "i" } },
      { notes: { $regex: search, $options: "i" } },
    ];
  }

  //3.filter
  if (fromDate && toDate) {
    query.createdAt = {
      $gte: fromDate,
      $lte: toDate,
    };
  }

  //deadline_date
  if (deadline_date) {
    query.deadline_date = deadline_date;
  }
  //status
  if (status) {
    query.status = status;
  }

  //3.total count
  const total_count = await Goal.countDocuments(query);

  //4. calculate paginated data...
  const data = await Goal.find(query)
    .populate("createdBy")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  //5.return response
  return res.status(201).json({
    status: true,
    message: "Goal data fetched successfully",
    data: data,
    pagination: {
      page: page,
      limit: limit,
      totalRecords: total_count,
      totalPages: Math.ceil(total_count / limit),
      hasNextPage: page < Math.ceil(total_count / limit),
      hasPrevPage: page > 1,
    },
  });
};

export const viewGoalHistory = async (req, res) => {
  const { page, limit } = req.body;
  const user_id = req.user?.id;

  let query = {
    createdBy: user_id,
  };

  const total_count = await GoalHistory.countDocuments(query);

  const data = await GoalHistory.find(query)
    .populate(["createdBy", "goal_id"])
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return res.status(201).json({
    status: true,
    message: "All histories fetched successfully",
    data: data,
    pagination: {
      page: page,
      limit: limit,
      totalRecords: total_count,
      totalPages: Math.ceil(total_count / limit),
      hasNextPage: page < Math.ceil(total_count / limit),
      hasPrevPage: page > 1,
    },
  });
};
