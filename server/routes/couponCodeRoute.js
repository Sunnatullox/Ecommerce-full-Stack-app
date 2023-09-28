const { Router } = require("express");
const {
  createCouponCode,
  getAllCouponCodes,
  deleteCoupon,
  getCouponValue,
} = require("../controllers/CouponCodeCtrl");
const { isSeller } = require("../middleware/auth");

const couponCodeRouter = Router();

couponCodeRouter.post("/create-coupon-code", isSeller, createCouponCode);
couponCodeRouter.get("/get-coupon/:id", isSeller, getAllCouponCodes);
couponCodeRouter.delete("/delete-coupon/:id", isSeller, deleteCoupon);
couponCodeRouter.get("/get-coupon-value/:name", getCouponValue);

module.exports = couponCodeRouter;
