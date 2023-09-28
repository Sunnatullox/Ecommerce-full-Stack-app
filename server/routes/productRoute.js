const { Router } = require("express");
const {
  productCreate,
  getAllProductsShop,
  deleteProductShop,
  getAllProducts,
  reviewForProduct,
  getAllProductsAdmin,
} = require("../controllers/productCtrl");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");

const productRoute = Router();

productRoute.post("/create-product", productCreate);
productRoute.get("/get-all-products-shop/:id", getAllProductsShop);
productRoute.delete("/delete-shop-product/:id", isSeller, deleteProductShop);
productRoute.get("/get-all-products", getAllProducts);
productRoute.put("/create-new-review", isAuthenticated, reviewForProduct);
productRoute.get(
  "/admin-all-products",
  isAuthenticated,
  isAdmin("Admin"),
  getAllProductsAdmin
);

module.exports = productRoute;
