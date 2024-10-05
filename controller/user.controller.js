const { success, failure } = require("../utilities/common");
const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/statusCodes");
const UserModel = require("../model/user.model");

const getAllUsers = async (req, res) => {
  try {
    const user = await UserModel.find({}).select("-__v");

    // console.log(transaction[0].products);
    if (user) {
      return res.status(HTTP_STATUS.OK).send(
        success("Successfully received all users", {
          result: user,
        })
      );
    } else {
      return res.status(HTTP_STATUS.OK).send("data could not be fetched");
    }
  } catch (error) {
    return res.status(400).send(`internal server error`);
  }
};

// gets only one product
const getOneUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.find({ _id: id });
    if (!user.length) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("User was not found"));
    }

    return res
      .status(HTTP_STATUS.OK)
      .send(success("Successfully got the user", user[0]));
  } catch (error) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send(`internal server error`);
  }
};

const updateUserById = async (req, res) => {
  try {
    // const validation = validationResult(req).array();

    // if (validation.length > 0) {
    //   return res
    //     .status(HTTP_STATUS.OK)
    //     .send(failure("Failed to update data", validation[0].msg));
    // }

    const authId = req.params.id;
    const userAuth = await UserModel.find({ _id: authId }).populate("user");
    const userId = userAuth[0].user._id;
    console.log("user id", userId);

    const updatedUserData = req.body;

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      updatedUserData,
      // Returns the updated document
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: "User not found" });
    }
    console.log(updatedUser);
    updatedUser.__v = undefined;
    return res
      .status(HTTP_STATUS.ACCEPTED)
      .send(success("User data updated successfully", updatedUser));
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "INTERNAL SERVER ERROR" });
  }
};
class UserController {
  // updates
  async updateUserByAdmin(req, res) {
    try {
      const validation = validationResult(req).array();

      if (validation.length > 0) {
        return res
          .status(HTTP_STATUS.OK)
          .send(failure("Failed to update data", validation[0].msg));
      }

      const userId = req.params.id;
      console.log("user id", userId);

      const updatedUserData = req.body;

      console.log("updatedUser", updatedUserData);

      let updatedUser;
      if (updatedUserData.phone || updatedUserData.gender) {
        updatedUser = await UserModel.findByIdAndUpdate(
          userId,
          updatedUserData,
          // Returns the updated document
          { new: true }
        );
      }

      if (!updatedUser) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "property cannot be updated" });
      }
      console.log(updatedUser);
      updatedUser.__v = undefined;
      return res
        .status(HTTP_STATUS.ACCEPTED)
        .send(success("Product updated successfully", updatedUser));
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "INTERNAL SERVER ERROR" });
    }
  }

  async addBalance(req, res) {
    try {
      const authId = req.params.id;
      const { balance } = req.body;

      const userAuth = await UserModel.find({ _id: authId }).populate("user");

      if (!userAuth) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("User was not found"));
      }

      const userId = userAuth[0].user._id;

      const user = await UserModel.findOne({ _id: userId });

      if (!user) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("User was not found"));
      }

      user.balance += balance;

      const balanceUpdated = await user.save();

      if (balanceUpdated) {
        return res
          .status(HTTP_STATUS.OK)
          .send(success("Successfully updated balance!", balanceUpdated));
      }
    } catch (error) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }
}

// Controller to get notifications by userId
const getNotificationsByUserId = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Please provide userId"));
    }

    // Fetch the user to check if they exist
    const user = await UserModel.findById(userId).populate("notifications");

    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("User does not exist"));
    }
    // Return the user's notifications
    res.status(HTTP_STATUS.OK).send({
      message: "Notifications fetched successfully",
      notifications: user.notifications,
    });
    // .json({
    //   message: "Notifications fetched successfully",
    //   notifications: user.notifications,
    // });
  } catch (error) {
    console.error(error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllUsers,
  getOneUserById,
  getNotificationsByUserId,
  updateUserById,
};