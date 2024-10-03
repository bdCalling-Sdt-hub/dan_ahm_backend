const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { success, failure } = require("../utilities/common");
const Auth = require("../model/auth.model");
const User = require("../model/user.model");
const HTTP_STATUS = require("../constants/statusCodes");

const signup = async (req, res) => {
  try {
    // const validation = validationResult(req).array();
    // console.log(validation);
    // if (validation.length > 0) {
    //   return res
    //     .status(HTTP_STATUS.OK)
    //     .send(failure("Failed to add the user", validation[0].msg));
    // }

    if (req.body.role === "admin") {
      return res
        .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        .send(failure(`Admin cannot be signed up`));
    }

    if (!req.body.email || !req.body.password) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("please provide mail and password"));
    }

    const emailCheck = await Auth.findOne({ email: req.body.email });
    if (emailCheck) {
      return res
        .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        .send(failure(`User with email: ${req.body.email} already exists`));
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      nhsNumber: req.body.nhsNumber,
      phone: req.body.phone,
      gender: req.body.gender,
      balance: req.body.balance ? req.body.balance : 0,
    });

    // const newUser = await User.create(req.body)
    // creates new user and stores
    const newUser = await Auth.create({
      email: req.body.email,
      password: hashedPassword,
      // role: req.body.role,
      // lockedTill: Date.now(),
      // lockedTill: null,
      user: user._id,
    });

    // payload, secret, JWT expiration
    // const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, {
    //     expiresIn: process.env.JWT_EXPIRES_IN
    // })

    newUser.password = undefined;
    newUser.__v = undefined;
    newUser.role = undefined;
    newUser.verified = undefined;
    newUser.wrongAttempts = undefined;
    newUser.isLocked = undefined;
    newUser.lockedTill = undefined;
    user.__v = undefined;

    if (newUser) {
      res
        .status(HTTP_STATUS.OK)
        .send(success("Account created successfully ", { user }));
    } else {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Account couldnt be created"));
    }
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(`INTERNAL SERVER ERROR`);
  }
};
const signupAsDoctor = async (req, res) => {
  try {
    // const validation = validationResult(req).array();
    // console.log(validation);
    // if (validation.length > 0) {
    //   return res
    //     .status(HTTP_STATUS.OK)
    //     .send(failure("Failed to add the user", validation[0].msg));
    // }

    // if (req.body.role === "admin") {
    //   return res
    //     .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
    //     .send(failure(`Admin cannot be signed up`));
    // }

    if (!req.body.email || !req.body.password) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("please provide mail and password"));
    }

    const emailCheck = await Auth.findOne({ email: req.body.email });

    if (emailCheck && emailCheck.doctorApplicationStatus === "pending") {
      return res
        .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        .send(
          failure(
            `${req.body.email} has already applied for the doctor's position`
          )
        );
    }

    if (
      emailCheck &&
      (emailCheck.isDoctor === true ||
        emailCheck.doctorApplicationStatus === "approved")
    ) {
      return res
        .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        .send(failure(`${req.body.email} is already a doctor`));
    }

    if (emailCheck) {
      emailCheck.doctorApplicationStatus = "pending";
      await emailCheck.save();

      return res
        .status(HTTP_STATUS.OK)
        .send(
          success("You have successfully applied for the doctor's position")
        );
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      gender: req.body.gender,
      nhsNumber: Date.now(),
    });

    // const newUser = await User.create(req.body)
    // creates new user and stores
    const newUser = await Auth.create({
      email: req.body.email,
      password: hashedPassword,
      doctorApplicationStatus: "pending",
      user: user._id,
    });

    // payload, secret, JWT expiration
    // const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, {
    //     expiresIn: process.env.JWT_EXPIRES_IN
    // })

    newUser.password = undefined;
    newUser.__v = undefined;
    newUser.role = undefined;
    newUser.isVerified = undefined;
    newUser.wrongAttempts = undefined;
    newUser.isLocked = undefined;
    newUser.lockedTill = undefined;
    user.__v = undefined;

    if (newUser) {
      res
        .status(HTTP_STATUS.OK)
        .send(
          success(
            "Account created successfully & applied for doctor's position",
            { user }
          )
        );
    } else {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Account couldnt be created"));
    }
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(`INTERNAL SERVER ERROR`);
  }
};

