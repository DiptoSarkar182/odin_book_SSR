const User = require('../models/user');
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

exports.sign_up_get = (req,res,next)=>{
      return res.render("sign-up",{
          title: "Create a new account",
      })
};

exports.sign_up_post = [
    body("first_name")
     .trim()
     .isLength({min:4, max:20})
     .withMessage("First Name is required")
     .escape(),
    
     body("last_name")
     .trim()
     .isLength({min:4, max:20})
     .withMessage("Last Name is required")
     .escape(),
    
     body("username")
     .trim()
     .custom(async (value)=>{
        const user = await User.findOne({username: value});
        if(user){
            return await Promise.reject("Username Already Taken!");
        }
        return true;
     }),
    
     body('email')
     .custom(async (value) => {
       const user = await User.findOne({ email: value });
       if (user) {
         return await Promise.reject("Email already taken");
       }
       return true;
     })
     .isEmail().withMessage('Not a valid e-mail address'),
    
     body("password", "Password should be atleast 6 characters long")
     .trim()
     .isLength({ min: 6 })
     .escape(),
    
     body("confirmPassword").custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords and confirm passwords do not match");
        }
        return true;
      }),
    
      asyncHandler(async(req,res,next)=>{
        const errors = validationResult(req);
        try {
            if (!errors.isEmpty()) {
                const urls = []
                const files = req.files;
                if (files && Array.isArray(files)) {
                    for(const file of files){
                        const { path } = file; 
                        fs.unlinkSync(path)
                    }
                }
                const user = new User({
                  username: req.body.username,
                  firstname: req.body.first_name,
                  lastname: req.body.last_name,
                  password: req.body.password,
                  email: req.body.email,
                });
                return res.render("sign-up", {
                  title: "Create a new account",
                  user: user,
                  errors: errors.array(),
                });
              }
              else{
                const uploader = async (path) => await cloudinary.uploads(path, "odin_book/profile_photo")
                const urls = []
                const files = req.files;
                for(const file of files){
                    const { path } = file; 
                    const newPath = await uploader(path)
                    urls.push(newPath)
                    fs.unlinkSync(path)
                }
                const passwordHash = await createHash(req.body.password);
                const user = await new User({
                    username: req.body.username,
                    firstname: req.body.first_name,
                    lastname: req.body.last_name,
                    password: passwordHash,
                    email: req.body.email,
                    files: urls,
                }).save();
          
                req.login(user, (err) => {
                    if (err) return next(err);
                    return res.redirect("/");
                  });
              }
        } catch (err) {
            return next(err);
        }
      })
    
];

exports.sign_in_get = (req,res,next)=>{
    return res.render("sign-in",{
        title: "Log in",
        errors: req.flash("SignUpMessage"),
    })
}

exports.sign_in_post =  passport.authenticate(
    "local", {
        successRedirect: "/",
        failureRedirect: "/sign-in",
        failureFlash: true,
    }
);

exports.log_out = (req,res,next)=>{
    req.logout((err)=>{
      if(err){
        return next(err)
      }
      return res.redirect("/");
    })
}