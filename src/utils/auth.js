import jwt from "jsonwebtoken";
import { userModel } from "../models/userModel.js";

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server misconfiguration" });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel
      .findById(payload.userId)
      .select("_id name email role isConfirmed");
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export { auth };