const approveDoctor = async (req, res) => {
  try {
    const { doctorId } = req.body; // doctorId of the user who applied

    if (!doctorId) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Please provide doctorId"));
    }

    const doctor = await Auth.findById(doctorId);

    if (!doctor || doctor.doctorApplicationStatus !== "pending") {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(
          failure("User not found or not applied for the doctor's position")
        );
    }

    doctor.doctorApplicationStatus = "approved";
    doctor.isDoctor = true;
    doctor.role = "doctor";
    await doctor.save();

    return res
      .status(HTTP_STATUS.OK)
      .send(success("Doctor application approved", doctor));
  } catch (err) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Failed to approve doctor"));
  }
};

const cancelDoctor = async (req, res) => {
  try {
    const { doctorId } = req.body; // doctorId of the user who applied

    if (!doctorId) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Please provide doctorId"));
    }

    const doctor = await Auth.findById(doctorId);

    if (!doctor) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("User not found"));
    }

    if (
      doctor.doctorApplicationStatus === "cancelled" ||
      doctor.doctorApplicationStatus === "notApplied"
    ) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("User did not apply for doctor's position yet"));
    }

    doctor.doctorApplicationStatus = "cancelled";
    doctor.isDoctor = false;
    doctor.role = "patient";

    await doctor.save();

    return res
      .status(HTTP_STATUS.OK)
      .send(success("Doctor application cancelled", doctor));
  } catch (err) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Failed to cancel doctor"));
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if email & pass exist
    if (!email || !password) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("please provide mail and password"));
    }

    // fetching the fields
    const user = await Auth.findOne({ email })
      .select("+password")
      .populate("user");

    // object conversion
    const userObj = user.toObject();

    // when the user doesnt exist or pass dont match
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("wrong email or password"));
    }

    // const userDetails = await Auth.findOne({email})
    // .populate("user")

    // token
    const token = jwt.sign(user.toObject(), process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // deleting unnecessary fields
    user.password = undefined;
    delete userObj.password;
    delete userObj.wrongAttempts;
    delete userObj.isLocked;
    delete userObj.lockedTill;
    delete userObj.createdAt;
    delete userObj.updatedAt;
    delete userObj.__v;

    res.setHeader("Authorization", token);
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Logged in successfully", { user, token }));
  } catch (err) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

const loginAsDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if email & pass exist
    if (!email || !password) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("please provide mail and password"));
    }

    // fetching the fields
    const user = await Auth.findOne({ email })
      .select("+password")
      .populate("user");

    // object conversion
    const userObj = user.toObject();

    // when the user doesnt exist or pass dont match
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("wrong email or password"));
    }

    if (user.doctorApplicationStatus === "pending") {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(
          failure("Your account is not approved yet. Please wait for approval")
        );
    }

    if (user.doctorApplicationStatus === "cancelled") {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(
          failure("Your request has been cancelled. Please try again later")
        );
    }

    // const userDetails = await Auth.findOne({email})
    // .populate("user")

    // token
    const token = jwt.sign(user.toObject(), process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // deleting unnecessary fields
    user.password = undefined;
    delete userObj.password;
    delete userObj.wrongAttempts;
    delete userObj.isLocked;
    delete userObj.lockedTill;
    delete userObj.createdAt;
    delete userObj.updatedAt;
    delete userObj.__v;

    res.setHeader("Authorization", token);
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Logged in successfully", { user, token }));
  } catch (err) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

const logout = async (req, res) => {
  try {
    const token = req.headers.authorization
      ? req.headers.authorization.split(" ")[1]
      : null;
    if (!token) {
      // No token means user is not logged in
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("You are not logged in"));
    }
    console.log("after reset", res);
    return res.status(HTTP_STATUS.OK).send(success("Logged out successfully"));
  } catch (err) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Logout failed"));
  }
};

module.exports = {
  signup,
  signupAsDoctor,
  approveDoctor,
  cancelDoctor,
  login,
  loginAsDoctor,
  logout,
};
