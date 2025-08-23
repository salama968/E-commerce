import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please enter your name"],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "please enter your email"],
      unique: true,
      lowercase: true,
      validate: {
        validator: (v) => /[^@\s]+@[^@\s]+\.[^@\s]+/.test(v),
        message: "please provide a valid email",
      },
      index: true,
    },
    password: {
      type: String,
      required: [true, "please enter your password"],
      minlength: [6, "password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    order: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "order",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("user", userSchema);

export { userModel };
