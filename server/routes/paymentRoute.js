const { Router } = require("express");
const { createPayment, getStirpeApi } = require("../controllers/paymentCtrl");
const { isAuthenticated } = require("../middleware/auth");
const paymentRouter = Router();

paymentRouter.post("/process", isAuthenticated, createPayment);
paymentRouter.get("/stripeapikey", getStirpeApi);

module.exports = paymentRouter;
