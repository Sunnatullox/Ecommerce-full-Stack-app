const Shop = require("../models/shopModel");
const ErrorHandler = require("../middleware/ErrorHandler");
const asyncHandler = require("express-async-handler");
const Withdraw = require("../models/withdrawModel");
const sendMail = require("../utils/sendMail");

//create withdraw request --- only for seller
exports.createWithdrawSeller = asyncHandler(async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return next(new ErrorHandler("Enter the amount", 400));
    }

    const data = {
      seller: req.seller,
      amount,
    };
    const shop = await Shop.findById(req.seller._id);

    if (!shop) {
      return next(new ErrorHandler("Your store was not found", 404));
    }

    if (shop.availableBalance < amount) {
      return next(new ErrorHandler("Your balance is insufficient", 400));
    }

    try {
      await sendMail({
        email: req.seller.email,
        subject: "Withdraw Request",
        message: `Hello ${req.seller.name}, Your withdraw request of ${amount}$ is processing. It will take 3days to 7days to processing! `,
      });
    } catch (error) {
      return next(new ErrorHandler("Email Error: " + error.message, 500));
    }

    const withdraw = await Withdraw.create(data);

    shop.availableBalance -= amount;

    await shop.save();

    res.status(201).json({
      success: true,
      withdraw,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// get all withdraws --- admnin
exports.getAllWithdrawAdmin = asyncHandler(async (req, res, next) => {
  try {
    const withdraws = await Withdraw.find().sort({ createdAt: -1 });

    res.status(201).json({
      success: true,
      withdraws,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// update withdraw request ---- admin
exports.updateWithdrawAdmin = asyncHandler(async (req, res, next) => {
  try {
    const { sellerId } = req.body;

    const withdraw = await Withdraw.findByIdAndUpdate(
      req.params.id,
      {
        status: "succeed",
        updatedAt: Date.now(),
      },
      { new: true }
    );

    const seller = await Shop.findById(sellerId);

    const transection = {
      _id: withdraw._id,
      amount: withdraw.amount,
      updatedAt: withdraw.updatedAt,
      status: withdraw.status,
    };

    seller.transections = [...seller.transections, transection];

    await seller.save();

    try {
      await sendMail({
        email: seller.email,
        subject: "Payment confirmation",
        message: `Hello ${seller.name}, Your withdraw request of ${withdraw.amount}$ is on the way. Delivery time depends on your bank's rules it usually takes 3days to 7days.`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
    res.status(201).json({
      success: true,
      withdraw,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});
