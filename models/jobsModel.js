const mongoose = require("mongoose");

const jobsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter the Job Title"],
    },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "freelance", "internship"],
      default: "full-time",
    },
    description: {
      type: String,
      required: [true, "Please write a Job Description"],
    },
    workModel: {
      type: String,
      enum: ["onsite", "hybrid", "remote"],
      default: "onsite",
    },
    experienceLevel: {
      type: String,
      enum: ["intern", "junior", "mid", "senior", "lead", "manager"],
      default: "junior",
    },
    openDate: Date,
    expiryDate: Date,
    status: {
      type: String,
      enum: ["active", "draft", "expired", "archived"],
      default: "draft",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Jobs = mongoose.model("Jobs", jobsSchema); //Defining model
module.exports = Jobs;
