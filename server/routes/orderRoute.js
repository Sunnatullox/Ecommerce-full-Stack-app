const { Router } = require("express");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const {
  createNewOrder,
  getAllOrdersSeller,
  getAllOrdersUser,
  updateOrderStatusSeller,
  giveARefuntUser,
  getAllOrdersAdmin,
  acceptTheRefundSeller,
} = require("../controllers/orderCtrl");

const orderRouter = Router();

orderRouter.post("/create-order", isAuthenticated, createNewOrder);
orderRouter.get("/get-all-orders/:userId", isAuthenticated, getAllOrdersUser);
orderRouter.get("/get-seller-all-orders/:shopId", isSeller, getAllOrdersSeller);
orderRouter.put("/update-order-status/:id", isSeller, updateOrderStatusSeller);
orderRouter.put("/order-refund/:id", isAuthenticated, giveARefuntUser);
orderRouter.put("/order-refund-success/:id", isSeller, acceptTheRefundSeller);
orderRouter.get(
  "/admin-all-orders",
  isAuthenticated,
  isAdmin("Admin"),
  getAllOrdersAdmin
);

module.exports = orderRouter;
