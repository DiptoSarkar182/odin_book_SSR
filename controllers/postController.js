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

exports.homepage_get = async(req,res,next)=>{
    try {
        if(!req.user){
            return res.redirect("/sign-in");
        }
        const currentUser = req.user;
        const posts = await Post.find({
            $or: [
              { 'user': currentUser.id },
              { 'user': { $in: currentUser.friend_list } }
            ]
          }).sort({dateCreated: -1}).populate("user");

        for (let post of posts) {
            post.comments = await Comment.find({ post: post.id }).sort({dateCreated: -1}).populate("user");
        }
        res.render("home-page",{
            posts: posts,
            currentUser: currentUser,
            
        })
    } catch (error) {
        return next(error)
    }
};

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
};

exports.posts_post = [

    body("content", "Content should have at least 2 characters")
    .trim()
    .isLength({ min: 2 })
    .escape(),

    asyncHandler(async (req, res) => {
        const uploader = async (path) => await cloudinary.uploads(path, "odin_book/post_photo")
        try {
    
                const urls = []
                const files = req.files; 
                for(const file of files){
                    const { path } = file; 
                    const newPath = await uploader(path)
                    urls.push(newPath)
                    fs.unlinkSync(path)
                }
 
                
                    const post = new Post({
                        user: req.user._id,
                        content: req.body.content,
                        files: urls,
                    });
                    await post.save();
                    return res.redirect("/");
                
           
        } catch (error) {
            return next(error);
        }
    
    })
];

exports.post_like_get = async(req,res,next)=>{
    try {
        const postId = req.params.id;
        const userId = req.user.id;
        const posts = await Post.findById(postId);
        posts.likes.push(userId);
        await posts.save();
        return res.redirect("/");
    } catch (error) {
        return next(error);
    }
};

exports.others_profile_post_like_get = async(req,res,next)=>{
    try {
        const postId = req.params.id_1;
        const userId = req.user.id;
        const redirectUserDirect = req.params.id_2;
        const posts = await Post.findById(postId);
        posts.likes.push(userId);
        await posts.save();
        return res.redirect(`/friends/suggested/view-profile/${redirectUserDirect}`);
    } catch (error) {
        return next(error);
    }
};

exports.post_dislike_get = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;
        const posts = await Post.findById(postId);
        posts.likes.pull(userId);
        await posts.save();
        return res.redirect("/");
    } catch (error) {
        return next(error);
    }
};

exports.others_profile_post_dislike_get = async(req,res,next)=>{
    try {
        const postId = req.params.id_1;
        const userId = req.user.id;
        const redirectUserDirect = req.params.id_2;
        const posts = await Post.findById(postId);
        posts.likes.pull(userId);
        await posts.save();
        return res.redirect(`/friends/suggested/view-profile/${redirectUserDirect}`);
    } catch (error) {
        return next(error);
    }
};

exports.add_post_comment = [
    body("comment", "Comment should have at least two characters")
    .trim()
    .isLength({ min: 2 })
    .escape(),
    async(req,res,next)=>{
        try {
            const postId = req.body.postId;
            const userId = req.user.id;
            const comments = new Comment({
                content: req.body.comment,
                user: userId,
                post: postId,
            });
            await comments.save();
            return res.redirect("/");
        } catch (error) {
            return next(error);
        }
    },
];

exports.others_profile_add_post_comment = [
    body("comment", "Comment should have at least two characters")
    .trim()
    .isLength({ min: 2 })
    .escape(),
    async(req,res,next)=>{
        try {
            const postId = req.body.postId;
            const userId = req.user.id;
            const redirectUserDirect = req.params.id;
            const comments = new Comment({
                content: req.body.comment,
                user: userId,
                post: postId,
            });
            await comments.save();
            return res.redirect(`/friends/suggested/view-profile/${redirectUserDirect}`);
        } catch (error) {
            return next(error);
        }
    },
];

exports.delete_comment_get = async(req,res,next)=>{
    try {
        const commentId = req.params.id;
        await Comment.findByIdAndDelete(commentId);
        return res.redirect("/")
    } catch (error) {
        return next(error)
    }
};

exports.others_profile_delete_comment_get = async(req,res,next)=>{
    try {
        const commentId = req.params.id_1;
        const redirectUserDirect = req.params.id_2;
        await Comment.findByIdAndDelete(commentId);
        return res.redirect(`/friends/suggested/view-profile/${redirectUserDirect}`);
    } catch (error) {
        return next(error)
    }
};

exports.comment_like_get = async(req,res,next)=>{
    try {
        const commentId = req.params.id;
        const userId = req.user.id;
        const comment = await Comment.findById(commentId);
        comment.likes.push(userId);
        await comment.save();
        return res.redirect("/");
    } catch (error) {
        return next(error);
    }
};

exports.others_profile_comment_like_get = async(req,res,next)=>{
    try {
        const commentId = req.params.id_1;
        const userId = req.user.id;
        const redirectUserDirect = req.params.id_2;
        const comment = await Comment.findById(commentId);
        comment.likes.push(userId);
        await comment.save();
        return res.redirect(`/friends/suggested/view-profile/${redirectUserDirect}`);
    } catch (error) {
        return next(error);
    }
};

