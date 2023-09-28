const Messages = require("../models/messagesModel");
const ErrorHandler = require("../middleware/ErrorHandler");
const asyncHandler = require("express-async-handler");
const { uploadFileToFirebaseStorage } = require("../utils/firebase");


// create new message
exports.createNewMessage = asyncHandler(async (req, res, next) => {
  try {
    const messageData = req.body;
    if (!req.files?.image) {
      messageData.conversationId = req.body.conversationId;
      messageData.sender = req.body.sender;
      messageData.text = req.body.text;

      const message = new Messages({
        conversationId: messageData.conversationId,
        text: messageData.text,
        sender: messageData.sender,
        images: undefined,
      });

      await message.save();
      res.status(201).json({
        success: true,
        message,
      });
    } else {
      const images = await uploadFileToFirebaseStorage(req.files.image);

      messageData.images = images;

      messageData.conversationId = req.body.conversationId;
      messageData.sender = req.body.sender;
      messageData.text = req.body.text;

      const message = new Messages({
        conversationId: messageData.conversationId,
        text: messageData.text,
        sender: messageData.sender,
        images: messageData.images ? messageData.images : undefined,
      });

      await message.save();

      res.status(201).json({
        success: true,
        message,
      });
    }
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler(error.message), 500);
  }
});

// get all messages with conversation id
exports.getAllMessages = asyncHandler(async (req, res, next) => {
  try {
    const messages = await Messages.find({
      conversationId: req.params.id,
    });

    res.status(201).json({
      success: true,
      messages,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message), 500);
  }
});
