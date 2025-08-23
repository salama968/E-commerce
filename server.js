import { app } from "./src/app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE?.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD || ""
);

mongoose
  .connect(DB)
  .then(() => console.log("DB connection successful!"))
  .catch((err) => {
    console.error("DB connection error:", err.message);
    process.exit(1);
  });

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`server running on port ${PORT}...`);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err?.message || err);
  server.close(() => process.exit(1));
});