exports.comment_dislike_get = async (req, res, next) => {
    try {
        const commentId = req.params.id;
        const userId = req.user.id;
        const comment = await Comment.findById(commentId);
        comment.likes.pull(userId);
        await comment.save();
        return res.redirect("/");
    } catch (error) {
        return next(error);
    }
};

exports.others_profile_comment_dislike_get = async (req, res, next) => {
    try {
        const commentId = req.params.id_1;
        const userId = req.user.id;
        const redirectUserDirect = req.params.id_2;
        const comment = await Comment.findById(commentId);
        comment.likes.pull(userId);
        await comment.save();
        return res.redirect(`/friends/suggested/view-profile/${redirectUserDirect}`);
    } catch (error) {
        return next(error);
    }
};

exports.delete_post_get = async(req,res,next)=>{
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        const comments = await Comment.find({ post: postId });
        
        if (comments.length > 0) {
            for (let i = 0; i < comments.length; i++) {
                const commentId = comments[i]._id.toString();
                await Comment.findByIdAndDelete(commentId);
            }
        }
        if(post.files.length > 0){
            const publicId = post.files[0].id; 
            await cloudinary.deleteImage(publicId);
          }
        await Post.findByIdAndDelete(postId);

        return res.redirect("/view-profile")
    } catch (error) {
        return next(error);
    }
};

exports.my_profile_like_post = async(req,res,next)=>{
    try {
        const postId = req.params.id;
        const userId = req.user.id;
        const posts = await Post.findById(postId);
        posts.likes.push(userId);
        await posts.save();
        return res.redirect("/view-profile");
    } catch (error) {
        return next(error);
    }
};

exports.my_profile_dislike_post = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;
        const posts = await Post.findById(postId);
        posts.likes.pull(userId);
        await posts.save();
        return res.redirect("/view-profile");
    } catch (error) {
        return next(error);
    }
};

exports.my_profile_add_post_comment = [
    body("comment", "Comment should have at least two characters")
    .trim()
    .isLength({ min: 2 })
    .escape(),
    async(req,res,next)=>{
        try {
            const postId = req.body.postId;
            const userId = req.user.id;
            const comments = new Comment({
                content: req.body.comment,
                user: userId,
                post: postId,
            });
            await comments.save();
            return res.redirect("/view-profile");
        } catch (error) {
            return next(error);
        }
    },
];

exports.my_profile_comment_like_get = async(req,res,next)=>{
    try {
        const commentId = req.params.id;
        const userId = req.user.id;
        const comment = await Comment.findById(commentId);
        comment.likes.push(userId);
        await comment.save();
        return res.redirect("/view-profile");
    } catch (error) {
        return next(error);
    }
};

exports.my_profile_comment_dislike_get = async(req,res,next)=>{
    try {
        const commentId = req.params.id;
        const userId = req.user.id;
        const comment = await Comment.findById(commentId);
        comment.likes.pull(userId);
        await comment.save();
        return res.redirect("/view-profile");
    } catch (error) {
        return next(error);
    }
}

exports.my_profile_delete_comment_get = async(req,res,next)=>{
    try {
        const commentId = req.params.id;
        await Comment.findByIdAndDelete(commentId);
        return res.redirect("/view-profile");
    } catch (error) {
        return next(error)
    }
};

exports.my_profile_edit_post_get = async(req,res,next)=>{
    try {
        const currentUser = req.user;
        const post = await Post.findById(req.params.id)
        
        return res.render("posts", {
            title: "Create Post",
            currentUser: currentUser,
            post: post,
        });
    } catch (error) {
        return next(error)
    }
};

exports.my_profile_edit_post_post = [
    body("content", "Content should have at least 2 characters")
    .trim()
    .isLength({ min: 2 })
    .escape(),

    asyncHandler(async (req, res, next) => {
        const uploader = async (path) => await cloudinary.uploads(path, "odin_book/post_photo")
        const postId = req.params.id;
        let post = await Post.findOne({_id:postId});
        try {
    
        if(post){
            // Check if files array is not empty
            if(post.files.length > 0 && req.files.length > 0){
              const publicId = post.files[0].id; 
              const result = await cloudinary.deleteImage(publicId);
              await post.updateOne({_id:postId},
                { $set: { "files": [] } });
            }
            if(req.method === 'POST'){
              const urls = []
              const files = req.files;
              for(const file of files){
                  const { path } = file; 
                  const newPath = await uploader(path)
                  urls.push(newPath)
                  fs.unlinkSync(path)
              }
              if(urls.length === 0 && post.files.length > 0) {
                urls.push(...post.files);
                }
              post = await Post.findOneAndUpdate(
                { _id: postId },
                {
                  $set: {
                    user: req.user._id,
                    content: req.body.content,
                    files: urls,
                  },
                },
                { new: true }
              );
            }
          }
        return res.redirect("/view-profile");
           
        } catch (error) {
            return next(error);
        }
    
    })
];
