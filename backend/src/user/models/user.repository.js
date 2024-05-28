import UserModel from "./user.schema.js";
import mongoose from "mongoose";
import { ObjectId } from "mongoose";

export const createNewUserRepo = async (user) => {
  return await new UserModel(user).save();
};

export const findUserRepo = async (factor, withPassword = false) => {
  if (withPassword) return await UserModel.findOne(factor).select("+password");
  else return await UserModel.findOne(factor);
};

export const findUserForPasswordResetRepo = async (hashtoken) => {
  console.log(hashtoken);
  console.log(new Date(Date.now()));
  const user = await UserModel.findOne({
    resetPasswordToken: hashtoken,
  });
  if (!user) {
    const resp = {
      success: false,
      msg: "No such token exists",
    };
    return resp;
  }
  console.log(new Date(Date.now()), user.resetPasswordExpire);
  if (new Date(Date.now()) < user.resetPasswordExpire) {
    return user;
  } else {
    const resp = {
      success: false,
      msg: "Expired token!",
    };
    return resp;
  }
};

export const updateUserProfileRepo = async (_id, data) => {
  return await UserModel.findOneAndUpdate(_id, data, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
};

export const getAllUsersRepo = async () => {
  return UserModel.find({});
};

export const deleteUserRepo = async (_id) => {
  return await UserModel.findByIdAndDelete(_id);
};

export const updateUserRoleAndProfileRepo = async (_id, data) => {
  // Write your code here for updating the roles of other users by admin
  return await UserModel.findByIdAndUpdate(_id,data,{new:true})

};
