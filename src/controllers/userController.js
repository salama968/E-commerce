import { userModel } from "./../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const signToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const registerUser = async (req, res) => {
  try {
    let { name, email, password } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const exist = await userModel.findOne({ email: email });

    if (exist)
      return res.status(409).json({
        message: "this email is already registerd",
      });

    const salt = await bcrypt.genSalt(8);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new userModel({
      email,
      password: hashedPassword,
      name,
    });

    await user.save();

    const token = signToken({ userId: user._id });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

  const user = await userModel.findOne({ email: email }).select("+password");

    if (!user)
      return res
        .status(401)
        .json({ message: "invalid email or password" });

    const matched = await bcrypt.compare(password, user.password);
    if (!matched)
      return res
        .status(401)
        .json({ message: "invalid email or password" });

    const token = signToken({ userId: user._id });

    res.status(200).json({
      message: "login successful",
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const getProfile = async (req, res) => {
  res.status(200).json(req.user);
};
export { registerUser, loginUser, getProfile };
