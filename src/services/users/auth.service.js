const { User } = require("../../models/users.model");
const {
  genOtp,
  verifyOtp,
  saveOtp,
  genForgotPasswordToken,
} = require("../../utils/otp.util");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const argon2 = require("argon2");
const crypto = require("crypto");
const {
  updateToken,
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/updateToken.utils");
const { sendMail } = require("../../utils/mailer");

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Check for existing user and phone number concurrently
    const [oldUser, oldPhoneNumber] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ phoneNumber })
    ]);

    if (oldUser) {
      return res.status(401).json({ message: "User already exists" });
    }
    if (oldPhoneNumber) {
      return res.status(401).json({ message: "Phone number already exists" });
    }

    const newUser = new User({ firstName, lastName, email, phoneNumber, password });
    await newUser.save();

    const otp = genOtp();

    // Perform these operations concurrently since they don't depend on each other
    const [token, refreshToken, hash] = await Promise.all([
      generateAccessToken({ email: newUser.email }),
      generateRefreshToken({ id: newUser.id }).then(argon2.hash),  // hash the refreshToken immediately after generating it
      saveOtp(email, otp)
    ]);

    await sendMail({
      email,
      subject: "Account Verification",
      text: `Your one time password is ${otp}, thanks`
    });

    await updateToken(email, hash);

    return res.status(201).json({
      success: true,
      tokens: { accessToken: token, refreshToken },
      isVerified: newUser.isVerified
    });
  } catch (e) {
    return res.status(500).json({ message: `Internal server error: ${e.message}` });
  }
};


exports.verifyUser = async (req, res) => {
  try {
    const email = req.user.email;
    const { otp } = req.body;
    if ((await verifyOtp(email, otp)) === true) {
      await User.findOneAndUpdate(
        { email: email },
        { isVerified: true },
        { new: true }
      );
      return res.status(200).json({
        success: true,
        message: "User verified successfully",
      });
    } else {
      return res.status(401).json({
        message: "Invalid otp",
      });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.requestOtp = async (req, res) => {
  try {
    const email = req.user.email;
    if (req.user.isVerified === true) {
      return res.status(200).json({
        success: true,
        message: "User already verified",
      });
    }
    const otp = genOtp();
    await saveOtp(email, otp);
    await sendMail({
      email: email,
      subject: "Account Verification",
      text: `Your one time password is ${otp}, thanks`,
    });
    return res.status(200).json({
      success: true,
      message: "Otp sent!",
      data: otp,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Internal Server error",
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(200).json({
        success: false,
        message: "All fields are required!",
      });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(200).json({
        success: false,
        message: "User does not exist!",
      });
    }

    const passwordMatches = await argon2.verify(existingUser.password, password);
    if (!passwordMatches) {
      return res.status(200).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Perform these operations concurrently since they don't depend on each other
    const [accessToken, refreshToken, hash] = await Promise.all([
      generateAccessToken({ email: existingUser.email }),
      generateRefreshToken({ id: existingUser.id }).then(argon2.hash), // hash the refreshToken immediately after generating it
    ]);

    await updateToken(existingUser.email, hash);

    return res.status(200).json({
      success: true,
      tokens: { accessToken, refreshToken },
      isVerified: existingUser.isVerified,
    });

  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Internal Server error",
    });
  }
};


exports.logout = async (req, res) => {
  try {
    const user = req.user;
    const token = req.user.token;
    if (
      user.token === req.headers.authorization ||
      user.token === req.params.token
    ) {
      await User.findOneAndUpdate(
        { email: user.email, token: token },
        {
          $set: {
            token: null,
          },
        }
      );
      return res.status(200).json({
        success: true,
        message: "Logged out",
      });
    } else {
      return res.status(400).json({
        message: "You have logged out already!",
      });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { id } = req.user;
    const { refreshToken } = req.body;
    const user = await User.findById(id);
    const isMatch = argon2.verify(user.refreshTokenHash, refreshToken);
    if (!isMatch) {
      return res.status(401).json({
        message: "Not authorized",
      });
    } else {
      const accessToken = await generateAccessToken({ email: user.email });
      const refreshTokenNew = await generateRefreshToken({ id: user.id });
      const hash = bcrypt.hashSync(refreshTokenNew, 10);
      await updateToken(user.email, hash);
      return res.status(200).json({
        success: true,
        tokens: {
          accessToken,
          refreshToken: refreshTokenNew,
        },
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server error",
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Field is required",
      });
    } else {
      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Account with this email not found",
        });
      } else {
        const otp = genOtp();
        await saveOtp(email, otp);
        await User.findOneAndUpdate(
          { email: email },
          { resetPasswordStatus: true },
          { new: true }
        );
        await sendMail({
          email: email,
          subject: "Forgot password",
          text: `Your one time password is ${otp}, thanks`,
        });
        return res.status(200).json({
          otp: otp,
          success: true,
          message: "Mail sent!",
        });
      }
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Internal Server error",
    });
  }
};

exports.verifyOtpForgotPassword = async (req, res) => {
  try {
    const { otp, email } = req.body;
    if (!otp || !email) {
      return res.status(401).json({
        message: "All fields are required",
      });
    } else {
      const user = await User.findOne({ email: email });
      if (!(await verifyOtp(email, otp))) {
        return res.status(401).json({
          message: "Not found",
        });
      } else {
        const token = await crypto.randomBytes(20).toString("hex");
        await User.findOneAndUpdate(
          { email: email },
          { resetPasswordToken: token },
          { new: true }
        );
        return res.status(200).json({
          success: true,
          token: token,
        });
      }
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Internal Server error",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({
        message: "Bad request",
      });
    }
    const user = await User.findOne({ resetPasswordToken: token });
    if (!user) {
      return res.status(400).json({
        message: "User not found.",
      });
    }
    const newPassword = req.body.password;
    const hash = await argon2.hash(newPassword);
    await user.updateOne({
      password: hash,
      resetPasswordToken: null,
    });
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server error",
    });
  }
};
