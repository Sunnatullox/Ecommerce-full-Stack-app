const asyncHandler = require("express-async-handler");
const ErrorHandler = require("../middleware/ErrorHandler");
const Shop = require("../models/shopModel");
const Event = require("../models/eventModel");
const { uploadFileToFirebaseStorage, deleteFileFromFirebaseStorage } = require("../utils/firebase");

// create event
exports.eventCreate = asyncHandler(async (req, res, next) => {
  try {
    const shopId = req.body.shopId;
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return next(new ErrorHandler("Shop Id is invalid!", 400));
    } else {
      let images = [];

      if (typeof req.files.images === "string") {
        images.push(req.files.images);
      } else {
        images = req.files.images;
      }

      const imagesLinks = [];
      for (let i = 0; i < images.length; i++) {
        const result = await uploadFileToFirebaseStorage(images[i]);
        
        imagesLinks.push({
          public_id: result.public_id,
          url: result.url,
        });
      }
    

      const event = await Event.create({
                ...req.body,
                images: imagesLinks,
                shop: shop,
              });
  
              res.status(201).json({
                success: true,
                event,
              });
            }


  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
});

// get all events
exports.getAllEvent = asyncHandler(async (req, res, next) => {
  try {
    const events = await Event.find({}).exec();

    res.status(201).json({
      success: true,
      events,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
});

// get all events from shop
exports.getAllEventsShop = asyncHandler(async (req, res, next) => {
  try {
    const events = await Event.find({ shopId: req.params.id }).exec();

    res.status(201).json({
      success: true,
      events,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
});

// delete event of a shop
exports.deleteShopEvent = asyncHandler(async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return next(new ErrorHandler("Event is not found with this id", 404));
    }

    for (let i = 0; i < event.images.length; i++) {
      const element = event.images[i];
      await deleteFileFromFirebaseStorage(element.public_id)
    }
    await Event.findByIdAndDelete({ shopId: req.seller._id, _id: req.params.id });

    res.status(201).json({
      success: true,
      message: "Event Deleted successfully!",
    });
  } catch (error) {
    console.log(error)
    return next(new ErrorHandler(error, 400));
  }
});

// all events --- for admin
exports.getAllEventsAdmin = asyncHandler(async (req, res, next) => {
  try {
    const events = await Event.find().sort({
      createdAt: -1,
    });
    res.status(201).json({
      success: true,
      events,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});
