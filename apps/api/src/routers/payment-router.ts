import { Router } from "express";
import { createPayment, paymentNotification } from "../controllers/payment/midtrans-payment-controller";
import { uploadPaymentProof } from "@/controllers/payment/manual-transfer-controller";
import { uploader } from "@/middlewares/uplouder-middleware";

const router = Router();
const upload = uploader();

// router.route("/notifications").post(paymentNotification);
router.route("/midtrans/:bookingNumber").post(createPayment);
router.route("/transfer/:bookingNumber").put(upload.single("pictureUrl"), uploadPaymentProof);

export default router;
