const asyncHandler = require("express-async-handler");
const ErrorHandler = require("../middleware/ErrorHandler");
const Shop = require("../models/shopModel");
const { createActivationToken, sendShopToken } = require("../utils/jwtToken");
const sendMail = require("../utils/sendMail");
const jwt = require("jsonwebtoken");
const { uploadFileToFirebaseStorage, deleteFileFromFirebaseStorage } = require("../utils/firebase");

// create a new seller shop
module.exports.createShop = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.body;
    const sellerEmail = await Shop.findOne({ email });
    if (sellerEmail) {
      return next(new ErrorHandler("User already exists", 400));
    }

    const seller = {
      name: req.body.name,
      email: email,
      password: req.body.password,
      avatar: req.files.avatar ? await uploadFileToFirebaseStorage(req.files.avatar) : null,
      address: req.body.address,
      phoneNumber: req.body.phoneNumber,
      zipCode: req.body.zipCode,
    };

    const activationToken = await createActivationToken(seller);
    const activationUrl = `${process.env.CLIENT_URL}/seller/activation/${activationToken}`;

    await sendMail({
      email: seller.email,
      subject: "Activate your Shop",
      message: `Hello ${seller.name}, please click on the link to activate your shop: ${activationUrl}`,
    });
    res.status(201).json({
      success: true,
      message: `please check your email:- ${seller.email} to activate your shop!`,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler(error.message, 500));
  }
});

//activate shop
module.exports.shopActivation = asyncHandler(async (req, res, next) => {
  try {
    const { activation_token } = req.body;

    const newSeller = jwt.verify(
      activation_token,
      process.env.ACTIVATION_SECRET
    );

    if (!newSeller) {
      return next(new ErrorHandler("Invalid token", 400));
    }
    const { name, email, password, avatar, zipCode, address, phoneNumber } =
      newSeller;


    let seller = await Shop.findOne({ email });

    if (seller) {
      return next(new ErrorHandler("User already exists", 400));
    }

    seller = await Shop.create({
      name,
      email,
      avatar,
      password,
      zipCode,
      address,
      phoneNumber,
    });

    sendShopToken(seller, 201, res);
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler(error.message, 500));
  }
});

// shop login
module.exports.shopLogin = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler("Please provide the all fields!", 400));
    }

    const user = await Shop.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorHandler("User doesn't exists!", 400));
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return next(
        new ErrorHandler("Please provide the correct information", 400)
      );
    }

    sendShopToken(user, 201, res);
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

//   get shop info load
module.exports.getSellerLoadShop = asyncHandler(async (req, res, next) => {
  try {
    const seller = await Shop.findById(req.seller._id);

    if (!seller) {
      return next(new ErrorHandler("User doesn't exists", 400));
    }

    res.status(200).json({
      success: true,
      seller,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Logout shop
exports.logOutShop = asyncHandler(async (req, res, next) => {
  try {
    res.cookie("seller_token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.status(201).json({
      success: true,
      message: "Log out successful!",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// get shop info
exports.getShopInfo = asyncHandler(async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);
    res.status(201).json({
      success: true,
      shop,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// update shop profile picture
exports.updateShopProfilePicture = asyncHandler(async (req, res, next) => {
  try {
    const existsSeller = await Shop.findById(req.seller._id);
    const updateProfilePictureUpload = await uploadFileToFirebaseStorage(
      req.files.avatar
    );
    existsSeller.avatar = updateProfilePictureUpload;

    await existsSeller.save();

    res.status(200).json({
      success: true,
      seller: existsSeller,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// update seller info
exports.updateSellerInfo = asyncHandler(async (req, res, next) => {
  try {
    const { name, description, address, phoneNumber, zipCode } = req.body;

    const shop = await Shop.findOne(req.seller._id);

    if (!shop) {
      return next(new ErrorHandler("User not found", 400));
    }

    shop.name = name;
    shop.description = description;
    shop.address = address;
    shop.phoneNumber = phoneNumber;
    shop.zipCode = zipCode;

    await shop.save();

    res.status(201).json({
      success: true,
      shop,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// all sellers --- for admin
exports.getAllSellersForAdmin = asyncHandler(async (req, res, next) => {
  try {
    const sellers = await Shop.find().sort({
      createdAt: -1,
    });
    res.status(201).json({
      success: true,
      sellers,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// delete seller ---admin
exports.deleteSllerAdmin = asyncHandler(async (req, res, next) => {
  try {
    const seller = await Shop.findById(req.params.id);

    if (!seller) {
      return next(
        new ErrorHandler("Seller is not available with this id", 400)
      );
    }

    await deleteFileFromFirebaseStorage(seller.avatar.public_id)
    
    await Shop.findByIdAndDelete(req.params.id);

    res.status(201).json({
      success: true,
      message: "Seller deleted successfully!",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// update seller withdraw methods --- sellers
exports.updateSellerMethods = asyncHandler(async (req, res, next) => {
  try {
    const { withdrawMethod } = req.body;

    const seller = await Shop.findByIdAndUpdate(req.seller._id, {
      withdrawMethod,
    });

    res.status(201).json({
      success: true,
      seller,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// delete seller withdraw merthods --- only seller
exports.deleteSellerMethod = asyncHandler(async (req, res, next) => {
  try {
    const seller = await Shop.findById(req.seller._id);

    if (!seller) {
      return next(new ErrorHandler("Seller not found with this id", 400));
    }

    seller.withdrawMethod = null;

    await seller.save();

    res.status(201).json({
      success: true,
      seller,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});
