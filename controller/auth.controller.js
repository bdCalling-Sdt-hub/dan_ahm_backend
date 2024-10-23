const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { success, failure } = require("../utilities/common");
const User = require("../model/user.model");
const Notification = require("../model/notification.model");
const HTTP_STATUS = require("../constants/statusCodes");
const { emailWithNodemailerGmail } = require("../config/email.config");

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

    const emailCheck = await User.findOne({ email: req.body.email });

    if (emailCheck && !emailCheck.emailVerified) {
      // const emailVerifyCode =
      //   Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000; // 4 digits
      const emailVerifyCode = Math.floor(100000 + Math.random() * 900000); //6 digits
      emailCheck.emailVerifyCode = emailVerifyCode;
      await emailCheck.save();

      const emailData = {
        email: emailCheck.email,
        subject: "Account Activation Email",
        html: `
                      <h1>Hello, ${emailCheck?.name || "User"}</h1>
                      <p>Your email verification code is <h3>${emailVerifyCode}</h3> to verify your email</p>
                      
                    `,
      };
      emailWithNodemailerGmail(emailData);

      return res
        .status(HTTP_STATUS.OK)
        .send(success("Please verify your email"));
    }

    if (emailCheck) {
      return res
        .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        .send(failure(`User with email: ${req.body.email} already exists`));
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // const emailVerifyCode =
    //   Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000; // 4digits
    const emailVerifyCode = Math.floor(100000 + Math.random() * 900000); //6 digits

    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      emailVerifyCode,
      nhsNumber: req.body.nhsNumber || Date.now(),
      phone: req.body.phone,
      gender: req.body.gender,
      balance: req.body.balance ? req.body.balance : 0,
    });

    // payload, secret, JWT expiration
    // const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, {
    //     expiresIn: process.env.JWT_EXPIRES_IN
    // })

    const emailData = {
      email: req.body.email,
      subject: "Account Activation Email",
      html: `
                  <h1>Hello, ${newUser?.name || "User"}</h1>
                  <p>Your email verification code is <h3>${emailVerifyCode}</h3> to verify your email</p>
                  
                `,
    };

    emailWithNodemailerGmail(emailData);
    if (newUser) {
      return res
        .status(HTTP_STATUS.OK)
        .send(success("Account created successfully ", { newUser }));
    }
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .send(failure("Account couldnt be created"));
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(`INTERNAL SERVER ERROR`);
  }
};

