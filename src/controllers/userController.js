import { userModel } from "./../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendMail } from "../utils/sendEmail.js";

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

    await sendMail(email);
    res.status(201).json({
      message: "User registered successfully, Please verify your email",
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await userModel
      .findOne({ email: email })
      .select("+password isConfirmed");

    if (!user)
      return res.status(401).json({ message: "invalid email or password" });

    const matched = await bcrypt.compare(password, user.password);
    if (!matched)
      return res.status(401).json({ message: "invalid email or password" });

    const token = signToken({ userId: user._id });
    let messageToBeSent = "login successful";
    if (!user.isConfirmed) {
      messageToBeSent += ",Please verify your email";
      sendMail(email);
    }
    res.status(200).json({
      message: messageToBeSent,
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

const deleteAccount = async (req, res) => {
  try {
    let emailToBeDeleted = (req.body?.email || req.user.email || "")
      .toLowerCase()
      .trim();
    if (!emailToBeDeleted) {
      return res.status(400).json({ message: "email is required" });
    }

    // If attempting to delete someone else, require admin
    const isSelf = emailToBeDeleted === (req.user.email || "").toLowerCase();
    if (!isSelf && req.user.role !== "admin") {
      return res.status(401).json({ message: "unauthorized behaviour" });
    }

    const target = await userModel.findOne({ email: emailToBeDeleted });
    if (!target) return res.status(404).json({ message: "User not found" });

    await userModel.deleteOne({ _id: target._id });
    return res.status(204).send();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select("-password");
    res.status(200).json({
      message: "All users retrieved successfully",
      users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const verifyAccount = async (req, res) => {
  try {
    const email = req.params.email;
    const v = jwt.verify(email, process.env.JWT_SECRET);
    if (v) {
      const email = v.email;
      const user = await userModel
        .findOne({ email: email })
        .select("+password isConfirmed");

      user.isConfirmed = true;
      await user.save();
      res.json({
        message: "verified successfully",
      });
    }
  } catch (error) {
    console.error("Token not valid:", error.message);
  }
};
export {
  registerUser,
  loginUser,
  getProfile,
  verifyAccount,
  deleteAccount,
  getAllUsers,
};
