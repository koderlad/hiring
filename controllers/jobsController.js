const Jobs = require("../models/jobsModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

//Get All Jobs
exports.getAllJobs = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: {
      data: "This is a job post",
    },
  });
});

//Create New Job
exports.createJobs = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const newJobs = await Jobs.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      jobs: newJobs,
    },
  });
});

//Get Single Job Detail
exports.getJob = catchAsync(async (req, res, body) => {
  const job = await Jobs.findById(req.params.id);
  if (!job) {
    return AppError("Data not found", 404);
  }

  res.status(200).json({
    status: "success",
    data: {
      job,
    },
  });
});

//Update Single Job
exports.updateJob = catchAsync(async (req, res, next) => {
  const job = await Jobs.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!job) {
    return AppError("Data not found", 404);
  }

  res.status(200).json({
    status: "success",
    data: {
      job,
    },
  });
});

//Delete Single Job
exports.deleteJob = catchAsync(async (req, res, next) => {
  const job = await Jobs.findByIdAndDelete(req.params.id);
  if (!job) {
    return AppError("Did not found", 404);
  }

  res.status(204).json({ status: "success", data: null });
});

//Change Job Status
exports.changeStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  const job = await Jobs.findByIdAndUpdate(
    req.params.id,
    { status },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!job) {
    return AppError("Did not found", 404);
  }

  res.status(200).json({
    status: "success",
    data: {
      job,
    },
  });
});
