const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const app = express();
const path = require('path');
const cors = require('cors');

require('dotenv').config();
const port = process.env.APP_PORT || 5000;

const moralisServerUrl = process.env.MORALIS_SERVER_URL;
const moralisAppKey = process.env.MORALIS_APP_KEY;
app.use(cors());

app.set('view engine', 'ejs');
app.use(express.json());
app.use(fileUpload());
app.use(express.static('public'));

const server = app.listen(port, () => {
  console.log(`server is listening on Port  ${port}`);
});

var testAPIRouter = require('./routes/api_status');
const nftRouter = require('./routes/nftRoutes');

app.use('/nft', nftRouter);

app.use('/status-api', testAPIRouter);

// create a GET route
app.get('/some_route', (req, res) => {
  console.log("backend is working")
});

// app.get('/data', (req, res) => {

//   res.return(value);
// });

app.get("/", (req, res) => {
  res.render("home", { moralisAppKey, moralisServerUrl });
});

app.get('/profile', (req, res) => {
  res.render('profile');
});

const router = express.Router();
const axios = require('axios');

app.use(cors());
app.use(express.json());
