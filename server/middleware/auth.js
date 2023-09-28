const ErrorHandler = require('./ErrorHandler');
const asyncHandler = require("express-async-handler")
const jwt = require('jsonwebtoken');
const User = require("../models/userModel");
const Shop = require("../models/shopModel");

exports.isAuthenticated = asyncHandler(async(req, res, next) => {
    const {token} = req.cookies;
    try {
            if(!token) {
                return next(new ErrorHandler("Please login to continue!"))
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            const user = await User.findById(decoded.id);
            req.user = user;
            next()
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

exports.isSeller = asyncHandler(async(req, res, next) => {
    const {seller_token} = req.cookies;
    
    try {
            if(!seller_token) {
                return next(new ErrorHandler("Please login to continue!"))
            }
            const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);
            const seller = await Shop.findById(decoded.id);
            req.seller = seller;
            next()
    } catch (error) {
        console.log(error)
        return next(new ErrorHandler(error.message, 400));
    }
})


exports.isAdmin = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`${req.user.role} can not access this resources!`))
        };
        next();
    }
}
