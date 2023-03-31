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
    enum: ["jobseeker", "employer", "admin", "super-admin"],
    default: "jobseeker",
  },
});

//Business Logics on the Data
//Crypt password before saving it to database.
userSchema.pre("save", async function (next) {
  //Only run this if the password is modified
  //Or if the password already existed before
  if (!this.isModified("password")) return next();

  //Hash the password for security with the cost of 12: Uses Memory
  this.password = await bcrypt.hash(this.password, 12);
  //Delete the confirm password field
  this.passwordConfirm = undefined;
  next();
}); //Pre Save Middleware Function

const User = mongoose.model("User", userSchema); //Defining Model Name
module.exports = User; //This is the variable name
