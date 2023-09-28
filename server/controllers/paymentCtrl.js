const asyncHandler = require("express-async-handler");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// create payment request
exports.createPayment = asyncHandler(async (req, res, next) => {
  const myPayment = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "usd",
    metadata: {
      company: "GoShop",
    },
  });
  res.status(200).json({
    success: true,
    client_secret: myPayment.client_secret,
  });
});

exports.getStirpeApi = asyncHandler(async (req, res, next) => {
  res.status(200).json({ stripeApikey: process.env.STRIPE_API_KEY });
});
