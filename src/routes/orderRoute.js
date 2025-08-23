import express from "express";
import { auth } from "../utils/auth.js";
import {
  createOrderFromCart,
  listOrders,
  getOrderById,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/api/v1/orders", auth, createOrderFromCart);
router.get("/api/v1/orders", auth, listOrders);
router.get("/api/v1/orders/:id", auth, getOrderById);

export { router as orderRouter };
