

//1. MULTER STORAGE

// import multer from "multer";
// import path from "path";
// import fs from "fs";

// // 1️ Ensure upload folder exists
// const uploadDir = path.join(process.cwd(), "uploads","users");
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// // 2️ Storage configuration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname);
//     cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
//   },
// });

// // 3️ File filter (to accept only images for example)
// const fileFilter = (req, file, cb) => {
//   const allowed = ["image/jpeg", "image/png", "image/jpg"];
//   if (!allowed.includes(file.mimetype)) {
//     return cb(new Error("Only image files are allowed"), false);
//   }
//   cb(null, true);
// };

// // 4️ File size limit (example: 2MB)
// const limits = {
//   fileSize: 2 * 1024 * 1024, // 2 MB
// };

// // 5️ Create the upload instance
// export const upload = multer({
//   storage,
//   fileFilter,
//   limits,
// });



// middleware/multer.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js"; // <-- UNCOMMENT THIS

const storage = new CloudinaryStorage({
  cloudinary, // <-- MUST pass this
  params: async (req, file) => ({
    folder: "expense-tracker/users",
    public_id: `${Date.now()}-${file.originalname}`,
    allowed_formats: ["jpg", "png", "jpeg"], // optional but recommended
  }),
});

export const upload = multer({ storage });




