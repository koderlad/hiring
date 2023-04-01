const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email!"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      //This only works on Save!
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  type: {
    type: String,
    enum: ["jobseeker", "employer", "admin", "super-admin"],
    default: "jobseeker",
  },
});

//Business Logics on the Data

//Defining Actions to do before saving the data
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); //Only run this if the password is not modified

  //Hash the password for security with the cost of 12: Uses Memory
  this.password = await bcrypt.hash(this.password, 12);
  //Delete the confirm password field
  this.passwordConfirm = undefined;
  next();
}); //Pre Save Middleware Function

//Pre Save Middleware to save the date of Password Change.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//Check if Password is correct or not
userSchema.methods.correctPassword = async function (
  typedPassword,
  savedPassword
) {
  return await bcrypt.compare(typedPassword, savedPassword);
};

//Create Reset Token Method
userSchema.methods.createPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //Ten Minutes from Now.
  return resetToken;
};

//Method to check if the user changed password after log in
userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
  }

  return JWTTimestamp < changedTimestamp;
};

const User = mongoose.model("User", userSchema); //Defining Model Name
module.exports = User; //This is the variable name
