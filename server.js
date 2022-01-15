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

const trackRouter = require('./routes/track');

var testAPIRouter = require('./routes/api_status');
const nftRouter = require('./routes/nftRoutes');

app.use('/track', trackRouter);
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

app.get('/login', (req, res) => {
  res.render('storefront');
});

app.get('/profile', (req, res) => {
  res.render('profile');
});

// app.get("/:username", (req, res) => {

//   loadArtist(req.params.username,res);
//   res.send("Your name is "+ req.params.username + "\n");
// });

// app.get("/:username/:track", (req, res) => {

//   loadTrack(req.params.username, req.params.track,res)

// });

// async function main() {
//   const args = minimist(process.argv.slice(2));
//   const token = args.token;

//   if (!token) {
//     return console.error(
//       'A token is needed. You can create one on https://web3.storage',
//     );
//   }

//   if (args._.length < 1) {
//     return console.error(
//       'Please supply the path to a file or directory',
//     );
//   }

//   const storage = new Web3Storage({ token });
//   const files = [];

//   for (const path of args._) {
//     const pathFiles = await getFilesFromPath(path);
//     files.push(...pathFiles);
//   }

//   //console.log(`Uploading ${files.length} files`);
//   const cid = await storage.put(files);
//   //console.log('Content added with CID:', cid);
// }

//FOR VIDEO SECTION
const router = express.Router();
const axios = require('axios');

app.use(cors());
app.use(express.json());
