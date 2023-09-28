const { Router } = require("express");
const { isSeller, isAuthenticated } = require("../middleware/auth");
const {
  getSellerConversation,
  getUserConversation,
  updateLastMessage,
  createNewConversation,
} = require("../controllers/conversationCtrl");
const conversationRouter = Router();

conversationRouter.post(
  "/create-new-conversation",
  createNewConversation
);

conversationRouter.get(
  "/get-all-conversation-seller/:id",
  isSeller,
  getSellerConversation
);

conversationRouter.get(
  "/get-all-conversation-user/:id",
  isAuthenticated,
  getUserConversation
);
conversationRouter.put("/update-last-message/:id", updateLastMessage);

module.exports = conversationRouter;
