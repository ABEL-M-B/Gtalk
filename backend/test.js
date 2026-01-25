require("dotenv").config(); // run app from root so it finds .env
const connectMongo = require("./config/mongodb");

connectMongo();
