// Please don't change the pre-written code
// Import the necessary modules here

import { sendPasswordResetEmail } from "../../../utils/emails/passwordReset.js";
import { sendWelcomeEmail } from "../../../utils/emails/welcomeMail.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";
import { sendToken } from "../../../utils/sendToken.js";
import {
  createNewUserRepo,
  deleteUserRepo,
  findUserForPasswordResetRepo,
  findUserRepo,
  getAllUsersRepo,
  updateUserProfileRepo,
  updateUserRoleAndProfileRepo,
} from "../models/user.repository.js";
import crypto from "crypto";

export const createNewUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    const newUser = await createNewUserRepo(req.body);
    // Implement sendWelcomeEmail function to send welcome message
    await sendWelcomeEmail(newUser);
    await sendToken(newUser, res, 200);
  } catch (err) {
    //  handle error for duplicate email
    if (err.name === "MongoServerError" && err.code === 11000) {
      // Duplicate key error (E11000) for MongoDB
      res.status(400).json({
        success: false,
        error: `Email '${email}' is already registered.`,
      });
    }
    return next(new ErrorHandler(400, err));
  }
};

export const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorHandler(400, "please enter email/password"));
    }
    const user = await findUserRepo({ email }, true);
    if (!user) {
      return next(
        new ErrorHandler(401, "user not found! register yourself now!!")
      );
    }
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return next(new ErrorHandler(401, "Invalid email or passswor!"));
    }
    await sendToken(user, res, 200);
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const logoutUser = async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({ success: true, msg: "logout successful" });
};

export const forgetPassword = async (req, res, next) => {
  // Implement feature for forget password
  try {
    const user = await findUserRepo({ email: req.body.email });
    if (!user) {
      res.status(400).json({
        success: false,
        msg: "email is not registered",
      });
    } else {
      const passwordResetToken = await user.getResetPasswordToken();
      //console.log(resetToken);
      await sendPasswordResetEmail(user, passwordResetToken);
      res.status(200).json({
        success: true,
        resetToken: passwordResetToken,
      });
    }
  } catch (err) {
    next(err);
  }
};

export const resetUserPassword = async (req, res, next) => {
  // Implement feature for reset password
  console.log(req.params.token);
  const resp = await findUserForPasswordResetRepo(req.params.token);
  if (!resp.success) {
    res.status(400).json({
      success: false,
      msg: resp.msg,
    });
  } else {
    const newPassword = req.body.password;
    const confirmNewpassword = req.body.confirmPassword;
    if (newPassword == confirmNewpassword) {
      user.password = newPassword;
      user.resetPasswordToken = "";
      user.resetPasswordExpire = "";
      await user.save();
      res.status(200).json({
        success: true,
        user: resp,
      });
    } else {
      res.status(400).json({
        success: false,
        msg: "Password and Confirm Password do not match",
      });
    }
  }
};

export const getUserDetails = async (req, res, next) => {
  try {
    const userDetails = await findUserRepo({ _id: req.user._id });
    res.status(200).json({ success: true, userDetails });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  try {
    if (!currentPassword) {
      return next(new ErrorHandler(401, "pls enter current password"));
    }

    const user = await findUserRepo({ _id: req.user._id }, true);
    const passwordMatch = await user.comparePassword(currentPassword);
    if (!passwordMatch) {
      return next(new ErrorHandler(401, "Incorrect current password!"));
    }

    if (!newPassword || newPassword !== confirmPassword) {
      return next(
        new ErrorHandler(401, "mismatch new password and confirm password!")
      );
    }

    user.password = newPassword;
    await user.save();
    await sendToken(user, res, 200);
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const updateUserProfile = async (req, res, next) => {
  const { name, email } = req.body;
  try {
    const updatedUserDetails = await updateUserProfileRepo(req.user._id, {
      name,
      email,
    });
    res.status(201).json({ success: true, updatedUserDetails });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// admin controllers
export const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await getAllUsersRepo();
    res.status(200).json({ success: true, allUsers });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const getUserDetailsForAdmin = async (req, res, next) => {
  try {
    const userDetails = await findUserRepo({ _id: req.params.id });
    if (!userDetails) {
      return res
        .status(400)
        .json({ success: false, msg: "no user found with provided id" });
    }
    res.status(200).json({ success: true, userDetails });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await deleteUserRepo(req.params.id);
    if (!deletedUser) {
      return res
        .status(400)
        .json({ success: false, msg: "no user found with provided id" });
    }

    res
      .status(200)
      .json({ success: true, msg: "user deleted successfully", deletedUser });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const updateUserProfileAndRole = async (req, res, next) => {
  // Write your code here for updating the roles of other users by admin
  const id = req.params.id;
  const resp = await updateUserRoleAndProfileRepo(id, req.body);
  if(resp){
    res
      .status(200)
      .json({ success: true, msg: "user updated successfully", resp })
  }else{
    res
      .status(400)
      .json({ success: false, msg: "no user with such id"})
  }
};