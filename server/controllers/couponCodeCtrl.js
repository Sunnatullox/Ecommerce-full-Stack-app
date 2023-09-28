const asyncHandler = require("express-async-handler");
const ErrorHandler = require("../middleware/ErrorHandler");
const CoupounCode = require("../models/couponCodeModel");

//create shop coupon code 
exports.createCouponCode = asyncHandler(async (req, res, next) => {
  try {
    const isCoupounCodeExists = await CoupounCode.find({
      name: req.body.name,
    });

    if (isCoupounCodeExists.length !== 0) {
      return next(new ErrorHandler("Coupoun code already exists!", 400));
    }

    const coupounCode = await CoupounCode.create(req.body);

    res.status(201).json({
      success: true,
      coupounCode,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
});

// get all coupons of a shop
exports.getAllCouponCodes = asyncHandler(async (req, res, next) => {
  try {
    const couponCodes = await CoupounCode.find({ shopId: req.seller.id });
    res.status(201).json({
      success: true,
      couponCodes,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
});

exports.deleteCoupon = asyncHandler(async (req, res, next) => {
  try {
    const couponCode = await CoupounCode.findByIdAndDelete(req.params.id);

    if (!couponCode) {
      return next(new ErrorHandler("Coupon code dosen't exists!", 400));
    }
    res.status(201).json({
      success: true,
      message: "Coupon code deleted successfully!",
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
});

exports.getCouponValue = asyncHandler(async(req, res, next) => {
  try {
    const couponCode = await CoupounCode.findOne({ name: req.params.name });

    res.status(200).json({
      success: true,
      couponCode,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
})
