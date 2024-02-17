const mongoose = require("mongoose");
const { DateTime } = require("luxon");
const Schema = mongoose.Schema

const PostSchema = new Schema({
    content: { type: String },
    dateCreated: {
      type: Date,
      default: () => new Date(),
      required: true,
  },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User", required: true,
  },
    likes: { type: Array, required: true },
    files: {
      type: Array,
    },
})



module.exports = mongoose.model("Post", PostSchema);