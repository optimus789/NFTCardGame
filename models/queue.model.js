const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const queueSchema = new Schema(
  {
    player_address:{type:String, unique:true},
    player_nft:{type:String},
  },
  {
    timestamps: true,
  }
);

const Queue = mongoose.model("queue", queueSchema);

module.exports = Queue;
