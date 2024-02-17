const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
const {body, validationResult} = require('express-validator');
const passport = require('passport');
const {flash} = require('express-flash');
const {createHash} = require('../middlewares/authentication');
const upload = require('../middlewares/multer');
const cloudinary = require('../middlewares/cloudinary');
const validator = require('validator');
const fs = require('fs');
const path = require('path');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');

exports.posts_get = async(req,res,next)=>{
    try {
        const currentUser = req.user;
        return res.render("posts", {
            title: "Create Post",
            currentUser: currentUser,
        });
    } catch (error) {
        return next(error)
    }
}