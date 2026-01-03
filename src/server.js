// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import { ConnectDB } from "./config/db.js";
// import { userRouter } from "./routes/user-router.js";
// import { incomeRouter } from "./routes/income-router.js";
// import * as path from "path";
// import { goalRouter } from "./routes/goal-router.js";
// import { expenseRouter } from "./routes/expense-router.js";
// import budgetRouter from "./routes/budget-router.js"; 
// import { dashboardRouter } from "./routes/dashboard-router.js";
// import notificationRouter from "./routes/notification-routes.js";

// dotenv.config();

// //for vercel
// ConnectDB();

// const app = express();


// //  CORS setup
// const FRONTEND_URL = process.env.FRONT_END_URL || "http://localhost:5173";

// app.use(
//   cors({
//     origin: "*",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );

// app.use(express.json());

// app.use(
//   "/uploads/users",
//   express.static(path.join(process.cwd(), "uploads", "users"))
// );


// app.use("/api/user", userRouter);
// app.use("/api/income", incomeRouter);
// app.use("/api/goal", goalRouter);
// app.use("/api/expense", expenseRouter);
// app.use("/api/budget", budgetRouter);
// app.use("/api/dashboard", dashboardRouter);
// app.use("/api/notification", notificationRouter);

// app.get("/", (req, res) => {
//   res.json({ message: "Backend running" });
// });
// const pathIs = path.join(process.cwd(), "uploads", "users");
// console.log("pathIds----", pathIs);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
//   console.log(`Allowed origin: ${FRONTEND_URL}`);
// });

//for vercel 
// export default app;

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { ConnectDB } from "./config/db.js";

import { userRouter } from "./routes/user-router.js";
import { incomeRouter } from "./routes/income-router.js";
import { goalRouter } from "./routes/goal-router.js";
import { expenseRouter } from "./routes/expense-router.js";
import budgetRouter from "./routes/budget-router.js";
import { dashboardRouter } from "./routes/dashboard-router.js";
import notificationRouter from "./routes/notification-routes.js";

dotenv.config();

const app = express();

/* -------------------- */
/* ✅ BODY PARSER */
/* -------------------- */
app.use(express.json());

/* -------------------- */
/* ✅ CORS — SAFE FOR VERCEL */
/* -------------------- */
app.use(
  cors({
    origin: true, // allow all origins dynamically
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* -------------------- */
/* ✅ MONGODB CONNECTION */
/* -------------------- */
let isConnected = false;

app.use(async (req, res, next) => {
  try {
    if (!isConnected) {
      await ConnectDB();
      isConnected = true;
      console.log("MongoDB connected");
    }
    next();
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    return res.status(500).json({
      status: false,
      message: "Database connection failed",
    });
  }
});

/* -------------------- */
/* ✅ ROUTES */
/* -------------------- */
app.use("/api/user", userRouter);
app.use("/api/income", incomeRouter);
app.use("/api/goal", goalRouter);
app.use("/api/expense", expenseRouter);
app.use("/api/budget", budgetRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/notification", notificationRouter);

/* -------------------- */
/* ✅ HEALTH CHECK */
/* -------------------- */
app.get("/", (req, res) => {
  res.json({ message: "Backend running" });
});

export default app;
