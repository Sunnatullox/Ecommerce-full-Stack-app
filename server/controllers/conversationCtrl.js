const Conversation = require("../models/conversationModel");
const ErrorHandler = require("../middleware/ErrorHandler");
const asyncHandler = require("express-async-handler");

// create a new conversation
exports.createNewConversation = asyncHandler(async (req, res, next) => {
  try {
    const { groupTitle, userId, sellerId } = req.body;

    const isConversationExist = await Conversation.findOne({ groupTitle });

    if (isConversationExist) {
      const conversation = isConversationExist;
      res.status(201).json({
        success: true,
        conversation,
      });
    } else {
      const conversation = await Conversation.create({
        members: [userId, sellerId],
        groupTitle: groupTitle,
      });

      res.status(201).json({
        success: true,
        conversation,
      });
    }
  } catch (error) {
    return next(new ErrorHandler(error.response.message), 500);
  }
});

// get seller conversations
exports.getSellerConversation = asyncHandler(async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      members: {
        $in: [req.params.id],
      },
    }).sort({ updatedAt: -1, createdAt: -1 });

    res.status(201).json({
      success: true,
      conversations,
    });
  } catch (error) {
    return next(new ErrorHandler(error), 500);
  }
});

// get user conversations
exports.getUserConversation = asyncHandler(async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      members: {
        $in: [req.params.id],
      },
    }).sort({ updatedAt: -1, createdAt: -1 });

    res.status(201).json({
      success: true,
      conversations,
    });
  } catch (error) {
    return next(new ErrorHandler(error), 500);
  }
});

// update the last message
exports.updateLastMessage = asyncHandler(async (req, res, next) => {
  try {
    const { lastMessage, lastMessageId } = req.body;

    const conversation = await Conversation.findByIdAndUpdate(req.params.id, {
      lastMessage,
      lastMessageId,
    });

    res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    return next(new ErrorHandler(error), 500);
  }
});
