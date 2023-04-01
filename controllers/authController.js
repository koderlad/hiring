const crypto = require("crypto"); //To create a Token Link
const { promisify } = require("util");
const jwt = require("jsonwebtoken"); //To create security Tokens
const User = require("../models/userModel"); //User Model
const catchAsync = require("../utils/catchAsync"); //Handle Middleware Async Error
const AppError = require("../utils/appError"); //Handle Application Error Status

const sendEmail = require("../utils/sendEmail");

//Create JSON Web Token

//Signing Token :: Creating a unique Header and Payload Token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//Create and Send Token and Response
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

//User Sign Up
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    type: req.body.type,
  });
  createSendToken(newUser, 201, res); //Sending Token to Client/Frontend
});

//User Log In
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body; //Get Username and Password from Rrquest

  //1. If email and password exists
  if (!email || !password) {
    return next(new AppError("Please provide email and Password", 400));
  }

  //2. Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");
  //To check if password is correct, the data logic is written in Model
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Username/Password did not match", 401));
  }

  //3. If everything is ok
  createSendToken(user, 200, res);
});

//Forgot Password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1. Get User based on posted email.
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("User does not exist", 404));
  }

  //2. Generate random token for Forgot Password Link
  const resetToken = user.createPasswordToken(); //This is a Schema Method that Returns Token and generates value for schemas
  await user.save({ validateBeforeSave: false }); //Save the schema value to DB

  //3. Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Reset your password by clicking on ${resetURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (Valid for 10 minutes)",
      message,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({
      validateBeforeSave: false,
    });

    console.log(err);
    return next(
      new AppError("There was an error sending the email, Try again later!"),
      500
    );
  }

  res.status(200).json({
    status: "Success",
    message: "Token sent to email",
  });
});

//Reset Password
exports.resetPassword = catchAsync(async (req, res, next) => {
  console.log("Token", req.params.token);
  //1. Get User based on that token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }); //Match the token in database and Request and check if the expriy date is larger than current date.

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();
  await user.save();
  createSendToken(user, 200, res);
});

//Create a protected route
exports.protect = catchAsync(async (req, res, next) => {
  //1. Getting Token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not authorized. Please log in to get access!", 401)
    );
  }

  //2. Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3. Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists", 401)
    );
  }

  //4. Check if user changed password after the token was issued
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again", 401)
    );
  }

  //Grant Access to Protected Route
  req.user = currentUser;
  next();
});
