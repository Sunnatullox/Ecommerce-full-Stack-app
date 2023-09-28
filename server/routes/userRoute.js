const { Router } = require("express");
const {
  createUser,
  userActivation,
  loginUser,
  loadUserInfo,
  logOutUser,
  updateUserInfo,
  updateUserAvatar,
  updateUserAddress,
  deleteUserAddress,
  updateUserPassword,
  findUserInfo,
  getAllusersAdmin,
  deleteUserAdmin,
  forgotPasswordSendMailToken,
  forgotPasswordCheckToken,
  userResetPassword,
} = require("../controllers/userCtrl");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const userRouter = Router();

userRouter.post("/create-user", createUser);
userRouter.post("/activation", userActivation);
userRouter.post("/login-user", loginUser);
userRouter.post("/forgot-password", forgotPasswordSendMailToken);
userRouter.get("/check-token-reset-password", forgotPasswordCheckToken);
userRouter.post("/reset-user-password", userResetPassword);
userRouter.get("/getuser", isAuthenticated, loadUserInfo);
userRouter.get("/logout", isAuthenticated, logOutUser);
userRouter.put("/update-user-info", isAuthenticated, updateUserInfo);
userRouter.put("/update-avatar", isAuthenticated, updateUserAvatar);
userRouter.put("/update-user-addresses", isAuthenticated, updateUserAddress);
userRouter.delete(
  "/delete-user-address/:id",
  isAuthenticated,
  deleteUserAddress
);
userRouter.put("/update-user-password", isAuthenticated, updateUserPassword);
userRouter.get("/user-info/:id", findUserInfo);
userRouter.get(
  "/admin-all-users",
  isAuthenticated,
  isAdmin("Admin"),
  getAllusersAdmin
);
userRouter.delete(
  "/delete-user/:id",
  isAuthenticated,
  isAdmin("Admin"),
  deleteUserAdmin
);

module.exports = userRouter;
