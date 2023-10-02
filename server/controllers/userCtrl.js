const asyncHandler = require("express-async-handler");
const ErrorHandler = require("../middleware/ErrorHandler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const { sendToken, createActivationToken } = require("../utils/jwtToken");
const bcrypt = require("bcrypt");
const {
  uploadFileToFirebaseStorage,
  deleteFileFromFirebaseStorage,
} = require("../utils/firebase");

// register user controller
exports.createUser = asyncHandler(async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const userEmail = await User.findOne({ email });

    if (userEmail) {
      return next(new ErrorHandler("User already exists", 400));
    }

    const user = {
      name: name,
      email: email,
      password: password,
      avatar: req.files.avatar
        ? await uploadFileToFirebaseStorage(req.files.avatar)
        : null,
    };

    const activationToken = await createActivationToken(user);
    // console.log(activationToken);
    const activationUrl = `${process.env.CLIENT_URL}/activation/${activationToken}`;
    await sendMail({
      email: user.email,
      subject: "Activate your account",
      message: `Hello ${user.name}, please click on the link to activate your account: ${activationUrl}`,
    });

    res.status(201).json({
      success: true,
      message: `please check your email: ${user.email} to activate your account!`,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Create a new account for google authentication
exports.googleAuth = asyncHandler(async (req, res, next) => {
  try {
    if (req.body.Ca !== req.body.googleId && !req.body.accessToken) {
      return next(new ErrorHandler("Error creating a new account for google authentication", 400));
    }
    
    const { profileObj } = req.body;
    const findUser = await User.findOne({ email: profileObj.email });

    if (findUser) {
      if (!findUser.googleId) {
        return next(new ErrorHandler("Sorry, you can't sign in with google. Please try again", 400));
      }
      sendToken(findUser, 201, res);
    } else {
      const newUser = {
        name: profileObj.name,
        email: profileObj.email,
        googleId: profileObj.googleId,
        avatar: { public_id: "", url: profileObj.imageUrl },
      };
      const user = await User.create(newUser);

      sendToken(user, 201, res);
    }
  } catch (error) {
    console.error(error);
    return next(new ErrorHandler("Server error", 500));
  }
});

// user forgot password send email tokken
exports.forgotPasswordSendMailToken = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email }).select("-password");
    if (!user) {
      return next(
        new ErrorHandler(`Sorry ${email} no such email was found`, 400)
      );
    }

    const activationToken = await createActivationToken(user);

    const activationUrl = `${process.env.CLIENT_URL}/reset-password/${activationToken}`;

    await sendMail({
      email: user.email,
      subject: "Access token to reset the password",
      message: `Hi ${user.name}, click the link to reset your password: ${activationUrl}`,
    });

    res.status(201).json({
      success: true,
      message: `Please check your email:- You have been sent a link to reset your password ${user.email}!`,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// user forgot password check token
exports.forgotPasswordCheckToken = asyncHandler(async (req, res, next) => {
  try {
    const { x_auth_token } = req.headers;
    try {
      const token = await jwt.verify(
        x_auth_token,
        process.env.ACTIVATION_SECRET
      );
      if (token) {
        next();
      } else {
        return next(
          new ErrorHandler("Sorry, there is an error with your token", 400)
        );
      }
    } catch (err) {
      return next(
        new ErrorHandler("Sorry, there is an error with your token", 400)
      );
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler(error.message, 400));
  }
});

// user reset password
exports.userResetPassword = asyncHandler(async (req, res, next) => {
  try {
    const { x_auth_token } = req.headers;
    const { password } = req.body;
    const hashPass = await bcrypt.hash(password, 10);
    const token = await jwt.verify(x_auth_token, process.env.ACTIVATION_SECRET);
    const user = await User.findOneAndUpdate(
      { email: token.user.email },
      {
        $set: { password: hashPass },
      }
    );
    if (user) res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("sorry server error please try again", 401));
  }
});

//activate user
exports.userActivation = asyncHandler(async (req, res, next) => {
  try {
    const { activation_token } = req.body;

    const newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);

    if (!newUser) {
      return next(new ErrorHandler("Invalid token", 400));
    }
    const { name, email, password, avatar } = newUser;

    let user = await User.findOne({ email });

    if (user) {
      return next(new ErrorHandler("User already exists", 400));
    }

    user = await User.create({
      name,
      email,
      avatar,
      password,
    });

    sendToken(user, 201, res);
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// login user
exports.loginUser = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler("Please provide the all fields!", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorHandler("User doesn't exists!", 400));
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return next(
        new ErrorHandler("Please provide the correct information", 400)
      );
    }

    sendToken(user, 201, res);
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler(error.message, 500));
  }
});

// load user
exports.loadUserInfo = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorHandler("User doesn't exists", 400));
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Logout User
exports.logOutUser = asyncHandler(async (req, res, next) => {
  try {
    res.cookie("token", null, {
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

// update user info
exports.updateUserInfo = asyncHandler(async (req, res, next) => {
  try {
    const { email, password, phoneNumber, name } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorHandler("User not found", 400));
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return next(
        new ErrorHandler("Please provide the correct information", 400)
      );
    }

    user.name = name;
    user.email = email;
    user.phoneNumber = phoneNumber;

    await user.save();

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// update user avatar
exports.updateUserAvatar = asyncHandler(async (req, res, next) => {
  try {
    let existsUser = await User.findById(req.user.id);

    if (req.body.avatar !== "") {
      const avatar = await uploadFileToFirebaseStorage(req.files.avatar);
      existsUser.avatar = avatar;

      await existsUser.save();

      res.status(200).json({
        success: true,
        user: existsUser,
      });
    } else {
      res.status(200).json({
        success: true,
        user: existsUser,
      });
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// update user addresses
exports.updateUserAddress = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    const sameTypeAddress = user.addresses.find(
      (address) => address.addressType === req.body.addressType
    );
    if (sameTypeAddress) {
      return next(
        new ErrorHandler(`${req.body.addressType} address already exists`)
      );
    }

    const existsAddress = user.addresses.find(
      (address) => address._id === req.body._id
    );

    if (existsAddress) {
      Object.assign(existsAddress, req.body);
    } else {
      // add the new address to the array
      user.addresses.push(req.body);
    }

    await user.save();

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// delete user address
exports.deleteUserAddress = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user._id;
    const addressId = req.params.id;

    await User.updateOne(
      {
        _id: userId,
      },
      { $pull: { addresses: { _id: addressId } } }
    );

    const user = await User.findById(userId);

    res.status(200).json({ success: true, user });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// update user password
exports.updateUserPassword = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
      return next(new ErrorHandler("Old password is incorrect!", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
      return next(
        new ErrorHandler("Password doesn't matched with each other!", 400)
      );
    }
    user.password = req.body.newPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully!",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// find user infoormation with the userId
exports.findUserInfo = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// all users --- for admin
exports.getAllusersAdmin = asyncHandler(async (req, res, next) => {
  try {
    const users = await User.find({ role: "user" }).sort({
      createdAt: -1,
    });
    res.status(201).json({
      success: true,
      users,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// delete users --- admin
exports.deleteUserAdmin = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorHandler("User is not available with this id", 400));
    }
    await deleteFileFromFirebaseStorage(user.avatar.public_id);
    await User.findByIdAndDelete(req.params.id);

    res.status(201).json({
      success: true,
      message: "User deleted successfully!",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});
