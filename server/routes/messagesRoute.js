const { Router } = require("express");
const { createNewMessage, getAllMessages } = require("../controllers/MessagesCtrl");
const messagesRouter = Router();

messagesRouter.post("/create-new-message",createNewMessage)
messagesRouter.get("/get-all-messages/:id",getAllMessages)

module.exports =messagesRouter;