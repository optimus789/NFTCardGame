const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const duelSchema = new Schema(
  {
    winner_address: { type: String },
    loser_address: { type: String },
    winner_nft: { type: String, unique: true },
    loser_nft: { type: String, unique: true },
    winner_score: { type: String },
    loser_score: { type: String },
    winner_status: { type: String },
    loser_status: { type: String },
  },
  {
    timestamps: true,
  }
);

const Duel = mongoose.model("duel", duelSchema);

module.exports = Duel;
