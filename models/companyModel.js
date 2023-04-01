const mongoose = require("mongoose");

const companyScheme = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Company name is Required"],
  },
  logo: String,
  cover: String,
  locations: [
    {
      address: String,
      isMain: Boolean,
    },
  ],
  numberofemployees: Number,
  industry: String,
  users: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      role: {
        type: String,
        enum: {
          values: [
            "admin",
            "recruiter",
            "hiring-manager",
            "interviewer",
            "member",
          ],
          default: "recruiter",
          message:
            "A role can either be: admin, recruiter, hiring-manager, interviewer or a member",
        },
      },
    },
  ],
});

//Defining Model name and variable
const company = mongoose.model("Company", companyScheme);
module.exports = company;
