const asyncHandler = require("express-async-handler");
const ErrorHandler = require("../middleware/ErrorHandler");
const Shop = require("../models/shopModel");
const Product = require("../models/productModele");
const Order = require("../models/orderModel");
const {
  uploadFileToFirebaseStorage,
  deleteFileFromFirebaseStorage,
} = require("../utils/firebase");

// create a new shop product
exports.productCreate = asyncHandler(async (req, res, next) => {
  try {
    const shopId = req.body.shopId;
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return next(new ErrorHandler("Shop Id is invalid!", 400));
    } else {
      let images = [];

      if (req.files.images.name) {
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

      const productData = req.body;
      productData.images = imagesLinks;
      productData.shop = shop;

      const product = await Product.create(productData);

      res.status(201).json({
        success: true,
        product,
      });
    }
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler(error, 400));
  }
});
// get all products
exports.getAllProductsShop = asyncHandler(async (req, res, next) => {
  try {
    const products = await Product.find({ shopId: req.params.id });

    res.status(201).json({
      success: true,
      products,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
});

// delete  product shop
exports.deleteProductShop = asyncHandler(async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler("Product is not found with this id", 404));
    }
    for (let i = 0; i < product.images.length; i++) {
      const element = product.images[i];
      await deleteFileFromFirebaseStorage(element.public_id);
    }
    await Product.findByIdAndDelete(req.params.id);

    res.status(201).json({
      success: true,
      message: "Product Deleted successfully!",
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
});

// get all products
exports.getAllProducts = asyncHandler(async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(201).json({
      success: true,
      products,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
});

// review for a product
exports.reviewForProduct = asyncHandler(async (req, res, next) => {
  try {
    const { user, rating, comment, productId, orderId } = req.body;

    const product = await Product.findById(productId);

    const review = {
      user,
      rating,
      comment,
      productId,
    };

    const isReviewed = product.reviews.find(
      (rev) => rev.user._id === req.user._id
    );

    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user._id === req.user._id) {
          (rev.rating = rating), (rev.comment = comment), (rev.user = user);
        }
      });
    } else {
      product.reviews.push(review);
    }

    let avg = 0;

    product.reviews.forEach((rev) => {
      avg += rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    await Order.findByIdAndUpdate(
      orderId,
      { $set: { "cart.$[elem].isReviewed": true } },
      { arrayFilters: [{ "elem._id": productId }], new: true }
    );

    res.status(200).json({
      success: true,
      message: "Reviwed succesfully!",
    });
  } catch (error) {
    console.log(error)
    return next(new ErrorHandler(error, 400));
  }
});

// all products --- for admin
exports.getAllProductsAdmin = asyncHandler(async (req, res, next) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1,
    });
    res.status(201).json({
      success: true,
      products,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});
