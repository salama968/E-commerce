import { productModel } from "../models/productModel.js";

const getAllProducts = async (req, res) => {
  try {
    const products = await productModel.find();

    res.json({
      message: "all products",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "internal server error",
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productModel.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({
      message: "product",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "internal server error",
    });
  }
};

const addProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, image } = req.body;
    if (!name || !description || price == null || stock == null || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const product = new productModel({
      name,
      description,
      price,
      stock,
      category,
      image,
    });
    const createdProduct = await product.save();
    res.status(201).json({
      message: "Product added successfully",
      createdProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "internal server error",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productModel.findById(id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.stock = req.body.stock || product.stock;
    product.category = req.body.category || product.category;
    product.image = req.body.image || product.image;

    const updateProduct = await product.save();
    res.status(200).json({
      message: "Product updated successfully",
      updateProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "internal server error",
    });
  }
};

const deleterProduct = async (req, res) => {
  try {
    const product = await productModel.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "internal server error",
    });
  }
};

export {
  getAllProducts,
  getProductById,
  updateProduct,
  deleterProduct,
  addProduct,
};
