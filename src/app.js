import express from "express";
import { userRouter } from "./routes/userRoute.js";
import { productRouter } from "./routes/productRoute.js";
import { cartRouter } from "./routes/cartRoute.js";
import { orderRouter } from "./routes/orderRoute.js";

const app = express();

app.use(express.json());

app.use(userRouter);
app.use(productRouter);
app.use(cartRouter);
app.use(orderRouter);
export { app };
