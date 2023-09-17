const {
  genOtp,
  verifyOtp,
  saveOtp,
  genForgotPasswordToken,
} = require("../../utils/otp.util");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const {
  updateTokenAdmin,
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/updateToken.utils");
const { sendMail } = require("../../utils/mailer");
const { Admin } = require("../../models/admins.model");
const { User } = require("../../models/users.model");
const crypto = require("crypto");

function generateRandomPassword(length) {
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const specialChars = "!@#$%^&*()_+[]{}|;:,.<>?";
  const allChars = lowercaseChars + uppercaseChars + specialChars;

  let password = "";

  password += uppercaseChars.charAt(
    Math.floor(Math.random() * uppercaseChars.length)
  );

  for (let i = 1; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  password = password.split("");
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join("");
}

exports.loginSuperAdmin = (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    } else {
      if (email !== process.env.SUPER_ADMIN_EMAIL) {
        return res.status(400).json({
          message: "Invalid credentials a",
        });
      } else {
        if (password !== process.env.SUPER_ADMIN_PASSWORD) {
          return res.status(400).json({
            message: "Invalid credentials b",
          });
        } else {
          const tokens = {
            accessToken: jwt.sign(
              { _id: process.env.SUPER_ADMIN_ID },
              process.env.ACCESS_TOKEN_SUPER,
              { expiresIn: "1h" }
            ),
          };
          return res.status(200).json({
            success: true,
            message: "logged In",
            data: {
              tokens: tokens,
            },
          });
        }
      }
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Interval Server error",
    });
  }
};

exports.signupAdmin = async (req, res) => {
  try {
    const email = req.body.email;
    if (!email) {
      return res.status(400).json({
        message: "All fields required",
      });
    } else {
      const oldEmail =
        (await User.findOne({ email: email })) ||
        (await Admin.findOne({ email: email }));
      if (oldEmail) {
        return res.status(400).json({
          success: false,
          message: "Email has been taken",
        });
      } else {
        const generatedPassword = await generateRandomPassword(10);
        console.log(generatedPassword);
        const newAdmin = new Admin({
          email,
          generatedPassword
        });
        await newAdmin.save();
        await sendMail({
          email: email,
          subject: "Account Creation",
          text: `Your admin account has been created with this mail and your password is ${generatedPassword}, thanks`,
        });
        return res.status(201).json({
          success: true,
          data: {
            email: email,
            password: generatedPassword,
          },
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

exports.requestOtpAdmin = async (req, res) => {
  try {
    const admin = req.admin;
    if (admin.isVerified === true) {
      return res.status(400).json({
        message: "User already verified",
      });
    }
    const otp = genOtp();
    await saveOtp(admin.id, otp);
    await sendMail({
      email: admin.email,
      subject: "Account Verification",
      text: `Your one time password is ${otp}, thanks`,
    });
    return res.status(200).json({
      success: true,
      message: "Otp sent!",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal Server error",
    });
  }
};
exports.verifyOtpAdmin = async (req, res) => {
  try {
    const _id = req.admin.id;
    const { otp } = req.body;
    if ((await verifyOtp(_id, otp)) === true) {
      await Admin.findByIdAndUpdate(_id, { isVerified: true }, { new: true });
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
      message: "Interval Error",
    });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    } else {
      const admin = await Admin.findOne({ email: email });
      if (!admin) {
        return res.status(400).json({
          message: "User does not exist",
        });
      } else {
        const isMatch = await argon2.verify(admin.password, password);
        if (!isMatch) {
          return res.status(401).json({
            message: "Invalid Password",
          });
        } else {
          const tokens = {
            accessToken: await generateAccessToken({ _id: admin.id }),
            refreshToken: await generateRefreshToken({ _id: admin.id }),
          };
          return res.status(200).json({
            success: true,
            message: "logged In",
            data: {
              tokens: tokens,
              admin: admin.isActive,
              isVerified: admin.isVerified,
            },
          });
        }
      }
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Interval Server error",
    });
  }
};

exports.logout = async (req, res) => {
  try {
    req.logout();
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Interval server error",
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
      const user = await Admin.findOne({ email: email });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Account with this email not found",
        });
      } else {
        const otp = await genOtp();
        await saveOtp(email, otp);
        await Admin.findOneAndUpdate(
          { email: email },
          { resetPasswordToken: token, resetPasswordStatus },
          { new: true }
        );
        await sendMail({
          email: email,
          subject: "Forgot password",
          text: `Your one time password is ${otp}, thanks`,
        });
        return res.status(200).json({
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

exports.verifyResetPassword = async (req, res) => {
  try {
    const { otp, email } = req.body;
    if (!otp || !email) {
      return res.status(401).json({
        message: "All fields are required",
      });
    } else {
      const user = await Admin.findOne({ email: email });
      if (!(await verifyOtp(user.email, otp))) {
        return res.status(401).json({
          message: "Not found",
        });
      } else {
        const token = await crypto.randomBytes(20).toString("hex");
        await Admin.findOneAndUpdate(
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
      message: "Internal server error",
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
    const user = await Admin.findOne({ resetPasswordToken: token });
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

exports.deleteAdminAccount = async (req, res) => {
  try {
    const email = req.body.email;
    await Admin.findOneAndDelete({ email: email });
    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
