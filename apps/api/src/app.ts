import express, { json, urlencoded, Request, Response } from "express";
import cors from "cors";

import authRouter from "./routers/auth-router";
import sampleRouter from "./routers/sample-router";
import property from "./routers/property-router";
import userRouter from "./routers/user-router";
import bookingRouter from "./routers/booking-router";
import walletRouter from "./routers/wallet-router";
import paymentRouter from "./routers/payment-router";
import customer from "./routers/customer-router";
import { customerGuard, verifyToken } from "./middlewares/auth-middleware";
import { notFoundMiddleware } from "./middlewares/not-found-middleware";
import room from "./routers/room-route";
import { tenantGuard } from "@/middlewares/auth-middleware";
import { error } from "./middlewares/error-middleware";
import cookieParser from "cookie-parser";
import { getAllPropertyBeta } from "./controllers/sample-controller";
import { paymentNotification } from "./controllers/payment-controller";

const createApp = () => {
   const app = express();

   // Middleware configuration
   app.use(
      cors({
         origin: process.env.CLIENT_PORT,
         credentials: true,
      }),
   );
   app.use(json());
   app.use(cookieParser());
   app.use(urlencoded({ extended: true }));

   // Routes
   app.get("/api", (req: Request, res: Response) => {
      res.send("Hello, Purwadhika Student API!");
   });

   app.use("/api/samples", sampleRouter);

   // Auth Route
   app.use("/api/v1/auth", authRouter);

   // User Route
   app.use("/api/v1/users", verifyToken, userRouter);

   // property Route
   app.use("/api/v1/property", customer);

   //tenant Route
   app.use("/api/v1/tenant", verifyToken, tenantGuard, property);

   //room route
   app.use("/api/v1/room", verifyToken, tenantGuard, room);

   // Booking Route
   app.use("/api/v1/bookings", verifyToken, customerGuard, bookingRouter);

   // Wallet Route
   app.use("/api/v1/wallets", verifyToken, customerGuard, walletRouter);

   // Payment Route
   app.use("/api/v1/payments", verifyToken, customerGuard, paymentRouter);

   // Notifications Route
   app.use("/api/v1/notifications", paymentNotification);

   // Playground Route for testing
   app.use("/api/v1/playgrounds", getAllPropertyBeta);

   // Not found handler
   app.use(notFoundMiddleware);

   // Error handlers
   app.use(error);

   return app;
};

export default createApp;
