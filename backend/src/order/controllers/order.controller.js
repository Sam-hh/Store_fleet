// Please don't change the pre-written code
// Import the necessary modules here

import { createNewOrderRepo } from "../model/order.repository.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";

export const createNewOrder = async (req, res, next) => {
  // Write your code here for placing a new order
  const data = {...req.body,user:req.user._id,paidAt:Date.now()}
  const order = await createNewOrderRepo(data)
  res.status(200).json({order})
};
