const router = require('express').Router();
let Queue = require('../models/queue.model');

router.route('/showAll').get((req, res) => {
    Queue.find()
    .then((queueItem) => res.json(queueItem))
    .catch((err) => res.status(400).json('Error: ' + err));
});

router.route('/').get((req, res) => {
    res.render('duelStart');
});

router.route("/add/:player_address/:player_nft").get(async (req, res) => {
  const player_address = req.params.player_address;
  const player_nft = req.params.player_nft;
  //console.log(req);
  const alreadyInQueue = await Queue.findOne({
    player_address: player_address,
  });
  console.log(alreadyInQueue);
  if (!alreadyInQueue) {
    const newUser = new Queue({
      player_address: String(player_address),
      player_nft: String(player_nft),
    });

    newUser
      .save()
      .then(() => res.json(true))
      .catch((err) => res.status(400).json("Error: " + err));
  } else {
    res.json(false);
  }
});

module.exports = router;
