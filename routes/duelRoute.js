const router = require("express").Router();
const axios = require("axios");

const Duel = require("../models/duel.model");
let Queue = require("../models/queue.model");
const fetch = require("node-fetch");
const { Logger } = require("mongoose/node_modules/mongodb");
const { ethers } = require("ethers");
const web3 = require("web3");

let currentProvider = new web3.providers.HttpProvider(
  "https://polygon-rpc.com/"
);
let provider = new ethers.providers.Web3Provider(currentProvider);
let data = process.env.SECRET_KEY;
let privKey = process.env.PRIV_KEY;
let mnemonic = String(data);
let walletMnemonic = ethers.Wallet.fromMnemonic(mnemonic);
let walletPrivateKey = new ethers.Wallet(walletMnemonic.privateKey);
walletMnemonic.getAddress();

router.route("/showallduel").get((req, res) => {
  Duel.find()
    .then((duelDoc) => res.json(duelDoc))
    .catch((err) => res.status(400).json("Error: " + err));
});
const covalentKey = "ckey_66c30cdb41ca4d87a451559d868";

router.route("/check/:player_address").get(async (req, res) => {
  try {
    console.log(req.params.player_address);
    const player_address = req.params.player_address;
    const inDuelResult = await Duel.findOne({
      $and: [
        {
          $or: [
            { winner_address: player_address },
            { loser_address: player_address },
          ],
        },
        { $or: [{ winner_status: "pending" }, { loser_status: "pending" }] },
      ],
    });
    console.log(inDuelResult);
    if (inDuelResult) {
      console.log(inDuelResult);
      console.log(inDuelResult.loser_status);
      if (
        player_address == inDuelResult.winner_address &&
        inDuelResult.winner_status == "pending"
      ) {
        res.json({
          status: "winner",
          tokenId: inDuelResult.winner_nft,
        });
      } else if (inDuelResult.loser_status === "pending") {
        inDuelResult.loser_status = "seen";
        if (inDuelResult.winner_status == "seen") {
          await Duel.deleteOne({
            loser_address: player_address,
          });
        }
        await inDuelResult.save();
        res.json({
          status: "loser",
          tokenId: inDuelResult.loser_nft,
        });
      } else {
        res.json(false);
      }
    }
    res.json(false);
  } catch (error) {
    console.log(error);
    res.json(false);
  }
});

router.route("/postWonChanges/:player_address").get(async (req, res) => {
  try {
    const player_address = req.params.player_address;
    const inDuelResult = await Duel.findOne({
      winner_address: player_address,
      winner_status: "pending",
    });
    if (inDuelResult) {
      let tx = {
        to: inDuelResult.winner_address,
        value: ethers.utils.parseEther("0.0002"),
      };

      await walletMnemonic.signTransaction(tx);

      let wallet = walletMnemonic.connect(provider);
      let transactionHash = null;
      try {
        transactionHash = await wallet.sendTransaction(tx);
      } catch (error) {
        console.log(error);
      }

      if (transactionHash) {
        winner_status = "seen";
        if (inDuelResult.loser_status == "seen") {
          await Duel.deleteOne({
            winner_address: player_address,
          });
        }
        res.json({
          status: "winner",
          tokenId: inDuelResult.winner_nft,
          transactionHash: transactionHash,
        });
      } else {
        res.json(false);
      }
    }
  } catch (error) {
    console.log(error);
  }
});

//https://api.covalenthq.com/v1/137/tokens/0xDf7661ba0EbE19Bc58a74357456f0724aA97eD8e/nft_metadata/398387882231673972385/?quote-currency=USD&format=JSON&key=ckey_66c30cdb41ca4d87a451559d868
router.route("/").get(async (req, res) => {
  try {
    const playerInQueue = await Queue.find({});
    if (playerInQueue && playerInQueue.length > 1) {
      const player1 = playerInQueue[0];
      const player2 = playerInQueue[1];
      const nftToken1 = player1.player_nft;
      const nftToken2 = player2.player_nft;

      const url1 = `https://api.covalenthq.com/v1/137/tokens/0xDf7661ba0EbE19Bc58a74357456f0724aA97eD8e/nft_metadata/${nftToken1}/?quote-currency=USD&format=JSON&key=${covalentKey}`;
      const url2 = `https://api.covalenthq.com/v1/137/tokens/0xDf7661ba0EbE19Bc58a74357456f0724aA97eD8e/nft_metadata/${nftToken2}/?quote-currency=USD&format=JSON&key=${covalentKey}`;

      const response = await fetch(url1, {
        headers: {
          Accept: "application/json",
        },
      });
      const nftTokenData1 = await response.json();
      console.log(nftTokenData1);
      let nftTokenData2 = await axios.get(url2);
      nftTokenData2 = await nftTokenData2.data;
      if (
        nftTokenData1 &&
        nftTokenData2 &&
        nftTokenData1.data &&
        nftTokenData2.data
      ) {
        const nftScore1 =
          nftTokenData1.data.items[0].nft_data[0].external_data.attributes[1]
            .value;
        const nftScore2 =
          nftTokenData2.data.items[0].nft_data[0].external_data.attributes[1]
            .value;
        if (nftScore1 > nftScore2) {
          const duel = new Duel({
            winner_address: player1.player_address,
            loser_address: player2.player_address,
            winner_nft: player1.player_nft,
            loser_nft: player2.player_nft,
            winner_score: nftScore1,
            loser_score: nftScore2,
            winner_status: "pending",
            loser_status: "pending",
          });
          await duel.save();
        } else {
          const duel = new Duel({
            winner_address: player2.player_address,
            loser_address: player1.player_address,
            winner_nft: player2.player_nft,
            loser_nft: player1.player_nft,
            winner_score: nftScore2,
            loser_score: nftScore1,
            winner_status: "pending",
            loser_status: "pending",
          });
          await duel.save();
        }
        await Queue.deleteOne({ player_address: player1.player_address });
        await Queue.deleteOne({ player_address: player2.player_address });
      }
      res.render("result");
    } else {
      res.render("result");
    }
  } catch (error) {
    console.log(error);
    res.render("result");
  }
});

router.route("/add/:player_address/:player_nft").get(async (req, res) => {
  try {
    const player_address = req.params.player_address;
    const player_nft = req.params.player_nft;
    //console.log(req);
    const alreadyInQueue = await Queue.findOne({
      player_address: player_address,
    });
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
  } catch (error) {
    res.json(false);
  }
});

module.exports = router;
