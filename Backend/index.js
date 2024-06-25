import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRoute from './route/user.route.js';
import cors from "cors"; // Import cors middleware

const app = express();

app.use(express.json());
app.use(cors()); // Use the cors middleware
dotenv.config();
const PORT = process.env.PORT || 1106;
const URI = process.env.MongoDBURI;

mongoose.connect(URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.log("Error connecting to MongoDB:", error));

// Middleware to log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use("/user", userRoute);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
