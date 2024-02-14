const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { DateTime } = require("luxon");

const UserSchema = new Schema({
    firstname: {
        type: String,
        required: true,
        minLength: 4,
        maxLength:20,
    },
    lastname: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 20,
    },
    username: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 20,
    },
    email:{
        type: String,
        maxLength: 50,
    },
    password: {
        type: String,
        required: true,
    },
    files: {
        type: Array,
    },
    friend_request: {
        type: Array,
    },
    friend_list: {
        type: Array,
    },
    accountCreatedDate: {
        type: Date,
        default: () => new Date(),
        required: true,
    },
});

UserSchema.virtual("fullName").get(function (){
    return `${this.firstname} ${this.lastname}`;
})

UserSchema.virtual("timestamp_formatted").get(function () {
    return DateTime.fromJSDate(this.accountCreatedDate).toLocaleString(
      DateTime.DATETIME_MED
    );
});

module.exports = mongoose.model("User", UserSchema);