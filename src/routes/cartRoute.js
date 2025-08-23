import express from "express";
import { auth } from "../utils/auth.js";
import {
  addToCart,
  emptyCart,
  getCart,
  removeFromCart,
  updateQuantity,
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/api/v1/cart", auth, getCart);
router.post("/api/v1/cart", auth, addToCart);
router.put("/api/v1/cart", auth, updateQuantity);
router.delete("/api/v1/cart/remove", auth, removeFromCart);
router.delete("/api/v1/cart", auth, emptyCart);

export { router as cartRouter };
