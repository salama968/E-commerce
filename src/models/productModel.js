import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please enter product name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "please enter product description"],
    },
    price: {
      type: Number,
      required: [true, "please enter product price"],
      min: [0, "price must be positive "],
    },
    category: {
      type: String,
      required: [true, "please enter product category"],
    },
    stock: {
      type: Number,
      required: [true, "please enter product quantity"],
      min: [0, "stock must be positive "],
    },
    // images: [
    //   {
    //     url: {
    //       type: string,
    //     },
    //   },
    // ],
    // ratings: {
    //   type: Number,
    //   default: 0,
    // },
    // numReviews: {
    //   type: Number,
    //   default: 0,
    // },
    // reviews: [
    //   {
    //     user: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: "user",
    //       required: true,
    //     },
    //     name: {
    //       type: String,
    //       required: true,
    //     },
    //     rating: {
    //       type: Number,
    //       required: true,
    //       min: 1,
    //       max: 5,
    //     },
    //     comment: {
    //       type: String,
    //       required: true,
    //     },
    //     createdAt: {
    //       type: Date,
    //       default: Date.now,
    //     },
    //   },
    // ],
  },
  {
  timestamps: true,
  }
);

const productModel = mongoose.model("product", productSchema);

export { productModel };
