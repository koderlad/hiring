const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./index");

dotenv.config({ path: "./config.env" });

//Setting up Database Location
const DB = process.env.DATABASE_LOCAL.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose.set("strictQuery", false);
main().catch((err) => console.log(err));

//Making Mongoose Connect if database has auth
async function main() {
  await mongoose.connect(DB);
}

// mongoose.connect(DB);
const port = process.env.PORT || 3000; //Get port from ENV file.

//Initializing or Listening to server on the given port.
const server = app.listen(port, () => {
  console.log(`App is running on port ${port}`);
}); //Starting server

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION. SHUTTING DOWN...");
  server.close(() => {
    process.exit(1);
  });
});
