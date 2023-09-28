const { Router } = require("express");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");
const {
  createWithdrawSeller,
  getAllWithdrawAdmin,
  updateWithdrawAdmin,
} = require("../controllers/withdrawCtrl");

const withdrawRouter = Router();

withdrawRouter.post("/create-withdraw-request", isSeller, createWithdrawSeller);
withdrawRouter.get(
  "/get-all-withdraw-request",
  isAuthenticated,
  isAdmin("Admin"),
  getAllWithdrawAdmin
);
withdrawRouter.put(
  "/update-withdraw-request/:id",
  isAuthenticated,
  isAdmin("Admin"),
  updateWithdrawAdmin
);

module.exports = withdrawRouter;
