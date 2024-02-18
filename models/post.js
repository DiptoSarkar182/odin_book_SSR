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

PostSchema.virtual("timestamp_formatted").get(function () {
  return DateTime.fromJSDate(this.dateCreated).toLocaleString(
    DateTime.DATETIME_MED
  );
});


module.exports = mongoose.model("Post", PostSchema);