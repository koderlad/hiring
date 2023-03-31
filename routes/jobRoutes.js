const express = require("express");
const jobController = require("../controllers/jobsController");

const router = express.Router(); //Middleware Intialization

//Defining Routes for Jobs
router.route("/").get(jobController.getAllJobs);

router.route("/post-job").post(jobController.createJobs);
router
  .route("/:id")
  .get(jobController.getJob)
  .patch(jobController.updateJob)
  .delete(jobController.deleteJob);

router.route("/job-status/:id").patch(jobController.changeStatus);

module.exports = router;
