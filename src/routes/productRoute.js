import express from "express";
import { auth } from "../utils/auth.js";
import validate from "../utils/validateRole.js";
import {
  addProduct,
  deleterProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/api/v1/products", getAllProducts);
router.get("/api/v1/products/:id", getProductById);
router.post("/api/v1/products", auth, validate("admin"), addProduct);
router.put("/api/v1/products/:id", auth, validate("admin"), updateProduct);
router.delete("/api/v1/products/:id", auth, validate("admin"), deleterProduct);

export { router as productRouter };
