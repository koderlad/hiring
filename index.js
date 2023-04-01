//The page where you set up Express Application
const express = require("express");
const { globalMiddleware } = require("./middleware"); //Separating Middle wares from The Express Application

//Requiring Route Modules
const jobRouter = require("./routes/jobRoutes");
const userRouter = require("./routes/userRoutes");

//Initializing Express Framework into "app" variable
const app = express();

//Parsing JSON Data :: THIS IS IMPORTANT TO GET BODY FROM REQUEST
app.use(express.json({ limit: "10kb" }));

//Using Middleware Functions
app.use(globalMiddleware);

//Static Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
}); //Main Page Route

//Mounting Route Middleware
// path and function(s)
app.use("/api/v1/jobs", jobRouter);
app.use("/api/v1/users", userRouter);

//Only returns the Express App.
module.exports = app;
