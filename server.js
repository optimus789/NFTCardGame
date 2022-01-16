const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const app = express();
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");

require("dotenv").config();
const port = process.env.PORT || 5000;
const host = process.env.APP_HOST || "0.0.0.0";

const moralisServerUrl = process.env.MORALIS_SERVER_URL;
const moralisAppKey = process.env.MORALIS_APP_KEY;
app.use(cors());

app.set("view engine", "ejs");
app.use(express.json());
app.use(fileUpload());
app.use(express.static("public"));

const uri = process.env.ATLAS_URI;

mongoose.connect(uri);

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const server = app.listen(port, host, () => {
  console.log(`server is listening on Port  ${port} and on host ${host}`);
});

const queueRouter = require("./routes/queueRoute");
var testAPIRouter = require("./routes/api_status");
const resultRoute = require("./routes/duelRoute");

app.use("/result", resultRoute);

app.use("/status-api", testAPIRouter);

app.use("/duel", queueRouter);

// create a GET route
app.get("/some_route", (req, res) => {
  console.log("backend is working");
});

// app.get('/data', (req, res) => {

//   res.return(value);
// });

app.get("/", (req, res) => {
  res.render("home", { moralisAppKey, moralisServerUrl });
});

app.get("/profile", (req, res) => {
  res.render("profile");
});

app.use(cors());
app.use(express.json());
