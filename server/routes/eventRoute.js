const { Router } = require("express");
const {
  eventCreate,
  deleteShopEvent,
  getAllEvent,
  getAllEventsShop,
  getAllEventsAdmin,
} = require("../controllers/eventCtrl");
const { isAuthenticated, isAdmin, isSeller } = require("../middleware/auth");

const eventRouter = Router();

eventRouter.post("/create-event", eventCreate);
eventRouter.get("/get-all-events", getAllEvent);
eventRouter.get("/get-all-events/:id", getAllEventsShop);
eventRouter.delete("/delete-shop-event/:id", isSeller, deleteShopEvent);
eventRouter.get(
  "/admin-all-events",
  isAuthenticated,
  isAdmin("Admin"),
  getAllEventsAdmin
);

module.exports = eventRouter;