const signupAsDoctor = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("please provide mail and password"));
    }

    const emailCheck = await User.findOne({ email: req.body.email });

    const admin = await User.findOne({ role: "admin" });

    // if (!admin) {
    //   return res.status(HTTP_STATUS.NOT_FOUND).send(failure("Admin not found"));
    // }

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

      // const emailVerifyCode =
      //   Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000; // 4 digits
      const emailVerifyCode = Math.floor(100000 + Math.random() * 900000); //6 digits
      emailCheck.emailVerifyCode = emailVerifyCode;
      await emailCheck.save();

      if (!emailCheck.emailVerified) {
        const emailData = {
          email: emailCheck.email,
          subject: "Account Activation & Doctor Application Successful Email",
          html: `
                        <h1>Hello, ${emailCheck?.name || "User"}</h1>
                        <p>Congrats, you have successfully applied for the doctor's position</p>
                        <p>Your email verification code is <h3>${emailVerifyCode}</h3></p>
                        
                      `,
        };
        emailWithNodemailerGmail(emailData);
      }

      const newNotification = await Notification.create({
        applicant: emailCheck._id,
        admin: admin._id || null,
        status: "pending",
        message: `${emailCheck.email} has applied for the doctor role.`,
      });

      if (!newNotification) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("Could not send notification"));
      }

      emailCheck.notifications.push(newNotification._id);
      await emailCheck.save();

      if (admin) {
        admin.notifications.push(newNotification._id);
        await admin.save();
      }

      return res
        .status(HTTP_STATUS.OK)
        .send(
          success("You have successfully applied for the doctor's position")
        );
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      doctorApplicationStatus: "pending",
      phone: req.body.phone,
      gender: req.body.gender,
      nhsNumber: Date.now(),
    });

    if (!newUser) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Account couldnt be created"));
    }

    const emailVerifyCode = Math.floor(100000 + Math.random() * 900000); //6 digits
    newUser.emailVerifyCode = emailVerifyCode;
    await newUser.save();
    const emailData = {
      email: req.body.email,
      subject: "Account Activation & Doctor Application Successful Email",
      html: `
                    <h1>Hello, ${req.body.name || "User"}</h1>
                    <p>Congrats, you have successfully applied for the doctor's position</p>
                    <p>Your email verification code is <h3>${emailVerifyCode}</h3></p>
                    
                  `,
    };
    emailWithNodemailerGmail(emailData);

    const newNotification = await Notification.create({
      applicant: newUser._id,
      admin: admin._id || null,
      status: "pending",
      message: `${newUser.email} has applied for the doctor role.`,
    });

    if (!newNotification) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Could not send notification"));
    }

    newUser.notifications.push(newNotification._id);
    await newUser.save();

    if (admin) {
      admin.notifications.push(newNotification._id);
      await admin.save();
    }

    res
      .status(HTTP_STATUS.OK)
      .send(
        success(
          "Account created successfully & applied for doctor's position",
          { user: newUser }
        )
      );
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(`INTERNAL SERVER ERROR`);
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, emailVerifyCode } = req.body;
    if (!email || !emailVerifyCode) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Please provide email and verification code"));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("User does not exist"));
    }

    if (user.emailVerifyCode !== emailVerifyCode) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Invalid verification code"));
    }

    user.emailVerified = true;
    user.emailVerifyCode = null;
    await user.save();
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Email verified successfully"));
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

    if (!req.user) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Unauthorized! Admin access only"));
    }

    const doctor = await User.findById(doctorId);
    const admin = await User.findOne({ email: req.user.email });

    if (!doctor) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("User does not exist"));
    }

    // if (doctor.doctorApplicationStatus !== "pending") {
    //   return res
    //     .status(HTTP_STATUS.BAD_REQUEST)
    //     .send(failure("User did not apply for the doctor's position"));
    // }

    doctor.doctorApplicationStatus = "approved";
    doctor.isDoctor = true;
    doctor.role = "doctor";
    await doctor.save();

    const emailData = {
      email: doctor.email,
      subject: "Application Approved - Welcome to Our Medical Team!",
      html: `
            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color: #4CAF50;">Congratulations, Dr. ${
                  doctor.name || "User"
                }!</h2>
                <p>We are pleased to inform you that your application to join our medical team has been <strong>approved</strong>.</p>
                
                <p>Thank you for choosing to collaborate with us, and we look forward to working with you to provide top-notch care to our patients.</p>
                
                <p>Below are some important next steps to get started:</p>
                <ul>
                  <li>Complete your profile in the doctor’s portal.</li>
                  <li>Review our policies and guidelines.</li>
                </ul>

                <p>If you have any questions, feel free to reach out to us at any time.</p>

                <p>Sincerely,<br/>
                <strong>My Doctor Clinic</strong><br/>
                <a href="mailto:support@medicalteam.com">support@mydoctorclinic.com</a></p>
              </body>
            </html>
          `,
    };
    emailWithNodemailerGmail(emailData);

    // Create a new notification for the admin doctor
    const newNotification = await Notification.create({
      applicant: doctor._id,
      admin: admin._id,
      status: "approved",
      message: `your application has been approved.`,
    });

    if (!newNotification) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Could not send notification"));
    }

    doctor.notifications.push(newNotification._id);
    await doctor.save();

    admin.notifications.push(newNotification._id);
    await admin.save();

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
    const { doctorId } = req.body;

    if (!doctorId) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Please provide doctorId"));
    }

    const doctor = await User.findById(doctorId);
    const admin = await User.findOne({ email: "admin@email.com" });

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

    // Create a new notification for the admin doctor
    const newNotification = await Notification.create({
      applicant: doctor._id,
      admin: admin._id,
      status: "cancelled",
      message: `your application has been cancelled.`,
    });

    if (!newNotification) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Could not send notification"));
    }

    doctor.notifications.push(newNotification._id);
    await doctor.save();

    admin.notifications.push(newNotification._id);
    await admin.save();

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
    const user = await User.findOne({ email }).select("+password");

    // object conversion
    const userObj = user.toObject();

    // when the user doesnt exist or pass dont match
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("wrong email or password"));
    }

    // token
    const token = jwt.sign(user.toObject(), process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // deleting unnecessary fields
    user.password = undefined;
    delete userObj.password;
    delete userObj.isLocked;
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
    const user = await User.findOne({ email }).select("+password");

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

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Please provide email"));
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("User with this email does not exist"));
    }
    // const emailVerifyCode =
    //   Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000; // 4 digits

    const emailVerifyCode = Math.floor(100000 + Math.random() * 900000); //6 digits

    user.emailVerifyCode = emailVerifyCode;
    user.emailVerified = false;
    await user.save();

    const emailData = {
      email,
      subject: "Password Reset Email",
      html: `
        <h1>Hello, ${user.name || "User"}</h1>
        <p>Your Email verified Code is <h3>${emailVerifyCode}</h3> to reset your password</p>
        <small>This Code is valid for 3 minutes</small>
      `,
    };
    await emailWithNodemailerGmail(emailData);
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Verification code sent successfully"));
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    if (!email || !newPassword || !confirmPassword) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Please provide email, password and confirm password"));
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("User with this email does not exist"));
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Password and confirm password do not match"));
    }

    if (!user.emailVerified) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Please verify your email first"));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.emailVerifyCode = null;

    await user.save();
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Password reset successfully"));
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

const changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;
    if (!email || !oldPassword || !newPassword || !confirmPassword) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(
          failure(
            "Please provide email, old password, new password and confirm password"
          )
        );
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("New password and confirm password do not match"));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("User with this email does not exist"));
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Old password is incorrect"));
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Password changed successfully"));
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
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
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
};
