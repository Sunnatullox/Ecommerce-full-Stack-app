const { Router } = require("express");
const {
  createShop,
  shopActivation,
  shopLogin,
  getShopInfo,
  logOutShop,
  getSellerLoadShop,
  updateShopProfilePicture,
  updateSellerInfo,
  getAllSellersForAdmin,
  deleteSllerAdmin,
  updateSellerMethods,
  deleteSellerMethod,
} = require("../controllers/shopCtrl");
const { isSeller, isAdmin, isAuthenticated } = require("../middleware/auth");

const shopRoute = Router();

shopRoute.post("/create-shop", createShop);
shopRoute.post("/activation", shopActivation);
shopRoute.post("/login-shop", shopLogin);
shopRoute.get("/getSeller", isSeller, getSellerLoadShop);
shopRoute.get("/get-shop-info/:id", getShopInfo);
shopRoute.get("/logout", isSeller, logOutShop);
shopRoute.put("/update-shop-avatar", isSeller, updateShopProfilePicture);
shopRoute.put("/update-seller-info", isSeller, updateSellerInfo);
shopRoute.get(
  "/admin-all-sellers",
  isAuthenticated,
  isAdmin("Admin"),
  getAllSellersForAdmin
);
shopRoute.delete(
  "/delete-seller/:id",
  isAuthenticated,
  isAdmin("Admin"),
  deleteSllerAdmin
);
shopRoute.put("/update-payment-methods", isSeller, updateSellerMethods);
shopRoute.delete("/delete-withdraw-method", isSeller, deleteSellerMethod);

module.exports = shopRoute;
