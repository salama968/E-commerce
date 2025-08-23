import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
} from "../controllers/userController.js";
import { auth } from "../utils/auth.js";

const router = express.Router();

// Prefix could be added in app.js; here we define core routes
router.post("/api/v1/auth/register", registerUser);
router.post("/api/v1/auth/login", loginUser);
router.get("/api/v1/users/me", auth, getProfile);

export { router as userRouter };
