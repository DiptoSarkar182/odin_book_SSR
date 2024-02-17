const mongoose = require("mongoose");
const { DateTime } = require("luxon");
const Schema = mongoose.Schema

const CommentSchema = new Schema({
    content: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref:"User", required: true },
    post: { type: Schema.Types.ObjectId, required: true },
    dateCreated: {
        type: Date,
        default: () => new Date(),
        required: true,
    },
})


module.exports = mongoose.model("Comment", CommentSchema)